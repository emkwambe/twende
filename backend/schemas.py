"""Pydantic v2 request/response models for Twende."""
import re
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from country_config import NIDA_REGEX


# ─── Auth ───────────────────────────────────────────────────────────────────
class PhoneRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)


class OTPVerifyRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=4, max_length=6)


class KYCTier1Data(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    national_id: Optional[str] = Field(None, max_length=50)
    date_of_birth: Optional[str] = None  # ISO date string


class RegisterRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    pin: str = Field(..., min_length=4, max_length=6)
    country: str = "TZ"
    kyc: KYCTier1Data


class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    pin: str = Field(..., min_length=4, max_length=6)


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_at: datetime


class AuthResponse(BaseModel):
    user: "UserResponse"
    tokens: TokenPair


# ─── Users ──────────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    phone: str
    display_name: str
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    pin: str
    country: str = "TZ"
    national_id: Optional[str] = None
    date_of_birth: Optional[datetime] = None


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: UUID
    phone: str
    display_name: str
    email: Optional[str]
    kyc_tier: int
    kyc_verified_at: Optional[datetime]
    national_id: Optional[str]
    date_of_birth: Optional[datetime]
    credit_score: int
    avatar: str
    role: str
    country: str
    status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class KYCSubmitRequest(BaseModel):
    document_type: str = Field(..., max_length=50)
    document_url: str = Field(..., max_length=500)


class KYCDocumentResponse(BaseModel):
    id: UUID
    user_id: UUID
    document_type: str
    document_url: str
    verification_status: str
    verified_at: Optional[datetime]
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


# ─── Groups ─────────────────────────────────────────────────────────────────
class GroupCreate(BaseModel):
    name: str
    country: str = "TZ"
    group_type: str = "vicoba"
    location: Optional[str] = None
    region: Optional[str] = None
    member_count: int = 0
    total_savings: Decimal = Decimal("0.00")
    interest_rate: Decimal = Decimal("10.00")
    meeting_frequency: str = "weekly"
    chair_name: Optional[str] = None
    treasurer_phone: Optional[str] = None
    status: str = "active"


class GroupResponse(BaseModel):
    id: UUID
    name: str
    country: str
    group_type: str
    location: Optional[str]
    region: Optional[str]
    member_count: int
    total_savings: Decimal
    interest_rate: Decimal
    meeting_frequency: str
    chair_name: Optional[str]
    treasurer_phone: Optional[str]
    status: str
    created_at: Optional[Any]
    updated_at: Optional[Any]

    model_config = ConfigDict(from_attributes=True)


# ─── Members ────────────────────────────────────────────────────────────────
class MemberCreate(BaseModel):
    group_id: UUID
    country: str = "TZ"
    full_name: str
    phone: str
    phone_provider: Optional[str] = None
    secondary_phone: Optional[str] = None
    national_id: Optional[str] = None
    tin_number: Optional[str] = None
    brela_number: Optional[str] = None
    nssf_number: Optional[str] = None
    occupation: Optional[str] = None
    business_type: Optional[str] = None
    savings_balance: Decimal = Decimal("0.00")
    loan_balance: Decimal = Decimal("0.00")
    credit_score: Optional[int] = None
    role: str = "member"
    status: str = "active"

    @field_validator("national_id")
    @classmethod
    def validate_nida(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.match(NIDA_REGEX, v):
            raise ValueError("Invalid NIDA format. Expected: YYYY-MMDD-XXXXX-XXXXX-XX")
        return v


class MemberResponse(BaseModel):
    id: UUID
    group_id: UUID
    country: str
    full_name: str
    phone: str
    phone_provider: Optional[str]
    secondary_phone: Optional[str]
    national_id: Optional[str]
    tin_number: Optional[str]
    brela_number: Optional[str]
    nssf_number: Optional[str]
    occupation: Optional[str]
    business_type: Optional[str]
    savings_balance: Decimal
    loan_balance: Decimal
    credit_score: Optional[int]
    role: str
    status: str
    created_at: Optional[Any]

    model_config = ConfigDict(from_attributes=True)


# ─── Loan Applications ──────────────────────────────────────────────────────
class LoanApplicationCreate(BaseModel):
    member_id: UUID
    amount: Decimal
    purpose: str
    repayment_weeks: int


class LoanApplicationResponse(BaseModel):
    id: UUID
    member_id: UUID
    group_id: UUID
    member_name: Optional[str]
    group_name: Optional[str]
    amount: Decimal
    purpose: str
    repayment_weeks: int
    interest_rate: Decimal
    weekly_payment: Optional[Decimal]
    total_repayment: Optional[Decimal]
    status: str
    underwriting_score: Optional[float]
    underwriting_factors: Optional[dict]
    rejection_reasons: Optional[list]
    disbursement_method: Optional[str]
    created_at: Optional[Any]
    updated_at: Optional[Any]

    model_config = ConfigDict(from_attributes=True)


# ─── Constitution ───────────────────────────────────────────────────────────
class ConstitutionCreate(BaseModel):
    """No input required — the constitution is generated from group + member data."""


class ConstitutionResponse(BaseModel):
    id: UUID
    group_id: UUID
    content: str
    status: str
    created_at: Optional[Any]
    updated_at: Optional[Any]

    model_config = ConfigDict(from_attributes=True)


# ─── Meeting Minutes ────────────────────────────────────────────────────────
class MeetingMinuteCreate(BaseModel):
    meeting_date: date
    # Optional: the authoritative group_id comes from the URL path.
    group_id: Optional[UUID] = None


class MeetingMinuteUpdate(BaseModel):
    agenda: Optional[str] = None
    resolutions: Optional[str] = None
    chair_signature: Optional[str] = Field(None, max_length=100)
    treasurer_signature: Optional[str] = Field(None, max_length=100)


class MeetingMinuteResponse(BaseModel):
    id: UUID
    group_id: UUID
    meeting_date: date
    attendance: Optional[list]
    agenda: str
    resolutions: str
    chair_signature: Optional[str]
    treasurer_signature: Optional[str]
    created_at: Optional[Any]
    updated_at: Optional[Any]

    model_config = ConfigDict(from_attributes=True)


# ─── Registry Export ────────────────────────────────────────────────────────
class RegistryMemberEntry(BaseModel):
    full_name: str
    national_id: Optional[str]
    phone: str
    phone_provider: Optional[str]
    role: str
    savings_balance: Decimal
    occupation: Optional[str]
    business_type: Optional[str]


class RegistryExportResponse(BaseModel):
    group_name: str
    group_type: str
    location: Optional[str]
    region: Optional[str]
    registration_date: Optional[Any]
    member_count: int
    total_savings: Decimal
    chair_name: Optional[str]
    treasurer_name: Optional[str]
    members: list[RegistryMemberEntry]


# Forward reference resolution
AuthResponse.model_rebuild()
