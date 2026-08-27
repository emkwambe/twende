"""Seed script for development data — Tanzania demo tenant."""
from datetime import datetime, timezone
from uuid import uuid4

from auth_utils import get_password_hash
from config import settings
from country_config import CountryCode
from database import SessionLocal
from models import Group, Member, User


def seed(country: CountryCode = "TZ"):
    db = SessionLocal()
    try:
        # Demo user
        demo_phone = "+255712345678" if country == "TZ" else "+254712345678"
        user = db.query(User).filter(User.phone == demo_phone).first()
        if not user:
            user = User(
                id=uuid4(),
                phone=demo_phone,
                display_name="Wanjiku M.",
                pin_hash=get_password_hash(settings.DEMO_PIN),
                kyc_tier=2,
                kyc_verified_at=datetime.now(timezone.utc),
                national_id="12345678901234567890",
                credit_score=650,
                avatar="WM",
                role="admin",
                country=country,
            )
            db.add(user)
            db.commit()
            print(f"Created demo user {demo_phone} with PIN {settings.DEMO_PIN}")
        else:
            print(f"Demo user {demo_phone} already exists")

        # Demo group
        group_name = "Nyota VICOBA" if country == "TZ" else "Nyota Chama"
        group_type = "vicoba" if country == "TZ" else "chama"
        group = db.query(Group).filter(Group.name == group_name).first()
        if not group:
            group = Group(
                id=uuid4(),
                name=group_name,
                country=country,
                group_type=group_type,
                location="Dar es Salaam" if country == "TZ" else "Nairobi",
                region="Dar es Salaam" if country == "TZ" else "Nairobi",
                member_count=24,
                total_savings=1_152_000,
                interest_rate=10.0,
                meeting_frequency="weekly",
            )
            db.add(group)
            db.commit()
            print(f"Created demo group {group_name}")

        # Demo member linked to user
        member = db.query(Member).filter(Member.phone == demo_phone).first()
        if not member:
            member = Member(
                id=uuid4(),
                user_id=user.id,
                group_id=group.id,
                full_name="Wanjiku M.",
                phone=demo_phone,
                phone_provider="mpesa",
                national_id="12345678901234567890",
                savings_balance=48_000,
                credit_score=650,
                role="chair",
                country=country,
            )
            db.add(member)
            db.commit()
            print("Created demo group member")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
