"""SQLAlchemy models for the Twende backend."""
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import relationship

from database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    """Platform identity shared across all Twende products."""

    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    pin_hash = Column(String(255), nullable=False)
    kyc_tier = Column(Integer, nullable=False, default=1)
    kyc_verified_at = Column(DateTime(timezone=True), nullable=True)
    national_id = Column(String(50), nullable=True)  # NIDA, Huduma Namba, etc.
    date_of_birth = Column(DateTime(timezone=True), nullable=True)
    credit_score = Column(Integer, nullable=False, default=300)
    avatar = Column(String(10), nullable=False, default="")
    country = Column(String(2), nullable=False, default="TZ")  # KE, TZ
    role = Column(String(20), nullable=False, default="user")  # user, admin, agent
    status = Column(String(20), nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    kyc_documents = relationship(
        "KYCDocument", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User id={self.id} phone={self.phone}>"


class Session(Base):
    """Refresh token store."""

    __tablename__ = "sessions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    refresh_token = Column(String(500), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    device_info = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<Session id={self.id} user_id={self.user_id}>"


class KYCDocument(Base):
    """Uploaded KYC documents (ID front/back, selfie, etc.)."""

    __tablename__ = "kyc_documents"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(50), nullable=False)  # id_front, id_back, selfie, etc.
    document_url = Column(String(500), nullable=False)
    verification_status = Column(String(20), nullable=False, default="pending")
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="kyc_documents")

    def __repr__(self):
        return f"<KYCDocument id={self.id} type={self.document_type}>"


