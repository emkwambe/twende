"""Assert no money row is undenominated, and none disagrees with its parent.

Run after a migration, after a restore, and in CI against a seeded database.
Exits non-zero on any violation so it can gate a pipeline.

    python scripts/verify_currency_integrity.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text  # noqa: E402

from country_packs import PACKS  # noqa: E402
from database import SessionLocal  # noqa: E402

MONEY_TABLES = (
    "groups",
    "members",
    "loan_applications",
    "mobile_money_statements",
    "transactions",
)

# Rows whose denomination must match the parent they inherit it from.
INHERITANCE = (
    ("members", "groups", "group_id", "a member's money is in its group's currency"),
    ("loan_applications", "groups", "group_id", "a loan is in its group's currency"),
    ("transactions", "groups", "group_id", "a ledger entry is in its group's currency"),
    ("mobile_money_statements", "members", "member_id", "a statement follows its member"),
)


def main() -> int:
    db = SessionLocal()
    problems: list[str] = []
    try:
        # 1. Nothing undenominated.
        for table in MONEY_TABLES:
            n = db.execute(
                text(f"SELECT COUNT(*) FROM {table} WHERE currency IS NULL OR currency = ''")
            ).scalar()
            status = "ok" if not n else f"{n} UNDENOMINATED"
            print(f"  {table:26} {status}")
            if n:
                problems.append(f"{table}: {n} row(s) with no currency")

        # 2. Nothing disagreeing with its parent.
        print()
        for child, parent, fk, why in INHERITANCE:
            n = db.execute(
                text(
                    f"SELECT COUNT(*) FROM {child} c JOIN {parent} p ON p.id = c.{fk} "
                    "WHERE c.currency <> p.currency"
                )
            ).scalar()
            status = "ok" if not n else f"{n} MISMATCHED"
            print(f"  {child:26} vs {parent:20} {status}   ({why})")
            if n:
                problems.append(f"{child} vs {parent}: {n} row(s) disagree")

        # 3. Every currency in use is one a country pack declares.
        print()
        known = {p.CURRENCY for p in PACKS.values()}
        for table in MONEY_TABLES:
            rows = db.execute(
                text(f"SELECT DISTINCT currency FROM {table} WHERE currency IS NOT NULL")
            ).scalars().all()
            unknown = set(rows) - known
            print(f"  {table:26} currencies in use: {sorted(rows) or '—'}")
            if unknown:
                problems.append(f"{table}: currency not backed by any pack: {sorted(unknown)}")
    finally:
        db.close()

    print()
    if problems:
        print(f"FAIL — {len(problems)} problem(s):")
        for p in problems:
            print(f"  - {p}")
        return 1
    print("PASS — every money row is denominated and agrees with its parent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
