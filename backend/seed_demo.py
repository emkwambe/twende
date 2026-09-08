"""Seed three demo borrowers with distinct underwriting profiles.

Auth is phone + PIN (there is no email/password login), so each demo account is
addressed by its phone number. All three share the PIN in settings.DEMO_PIN.

    Phone           PIN     Profile
    +255712345678   1234    Strong  — high savings, formalized, active + repaid loan
    +255713000002   1234    Middle  — moderate savings, no loans (empty state)
    +255713000003   1234    Weak    — thin savings, no NIDA, one rejected application

Run from the backend directory:  python seed_demo.py
Idempotent: re-running updates balances rather than creating duplicates.
"""
from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

import ledger
from auth_utils import get_password_hash
from config import settings
from database import SessionLocal
from models import Group, LoanApplication, Member, User
from underwriting import TanzanianUnderwritingEngine

PIN = settings.DEMO_PIN

PROFILES = [
    {
        "phone": "+255712345678",
        "display_name": "Wanjiku M.",
        "avatar": "WM",
        "role": "admin",
        "credit_score": 720,
        "kyc_tier": 3,
        "national_id": "1990-0101-99999-00001-00",
        "tin_number": "123-456-789",
        "brela_number": "BRELA-99881",
        "savings_balance": Decimal("2_400_000"),
        "member_role": "chair",
        "loans": [
            {"amount": Decimal("1_000_000"), "purpose": "business", "weeks": 24, "repay_weeks": 6},
            {"amount": Decimal("400_000"), "purpose": "business", "weeks": 12, "repay_weeks": 12},
        ],
    },
    {
        "phone": "+255713000002",
        "display_name": "Neema J.",
        "avatar": "NJ",
        "role": "user",
        "credit_score": 580,
        "kyc_tier": 2,
        "national_id": "1990-0101-99999-00002-00",
        "tin_number": None,
        "brela_number": None,
        "savings_balance": Decimal("600_000"),
        "member_role": "member",
        "loans": [],
    },
    {
        "phone": "+255713000003",
        "display_name": "Juma K.",
        "avatar": "JK",
        "role": "user",
        "credit_score": 420,
        "kyc_tier": 1,
        "national_id": None,  # no NIDA -> triggers the critical-check rejection
        "tin_number": None,
        "brela_number": None,
        "savings_balance": Decimal("80_000"),
        "member_role": "member",
        "loans": [
            {"amount": Decimal("900_000"), "purpose": "agriculture", "weeks": 8, "repay_weeks": 0},
        ],
    },
]


def _get_or_create_group(db) -> Group:
    group = db.query(Group).filter(Group.name == "Nyota VICOBA").first()
    if not group:
        group = Group(
            id=uuid4(),
            name="Nyota VICOBA",
            country="TZ",
            group_type="vicoba",
            location="Dar es Salaam",
            region="Dar es Salaam",
            member_count=0,
            total_savings=Decimal("23_040_000"),
            interest_rate=Decimal("10.0"),
            meeting_frequency="weekly",
        )
        db.add(group)
        db.commit()
        print("  created group Nyota VICOBA")
    return group


