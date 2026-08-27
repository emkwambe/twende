"""Authentication utilities: password hashing, JWT, OTP."""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _create_token(
    data: dict,
    expires_delta: timedelta,
    token_type: str,
) -> tuple[str, datetime]:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + expires_delta
    to_encode.update({"exp": expire, "iat": now, "type": token_type})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt, expire


def create_access_token(user_id: str, phone: str, kyc_tier: int) -> tuple[str, datetime]:
    return _create_token(
        {"sub": user_id, "phone": phone, "kyc": kyc_tier},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "access",
    )


def create_refresh_token(user_id: str) -> tuple[str, datetime]:
    return _create_token(
        {"sub": user_id, "type": "refresh"},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        "refresh",
    )


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def generate_otp(length: int = settings.OTP_LENGTH) -> str:
    """Generate a numeric OTP. In dev mode, the configured demo OTP is returned."""
    if settings.OTP_LENGTH == 6 and settings.DEMO_OTP:
        return settings.DEMO_OTP
    return "".join(secrets.choice("0123456789") for _ in range(length))
