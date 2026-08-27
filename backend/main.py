"""Twende FastAPI backend — auth, users, and group underwriting."""
import logging
from contextlib import asynccontextmanager
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import auth_service
from config import settings
from database import get_db
from dependencies import get_current_user
import ledger
from constitution import generate_constitution
from models import (
    Constitution,
    Group,
    LoanApplication,
    MeetingMinute,
    Member,
    Transaction,
    User,
)
from rbac import (
    GROUP_ROLE_HIERARCHY,
    GroupRole,
    get_group_membership,
    require_admin,
    require_group_role,
)
from schemas import (
    AuthResponse,
    ConstitutionResponse,
    LedgerResponse,
    GroupCreate,
    GroupResponse,
    KYCSubmitRequest,
    LoanApplicationCreate,
    LoanApplicationResponse,
    LoginRequest,
    MeetingMinuteCreate,
    MeetingMinuteResponse,
    MeetingMinuteUpdate,
    MemberCreate,
    MemberResponse,
    OTPVerifyRequest,
    PassbookResponse,
    PhoneRequest,
    RefreshRequest,
    QuarterlyReportResponse,
    RegistryExportResponse,
    RegistryMemberEntry,
    RegisterRequest,
    RepaymentCreate,
    RepaymentResponse,
    TransactionResponse,
    UserResponse,
    UserUpdate,
)
from underwriting import TanzanianUnderwritingEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Migrations are managed by Alembic; app startup does not auto-create tables."""
    logger.info("Twende backend starting up")
    yield
    logger.info("Twende backend shutting down")


app = FastAPI(title="Twende Backend", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


# ─── Health ─────────────────────────────────────────────────────────────────
@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "service": "Twende"}


# ─── Auth ───────────────────────────────────────────────────────────────────
@app.post("/api/v1/auth/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, payload)


@app.post("/api/v1/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, payload)


@app.post("/api/v1/auth/refresh")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_access_token(db, payload.refresh_token)


@app.post("/api/v1/auth/logout")
def logout(payload: RefreshRequest, db: Session = Depends(get_db)):
    return auth_service.logout(db, payload.refresh_token)


@app.post("/api/v1/auth/otp/send")
def send_otp(payload: PhoneRequest):
    return auth_service.send_otp(payload)


@app.post("/api/v1/auth/otp/verify")
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    return auth_service.verify_otp_and_provision(db, payload)


# ─── Users ──────────────────────────────────────────────────────────────────
@app.get("/api/v1/users/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@app.patch("/api/v1/users/me", response_model=UserResponse)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.display_name is not None:
        current_user.display_name = payload.display_name
    if payload.email is not None:
        current_user.email = payload.email
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@app.post("/api/v1/users/me/kyc", response_model=UserResponse)
def submit_kyc(
    payload: KYCSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return auth_service.upgrade_kyc_tier(db, current_user, [payload])


# ─── Groups ─────────────────────────────────────────────────────────────────
@app.post("/api/v1/groups", response_model=GroupResponse)
def create_group(
    payload: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = payload.model_dump()
    if not data.get("country"):
        data["country"] = current_user.country
    group = Group(**data)
    db.add(group)
    db.commit()
    db.refresh(group)

    # Creator becomes the chair of the group
    chair = Member(
        user_id=current_user.id,
        group_id=group.id,
        full_name=current_user.display_name,
        phone=current_user.phone,
        role=GroupRole.CHAIR,
    )
    db.add(chair)
    group.member_count = 1
    db.commit()
    db.refresh(group)
    return group


@app.get("/api/v1/groups", response_model=List[GroupResponse])
def list_groups(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Group).all()


@app.get("/api/v1/groups/my", response_model=List[GroupResponse])
def list_my_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    group_ids = [
        m.group_id for m in db.query(Member).filter(Member.user_id == current_user.id).all()
    ]
    return db.query(Group).filter(Group.id.in_(group_ids)).all()


# ─── Members ────────────────────────────────────────────────────────────────
@app.post("/api/v1/members", response_model=MemberResponse)
def create_member(
    payload: MemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    group = db.query(Group).filter(Group.id == payload.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Only group chairs, treasurers, or admins can invite members
    if current_user.role != "admin":
        membership = (
            db.query(Member)
            .filter(Member.group_id == payload.group_id, Member.user_id == current_user.id)
            .first()
        )
        if not membership or membership.role not in (GroupRole.CHAIR, GroupRole.TREASURER):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Group chair or treasurer access required",
            )

    data = payload.model_dump()

    # Baseline credit-score bump for formalization signals
    credit_score: Optional[int] = None
    if data.get("national_id"):
        credit_score = 650
        if data.get("tin_number"):
            credit_score += 50
    data["credit_score"] = credit_score

    if not data.get("country"):
        data["country"] = group.country
    member = Member(**data)
    db.add(member)
    group.member_count = (group.member_count or 0) + 1
    db.commit()
    db.refresh(member)
    return member


@app.get("/api/v1/groups/{group_id}/members", response_model=List[MemberResponse])
def list_members(
    group_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Ensure user is a member of this group or admin
    if current_user.role != "admin":
        membership = (
            db.query(Member)
            .filter(Member.group_id == group_id, Member.user_id == current_user.id)
            .first()
        )
        if not membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return db.query(Member).filter(Member.group_id == group_id).all()


# ─── Loan Applications ──────────────────────────────────────────────────────
@app.post("/api/v1/loans/apply", response_model=LoanApplicationResponse)
def apply_for_loan(
    payload: LoanApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member = db.query(Member).filter(Member.id == payload.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Users can only apply for loans tied to their own membership, unless admin
    if current_user.role != "admin" and str(member.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only apply for loans for your own membership",
        )

    group = db.query(Group).filter(Group.id == member.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    interest_rate = group.interest_rate or Decimal(str(settings.DEFAULT_INTEREST_RATE))
    total_repayment = money(payload.amount * (Decimal("1") + interest_rate / Decimal("100")))
    weekly_payment = money(total_repayment / Decimal(str(payload.repayment_weeks)))

    loan = LoanApplication(
        member_id=member.id,
        group_id=group.id,
        amount=payload.amount,
        purpose=payload.purpose,
        repayment_weeks=payload.repayment_weeks,
        interest_rate=interest_rate,
        weekly_payment=weekly_payment,
        total_repayment=total_repayment,
        status="pending",
        disbursement_method=member.phone_provider,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)

    # Run contextual underwriting engine
    result = TanzanianUnderwritingEngine.evaluate(member, group, loan)

    loan.status = result["decision"]
    loan.underwriting_score = result["score"]
    loan.underwriting_factors = result["factors"]
    loan.rejection_reasons = result["critical_failures"] or None

    # An approved loan is disbursed immediately: seed its outstanding balance
    # and write the disbursement into the group ledger (Sprint 14).
    if loan.status == "approved":
        loan.loan_balance = loan.total_repayment or loan.amount
        ledger.post_transaction(
            db,
            member=member,
            group=group,
            loan=loan,
            transaction_type=ledger.LOAN_DISBURSEMENT,
            amount=loan.amount,
            description=f"Mkopo umetolewa / Loan disbursed: {loan.purpose}",
            reference=f"LOAN-{str(loan.id)[:8].upper()}-DISBURSE",
            payment_method=member.phone_provider,
            # Cash out is the principal; the debt taken on is principal + interest.
            debt_delta=loan.loan_balance,
        )
    else:
        loan.loan_balance = Decimal("0.00")

    db.commit()
    db.refresh(loan)

    return _loan_response(loan)


@app.get("/api/v1/loans", response_model=List[LoanApplicationResponse])
def list_loans(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    loans = db.query(LoanApplication).all()
    return [_loan_response(loan) for loan in loans]


@app.get("/api/v1/loans/{loan_id}", response_model=LoanApplicationResponse)
def get_loan(
    loan_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loan = db.query(LoanApplication).filter(LoanApplication.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    if current_user.role != "admin":
        membership = (
            db.query(Member)
            .filter(Member.group_id == loan.group_id, Member.user_id == current_user.id)
            .first()
        )
        if not membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return _loan_response(loan)


def _loan_response(loan: LoanApplication) -> LoanApplicationResponse:
    return LoanApplicationResponse(
        id=loan.id,
        member_id=loan.member_id,
        group_id=loan.group_id,
        member_name=loan.member.full_name if loan.member else None,
        group_name=loan.group.name if loan.group else None,
        amount=loan.amount,
        purpose=loan.purpose,
        repayment_weeks=loan.repayment_weeks,
        interest_rate=loan.interest_rate,
        weekly_payment=loan.weekly_payment,
        total_repayment=loan.total_repayment,
        loan_balance=loan.loan_balance or Decimal("0.00"),
        status=loan.status,
        underwriting_score=loan.underwriting_score,
        underwriting_factors=loan.underwriting_factors,
        rejection_reasons=loan.rejection_reasons,
        disbursement_method=loan.disbursement_method,
        created_at=loan.created_at,
        updated_at=loan.updated_at,
    )


# ─── Group Formalization Toolkit (Sprint 13) ────────────────────────────────
def _get_group_or_404(db: Session, group_id: UUID) -> Group:
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


def _group_members(db: Session, group_id: UUID) -> List[Member]:
    return (
        db.query(Member)
        .filter(Member.group_id == group_id)
        .order_by(Member.created_at)
        .all()
    )


# ─── Feature 1: Digital Constitution ────────────────────────────────────────
@app.post(
    "/api/v1/groups/{group_id}/constitution/generate",
    response_model=ConstitutionResponse,
)
def generate_group_constitution(
    group_id: UUID,
    membership: Member = Depends(get_group_membership),
    db: Session = Depends(get_db),
):
    """Generate a bilingual Swahili/English constitution from group + member data."""
    group = _get_group_or_404(db, group_id)
    members = _group_members(db, group_id)

    constitution = Constitution(
        group_id=group.id,
        content=generate_constitution(group, members),
        status="draft",
    )
    db.add(constitution)
    db.commit()
    db.refresh(constitution)
    return constitution


@app.get("/api/v1/groups/{group_id}/constitution", response_model=ConstitutionResponse)
def get_group_constitution(
    group_id: UUID,
    membership: Member = Depends(get_group_membership),
    db: Session = Depends(get_db),
):
    """Return the most recently generated constitution for the group."""
    constitution = (
        db.query(Constitution)
        .filter(Constitution.group_id == group_id)
        .order_by(Constitution.created_at.desc())
        .first()
    )
    if not constitution:
        raise HTTPException(status_code=404, detail="No constitution found for this group")
    return constitution


@app.put(
    "/api/v1/groups/{group_id}/constitution/submit",
    response_model=ConstitutionResponse,
)
def submit_group_constitution(
    group_id: UUID,
    membership: Member = Depends(require_group_role(GroupRole.TREASURER)),
    db: Session = Depends(get_db),
):
    """Chair/treasurer submits the latest draft constitution for approval."""
    constitution = (
        db.query(Constitution)
        .filter(Constitution.group_id == group_id)
        .order_by(Constitution.created_at.desc())
        .first()
    )
    if not constitution:
        raise HTTPException(status_code=404, detail="No constitution found for this group")

    constitution.status = "submitted"
    db.commit()
    db.refresh(constitution)
    return constitution


# ─── Feature 2: Member Registry Export ──────────────────────────────────────
@app.get("/api/v1/groups/{group_id}/registry/export")
def export_group_registry(
    group_id: UUID,
    format: str = "json",
    membership: Member = Depends(get_group_membership),
    db: Session = Depends(get_db),
):
    """Export the group's member registry for ward/district registration."""
    fmt = (format or "json").lower()
    if fmt in ("pdf", "excel"):
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="PDF/Excel export coming in Sprint 14",
        )
    if fmt != "json":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="format must be one of: json, pdf, excel",
        )

    group = _get_group_or_404(db, group_id)
    members = _group_members(db, group_id)

    treasurer = next(
        (m for m in members if (m.role or "").lower() == GroupRole.TREASURER), None
    )

    return RegistryExportResponse(
        group_name=group.name,
        group_type=group.group_type,
        location=group.location,
        region=group.region,
        registration_date=group.created_at,
        member_count=group.member_count or len(members),
        total_savings=group.total_savings or Decimal("0.00"),
        chair_name=group.chair_name,
        treasurer_name=treasurer.full_name if treasurer else None,
        members=[
            RegistryMemberEntry(
                full_name=m.full_name,
                national_id=m.national_id,
                phone=m.phone,
                phone_provider=m.phone_provider,
                role=m.role,
                savings_balance=m.savings_balance or Decimal("0.00"),
                occupation=m.occupation,
                business_type=m.business_type,
            )
            for m in members
        ],
    )