def _seed_loan(db, member: Member, group: Group, spec: dict) -> LoanApplication:
    """Create a loan, underwrite it for real, then apply the recorded repayments."""
    interest_rate = group.interest_rate or Decimal(str(settings.DEFAULT_INTEREST_RATE))
    total_repayment = (spec["amount"] * (Decimal("1") + interest_rate / Decimal("100"))).quantize(
        Decimal("0.01")
    )
    weekly_payment = (total_repayment / Decimal(spec["weeks"])).quantize(Decimal("0.01"))

    loan = LoanApplication(
        id=uuid4(),
        member_id=member.id,
        group_id=group.id,
        amount=spec["amount"],
        purpose=spec["purpose"],
        repayment_weeks=spec["weeks"],
        interest_rate=interest_rate,
        weekly_payment=weekly_payment,
        total_repayment=total_repayment,
        status="pending",
        disbursement_method=member.phone_provider,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)

    # Run the real engine so seeded scores match what the API would produce.
    result = TanzanianUnderwritingEngine.evaluate(member, group, loan)
    loan.status = result["decision"]
    loan.underwriting_score = result["score"]
    loan.underwriting_factors = result["factors"]
    loan.rejection_reasons = result["critical_failures"] or None

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
            debt_delta=loan.loan_balance,
        )
        db.commit()

        for week in range(1, spec["repay_weeks"] + 1):
            if (loan.loan_balance or Decimal("0")) <= 0:
                break
            pay = min(weekly_payment, loan.loan_balance)
            ledger.post_transaction(
                db,
                member=member,
                group=group,
                loan=loan,
                transaction_type=ledger.LOAN_REPAYMENT,
                amount=pay,
                description=f"Marejesho / Repayment week {week}",
                reference=f"LOAN-{str(loan.id)[:8].upper()}-W{week}",
                payment_method=member.phone_provider,
                debt_delta=-pay,
            )
            loan.loan_balance = (loan.loan_balance or Decimal("0")) - pay
            db.commit()

        if (loan.loan_balance or Decimal("0")) <= 0:
            loan.status = "repaid"
            loan.loan_balance = Decimal("0.00")
    else:
        loan.loan_balance = Decimal("0.00")

    db.commit()
    db.refresh(loan)
    return loan


def seed_demo() -> None:
    db = SessionLocal()
    try:
        group = _get_or_create_group(db)

        for p in PROFILES:
            print(f"\n{p['phone']}  ({p['display_name']})")
            user = db.query(User).filter(User.phone == p["phone"]).first()
            if not user:
                user = User(
                    id=uuid4(),
                    phone=p["phone"],
                    display_name=p["display_name"],
                    pin_hash=get_password_hash(PIN),
                    kyc_tier=p["kyc_tier"],
                    kyc_verified_at=datetime.now(timezone.utc) if p["kyc_tier"] > 1 else None,
                    national_id=p["national_id"],
                    credit_score=p["credit_score"],
                    avatar=p["avatar"],
                    role=p["role"],
                    country="TZ",
                )
                db.add(user)
                db.commit()
                print("  created user")
            else:
                user.credit_score = p["credit_score"]
                user.kyc_tier = p["kyc_tier"]
                db.commit()
                print("  user exists — refreshed score/tier")

            member = db.query(Member).filter(Member.phone == p["phone"]).first()
            if not member:
                member = Member(
                    id=uuid4(),
                    user_id=user.id,
                    group_id=group.id,
                    full_name=p["display_name"],
                    phone=p["phone"],
                    phone_provider="mpesa",
                    national_id=p["national_id"],
                    tin_number=p["tin_number"],
                    brela_number=p["brela_number"],
                    savings_balance=p["savings_balance"],
                    credit_score=p["credit_score"],
                    role=p["member_role"],
                    country="TZ",
                )
                db.add(member)
                group.member_count = (group.member_count or 0) + 1
                db.commit()
                print("  created member")
            else:
                member.savings_balance = p["savings_balance"]
                db.commit()
                print("  member exists — refreshed savings")

            # Top up to the spec rather than skipping wholesale, so a member
            # carrying loans from earlier testing still gains the demo set.
            existing = db.query(LoanApplication).filter(
                LoanApplication.member_id == member.id
            ).count()
            if existing:
                print(f"  {existing} existing loan(s) kept")
            todo = p["loans"][max(0, existing - 1):] if existing else p["loans"]

            for spec in todo:
                loan = _seed_loan(db, member, group, spec)
                print(
                    f"  loan {spec['amount']:>12,} {spec['purpose']:<12} "
                    f"-> {loan.status:<9} score {loan.underwriting_score}"
                )
            if not p["loans"]:
                print("  no loans (empty-state demo)")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo()
    print(f"\nAll demo accounts use PIN {PIN}")
