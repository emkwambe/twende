"""Authentication service layer."""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from auth_utils import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_otp,
    get_password_hash,
    verify_password,
)
from config import settings
from models import KYCDocument, Session as UserSession, User
from schemas import (
    AuthResponse,
    KYCTier1Data,
    LoginRequest,
    OTPVerifyRequest,
    PhoneRequest,
    RegisterRequest,
    TokenPair,
    UserResponse,
)

# In-memory OTP store: phone -> {"otp": str, "expires_at": datetime, "attempts": int}
# Replace with Redis in production.
_otp_store: dict[str, dict] = {}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _cleanup_otp(phone: str) -> None:
    _otp_store.pop(phone, None)


def send_otp(payload: PhoneRequest) -> dict:
    """Generate and "send" an OTP. In development, the OTP is logged."""
    otp = generate_otp()
    expires_at = _now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    _otp_store[payload.phone] = {
        "otp": otp,
        "expires_at": expires_at,
        "attempts": 0,
    }
    # TODO: integrate SMS gateway (Twilio, Africa's Talking, etc.)
    print(f"[MOCK OTP] Code for {payload.phone}: {otp}")
    return {
        "phone": payload.phone,
        "expires_in_minutes": settings.OTP_EXPIRE_MINUTES,
        "dev_otp": otp,
    }


def _verify_otp_code(phone: str, otp: str) -> bool:
    record = _otp_store.get(phone)
    if not record:
        return False
    if _now() > record["expires_at"]:
        _cleanup_otp(phone)
        return False
    if record["attempts"] >= 3:
        _cleanup_otp(phone)
        return False
    record["attempts"] += 1
    if record["otp"] != otp:
        return False
    _cleanup_otp(phone)
    return True


def _user_response(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


def _token_response(user: User) -> AuthResponse:
    access_token, access_expires = create_access_token(
        str(user.id), user.phone, user.kyc_tier
    )
    refresh_token, refresh_expires = create_refresh_token(str(user.id))
    return AuthResponse(
        user=_user_response(user),
        tokens=TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=access_expires,
        ),
    )


def register(db: Session, payload: RegisterRequest) -> AuthResponse:
    existing = db.query(User).filter(User.phone == payload.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number already registered",
        )

    kyc = payload.kyc
    dob: Optional[datetime] = None
    if kyc.date_of_birth:
        try:
            dob = datetime.strptime(kyc.date_of_birth, "%Y-%m-%d").replace(
                tzinfo=timezone.utc
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="date_of_birth must be YYYY-MM-DD",
            )

    avatar = "".join(part[0].upper() for part in kyc.full_name.split()[:2])

    user = User(
        id=uuid4(),
        phone=payload.phone,
        display_name=kyc.full_name,
        pin_hash=get_password_hash(payload.pin),
        kyc_tier=1,
        national_id=kyc.national_id,
        date_of_birth=dob,
        avatar=avatar,
        country=payload.country.upper() if payload.country else "TZ",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _token_response(user)


def verify_otp_and_provision(
    db: Session, payload: OTPVerifyRequest
) -> dict:
    """Verify an OTP. Used during registration/login flows."""
    if not _verify_otp_code(payload.phone, payload.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )
    return {"phone": payload.phone, "verified": True}


def login(db: Session, payload: LoginRequest) -> AuthResponse:
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user or not verify_password(payload.pin, user.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone or PIN",
        )
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended",
        )

    # Persist refresh token
    refresh_token, refresh_expires = create_refresh_token(str(user.id))
    session = UserSession(
        id=uuid4(),
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=refresh_expires,
    )
    db.add(session)
    db.commit()

    access_token, access_expires = create_access_token(
        str(user.id), user.phone, user.kyc_tier
    )
    return AuthResponse(
        user=_user_response(user),
        tokens=TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=access_expires,
        ),
    )


def refresh_access_token(db: Session, refresh_token: str) -> TokenPair:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    session = (
        db.query(UserSession)
        .filter(
            UserSession.refresh_token == refresh_token,
            UserSession.expires_at > _now(),
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked or expired",
        )

    user = session.user
    access_token, access_expires = create_access_token(
        str(user.id), user.phone, user.kyc_tier
    )
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_at=access_expires,
    )


def logout(db: Session, refresh_token: Optional[str]) -> dict:
    if refresh_token:
        db.query(UserSession).filter(
            UserSession.refresh_token == refresh_token
        ).delete()
        db.commit()
    return {"message": "Logged out successfully"}


def get_current_user(db: Session, token: str) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def upgrade_kyc_tier(
    db: Session, user: User, documents: list[KYCDocument]
) -> UserResponse:
    """Simulated KYC Tier 2 upgrade: store docs and bump tier."""
    for doc in documents:
        db_doc = KYCDocument(
            id=uuid4(),
            user_id=user.id,
            document_type=doc.document_type,
            document_url=doc.document_url,
            verification_status="pending",
        )
        db.add(db_doc)

    # In a real system, these would be reviewed asynchronously.
    if user.kyc_tier < 2:
        user.kyc_tier = 2
        user.kyc_verified_at = _now()

    db.commit()
    db.refresh(user)
    return _user_response(user)