class Group(Base):
    """VICOBA, Upatu, SACCO, or other informal savings group."""

    __tablename__ = "groups"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    country = Column(String(2), nullable=False, default="TZ")  # KE, TZ
    group_type = Column(String, default="vicoba")  # vicoba, upatu, sacco, other
    location = Column(String, nullable=True)  # ward/village level
    region = Column(String, nullable=True)
    member_count = Column(Integer, default=0)
    total_savings = Column(Numeric(12, 2), default=Decimal("0.00"))
    interest_rate = Column(Numeric(5, 2), default=Decimal("10.00"))
    meeting_frequency = Column(String, default="weekly")  # weekly, biweekly, monthly
    chair_name = Column(String, nullable=True)
    treasurer_phone = Column(String, nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    members = relationship("Member", back_populates="group", cascade="all, delete-orphan")
    loan_applications = relationship("LoanApplication", back_populates="group")
    constitutions = relationship(
        "Constitution", back_populates="group", cascade="all, delete-orphan"
    )
    meeting_minutes = relationship(
        "MeetingMinute", back_populates="group", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "Transaction", back_populates="group", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Group id={self.id} name={self.name} type={self.group_type}>"


class Member(Base):
    """Link between a User and a savings group."""

    __tablename__ = "members"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    group_id = Column(Uuid(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    country = Column(String(2), nullable=False, default="TZ")
    full_name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    phone_provider = Column(String, nullable=True)
    secondary_phone = Column(String, nullable=True)
    national_id = Column(String, unique=True, nullable=True)
    tin_number = Column(String, unique=True, nullable=True)
    brela_number = Column(String, nullable=True)
    nssf_number = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    business_type = Column(String, nullable=True)
    savings_balance = Column(Numeric(12, 2), default=Decimal("0.00"))
    loan_balance = Column(Numeric(12, 2), default=Decimal("0.00"))
    credit_score = Column(Integer, nullable=True)
    role = Column(String(20), nullable=False, default="member")  # member, treasurer, chair
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", backref="memberships")
    group = relationship("Group", back_populates="members")
    loan_applications = relationship("LoanApplication", back_populates="member")
    mobile_money_statements = relationship("MobileMoneyStatement", back_populates="member")
    transactions = relationship(
        "Transaction", back_populates="member", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Member id={self.id} name={self.full_name}>"


class LoanApplication(Base):
    """Loan application underwritten by the contextual engine."""

    __tablename__ = "loan_applications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(Uuid(as_uuid=True), ForeignKey("members.id"), nullable=False)
    group_id = Column(Uuid(as_uuid=True), ForeignKey("groups.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    purpose = Column(String, nullable=False)
    repayment_weeks = Column(Integer, nullable=False)
    interest_rate = Column(Numeric(5, 2), default=Decimal("10.00"))
    weekly_payment = Column(Numeric(12, 2), nullable=True)
    total_repayment = Column(Numeric(12, 2), nullable=True)
    # Outstanding balance on this loan; seeded to total_repayment on disbursement.
    loan_balance = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    status = Column(String, default="pending")
    underwriting_score = Column(Float, nullable=True)
    underwriting_factors = Column(JSON, nullable=True)
    rejection_reasons = Column(JSON, nullable=True)
    disbursement_method = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    member = relationship("Member", back_populates="loan_applications")
    group = relationship("Group", back_populates="loan_applications")
    transactions = relationship("Transaction", back_populates="loan")

    def __repr__(self):
        return f"<LoanApplication id={self.id} amount={self.amount} status={self.status}>"


class MobileMoneyStatement(Base):
    """Extracted mobile money statement for cash-flow scoring."""

    __tablename__ = "mobile_money_statements"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(Uuid(as_uuid=True), ForeignKey("members.id"), nullable=False)
    provider = Column(String, nullable=False)
    statement_period = Column(String, nullable=True)
    total_inflow = Column(Numeric(12, 2), default=Decimal("0.00"))
    total_outflow = Column(Numeric(12, 2), default=Decimal("0.00"))
    net_flow = Column(Numeric(12, 2), default=Decimal("0.00"))
    avg_weekly_inflow = Column(Numeric(12, 2), default=Decimal("0.00"))
    confidence = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    member = relationship("Member", back_populates="mobile_money_statements")

    def __repr__(self):
        return f"<MobileMoneyStatement id={self.id} provider={self.provider}>"


class Constitution(Base):
    """Auto-generated group constitution (katiba) in Swahili/English."""

    __tablename__ = "constitutions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(
        Uuid(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False
    )
    content = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="draft")  # draft, submitted, approved
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    group = relationship("Group", back_populates="constitutions")

    def __repr__(self):
        return f"<Constitution id={self.id} group_id={self.group_id} status={self.status}>"


class MeetingMinute(Base):
    """Minutes (kumbukumbu) for a single group meeting."""

    __tablename__ = "meeting_minutes"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(
        Uuid(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False
    )
    meeting_date = Column(Date, nullable=False)
    attendance = Column(JSON, nullable=True)  # list of member names present
    agenda = Column(Text, nullable=False, default="")
    resolutions = Column(Text, nullable=False, default="")
    chair_signature = Column(String(100), nullable=True)
    treasurer_signature = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    group = relationship("Group", back_populates="meeting_minutes")

    def __repr__(self):
        return f"<MeetingMinute id={self.id} group_id={self.group_id} date={self.meeting_date}>"


class Transaction(Base):
    """Digital pass book entry — replaces the paper VICOBA passbook.

    Every movement of money in a group is one immutable row here; `balance_after`
    is the member's running savings balance at the moment it was recorded.
    """

    __tablename__ = "transactions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(
        Uuid(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True
    )
    group_id = Column(
        Uuid(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True
    )
    loan_id = Column(
        Uuid(as_uuid=True), ForeignKey("loan_applications.id"), nullable=True, index=True
    )
    # share_purchase, loan_disbursement, loan_repayment, interest_earned, penalty, withdrawal
    transaction_type = Column(String(20), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    balance_after = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    description = Column(String(255), nullable=True)
    reference = Column(String(100), nullable=True)  # e.g. LOAN-ABC123-WEEK-5
    week_number = Column(Integer, nullable=True)  # loan repayments only
    payment_method = Column(String(20), nullable=True)  # mpesa, mixx, cash, bank
    mpesa_receipt = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    member = relationship("Member", back_populates="transactions")
    group = relationship("Group", back_populates="transactions")
    loan = relationship("LoanApplication", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction id={self.id} type={self.transaction_type} amount={self.amount}>"