# ─── Feature 3: Meeting Minutes ─────────────────────────────────────────────
@app.post("/api/v1/groups/{group_id}/minutes", response_model=MeetingMinuteResponse)
def create_meeting_minute(
    group_id: UUID,
    payload: MeetingMinuteCreate,
    membership: Member = Depends(require_group_role(GroupRole.TREASURER)),
    db: Session = Depends(get_db),
):
    """Open a blank minutes template, pre-filled with the active attendance roster."""
    _get_group_or_404(db, group_id)
    attendance = [
        m.full_name
        for m in _group_members(db, group_id)
        if (m.status or "active") == "active"
    ]

    minute = MeetingMinute(
        group_id=group_id,
        meeting_date=payload.meeting_date,
        attendance=attendance,
        agenda="",
        resolutions="",
    )
    db.add(minute)
    db.commit()
    db.refresh(minute)
    return minute


@app.get("/api/v1/groups/{group_id}/minutes", response_model=List[MeetingMinuteResponse])
def list_meeting_minutes(
    group_id: UUID,
    membership: Member = Depends(get_group_membership),
    db: Session = Depends(get_db),
):
    return (
        db.query(MeetingMinute)
        .filter(MeetingMinute.group_id == group_id)
        .order_by(MeetingMinute.meeting_date.desc())
        .all()
    )


@app.get(
    "/api/v1/groups/{group_id}/minutes/{minute_id}",
    response_model=MeetingMinuteResponse,
)
def get_meeting_minute(
    group_id: UUID,
    minute_id: UUID,
    membership: Member = Depends(get_group_membership),
    db: Session = Depends(get_db),
):
    return _get_minute_or_404(db, group_id, minute_id)


@app.put(
    "/api/v1/groups/{group_id}/minutes/{minute_id}",
    response_model=MeetingMinuteResponse,
)
def update_meeting_minute(
    group_id: UUID,
    minute_id: UUID,
    payload: MeetingMinuteUpdate,
    membership: Member = Depends(require_group_role(GroupRole.TREASURER)),
    db: Session = Depends(get_db),
):
    minute = _get_minute_or_404(db, group_id, minute_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(minute, field, value)
    db.commit()
    db.refresh(minute)
    return minute


def _get_minute_or_404(db: Session, group_id: UUID, minute_id: UUID) -> MeetingMinute:
    minute = (
        db.query(MeetingMinute)
        .filter(MeetingMinute.id == minute_id, MeetingMinute.group_id == group_id)
        .first()
    )
    if not minute:
        raise HTTPException(status_code=404, detail="Meeting minute not found")
    return minute


# ─── Financial Records Engine (Sprint 14) ───────────────────────────────────
def _require_group_access(
    db: Session,
    current_user: User,
    group_id: UUID,
    min_role: Optional[str] = None,
) -> Optional[Member]:
    """Group-scoped authorisation for routes whose path has no group_id.

    Mirrors rbac.require_group_role, which can only be used as a dependency on
    routes that take group_id as a path parameter.
    """
    if current_user.role == "admin":
        return None

    membership = (
        db.query(Member)
        .filter(Member.group_id == group_id, Member.user_id == current_user.id)
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group",
        )
    if min_role and GROUP_ROLE_HIERARCHY.get(membership.role, 0) < GROUP_ROLE_HIERARCHY.get(
        min_role, 0
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{min_role} role or higher required",
        )
    return membership


# ─── Step 2: Group ledger ───────────────────────────────────────────────────
@app.get("/api/v1/groups/{group_id}/ledger", response_model=LedgerResponse)
def get_group_ledger(
    group_id: UUID,
    membership: Member = Depends(get_group_membership),
    db: Session = Depends(get_db),
):
    """Weekly cash position for the group treasurer."""
    group = _get_group_or_404(db, group_id)
    return LedgerResponse(**ledger.build_ledger(db, group))


# ─── Step 3: Member pass book ───────────────────────────────────────────────
@app.get("/api/v1/members/{member_id}/passbook", response_model=PassbookResponse)
def get_member_passbook(
    member_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Digital pass book: every transaction for one member, newest first."""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Your own pass book needs no group role; anyone else needs treasurer or above.
    is_own = member.user_id is not None and str(member.user_id) == str(current_user.id)
    _require_group_access(
        db, current_user, member.group_id, None if is_own else GroupRole.TREASURER
    )

    transactions = (
        db.query(Transaction)
        .filter(Transaction.member_id == member_id)
        .order_by(Transaction.created_at.desc())
        .all()
    )
    group = db.query(Group).filter(Group.id == member.group_id).first()

    return PassbookResponse(
        member_id=member.id,
        member_name=member.full_name,
        group_id=member.group_id,
        group_name=group.name if group else "",
        national_id=member.national_id,
        savings_balance=member.savings_balance or Decimal("0.00"),
        loan_balance=member.loan_balance or Decimal("0.00"),
        transaction_count=len(transactions),
        transactions=[TransactionResponse.model_validate(t) for t in transactions],
    )


# ─── Step 4: Repayment tracking ─────────────────────────────────────────────
@app.post("/api/v1/loans/{loan_id}/repayment", response_model=RepaymentResponse)
def record_repayment(
    loan_id: UUID,
    payload: RepaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record a weekly loan repayment against the member's pass book."""
    loan = db.query(LoanApplication).filter(LoanApplication.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    member = db.query(Member).filter(Member.id == loan.member_id).first()
    group = db.query(Group).filter(Group.id == loan.group_id).first()
    if not member or not group:
        raise HTTPException(status_code=404, detail="Loan member or group not found")

    is_own = member.user_id is not None and str(member.user_id) == str(current_user.id)
    _require_group_access(
        db, current_user, loan.group_id, None if is_own else GroupRole.TREASURER
    )

    if loan.status not in ("approved", "active", "defaulted"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Loan is not repayable in status {loan.status}",
        )

    outstanding = ledger.money(loan.loan_balance or Decimal("0.00"))
    if outstanding <= Decimal("0.00"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loan is already fully repaid",
        )

    amount = ledger.money(payload.amount)
    if amount > outstanding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Amount exceeds outstanding balance of {outstanding}",
        )

    reference = f"LOAN-{str(loan.id)[:8].upper()}-WEEK-{payload.week_number}"
    txn = ledger.post_transaction(
        db,
        member=member,
        group=group,
        loan=loan,
        transaction_type=ledger.LOAN_REPAYMENT,
        amount=amount,
        description=f"Marejesho wiki {payload.week_number} / Repayment week {payload.week_number}",
        reference=reference,
        week_number=payload.week_number,
        payment_method=payload.payment_method,
        mpesa_receipt=payload.mpesa_receipt,
    )

    loan.loan_balance = ledger.money(outstanding - amount)
    if loan.loan_balance <= Decimal("0.00"):
        loan.status = "repaid"
        message = "Mkopo umelipwa kikamilifu / Loan fully repaid"
    elif ledger.is_defaulted(loan, payload.week_number):
        loan.status = "defaulted"
        message = "Mkopo umechelewa / Loan past grace window, marked defaulted"
    else:
        loan.status = "active"
        message = "Malipo yamepokelewa / Repayment recorded"

    db.commit()
    db.refresh(loan)
    db.refresh(txn)

    return RepaymentResponse(
        loan=_loan_response(loan),
        transaction=TransactionResponse.model_validate(txn),
        remaining_balance=loan.loan_balance,
        is_on_time=ledger.is_on_time(loan, txn),
        message=message,
    )


@app.get("/api/v1/loans/{loan_id}/repayments", response_model=List[TransactionResponse])
def list_repayments(
    loan_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loan = db.query(LoanApplication).filter(LoanApplication.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    _require_group_access(db, current_user, loan.group_id)

    return (
        db.query(Transaction)
        .filter(
            Transaction.loan_id == loan_id,
            Transaction.transaction_type == ledger.LOAN_REPAYMENT,
        )
        .order_by(Transaction.week_number, Transaction.created_at)
        .all()
    )


# ─── Step 5: Quarterly report ───────────────────────────────────────────────
@app.get(
    "/api/v1/groups/{group_id}/reports/quarterly",
    response_model=QuarterlyReportResponse,
)
def get_quarterly_report(
    group_id: UUID,
    membership: Member = Depends(get_group_membership),
    db: Session = Depends(get_db),
):
    group = _get_group_or_404(db, group_id)
    return QuarterlyReportResponse(**ledger.build_quarterly_report(db, group))
