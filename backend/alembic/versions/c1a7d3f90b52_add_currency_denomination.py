"""Add currency denomination to every money-bearing table

Thirteen money columns across five tables were bare Numeric(12, 2) with the
denomination implicit in the fact that every row was Tanzanian. That is safe only
while one market exists. TZS 1,000,000 and KES 50,000 are near-equal in value and
twentyfold apart as numbers, so once both share a column the resulting totals are
wrong in a way that looks entirely plausible.

Applied in three steps so no row is ever left undenominated:
  1. add the column nullable
  2. backfill — every existing row predates multi-country, so all are TZS
  3. enforce NOT NULL

Backfill derives from the row's own country where the table has one, rather than
assuming TZS globally, so the migration stays correct if a non-TZ row was created
before this ran.

Revision ID: c1a7d3f90b52
Revises: bf94de766136
"""
from alembic import op
import sqlalchemy as sa

revision = "c1a7d3f90b52"
down_revision = "bf94de766136"
branch_labels = None
depends_on = None

# Tables gaining a currency, and how each one's denomination is derived.
# Kept in one place so the upgrade, backfill and downgrade cannot drift apart.
TABLES = ("groups", "members", "loan_applications", "mobile_money_statements", "transactions")

# Country -> currency. Deliberately literal rather than imported from the country
# pack: a migration must keep producing the same result years from now, even if
# the pack's values change.
COUNTRY_CURRENCY = {"TZ": "TZS", "KE": "KES", "UG": "UGX", "RW": "RWF"}


def upgrade() -> None:
    # ── 1. Add nullable ──────────────────────────────────────────────────────
    for table in TABLES:
        with op.batch_alter_table(table) as batch:
            batch.add_column(sa.Column("currency", sa.String(3), nullable=True))

    # ── 2. Backfill ──────────────────────────────────────────────────────────
    # Tables carrying their own country resolve from it.
    for table in ("groups", "members"):
        for country, currency in COUNTRY_CURRENCY.items():
            op.execute(
                sa.text(
                    f"UPDATE {table} SET currency = :cur "
                    "WHERE currency IS NULL AND country = :country"
                ).bindparams(cur=currency, country=country)
            )

    # Loans and transactions inherit from their group, which is the entity whose
    # denomination they are actually in.
    op.execute(
        sa.text(
            "UPDATE loan_applications SET currency = "
            "(SELECT g.currency FROM groups g WHERE g.id = loan_applications.group_id) "
            "WHERE currency IS NULL"
        )
    )
    op.execute(
        sa.text(
            "UPDATE transactions SET currency = "
            "(SELECT g.currency FROM groups g WHERE g.id = transactions.group_id) "
            "WHERE currency IS NULL"
        )
    )
    # Statements inherit from their member.
    op.execute(
        sa.text(
            "UPDATE mobile_money_statements SET currency = "
            "(SELECT m.currency FROM members m WHERE m.id = mobile_money_statements.member_id) "
            "WHERE currency IS NULL"
        )
    )

    # Anything still null is an orphan row whose parent has gone. Default it to
    # TZS rather than fail the migration — every such row predates multi-country.
    for table in TABLES:
        op.execute(sa.text(f"UPDATE {table} SET currency = 'TZS' WHERE currency IS NULL"))

    # ── 3. Enforce ───────────────────────────────────────────────────────────
    for table in TABLES:
        with op.batch_alter_table(table) as batch:
            batch.alter_column(
                "currency",
                existing_type=sa.String(3),
                nullable=False,
                server_default="TZS",
            )


def downgrade() -> None:
    for table in TABLES:
        with op.batch_alter_table(table) as batch:
            batch.drop_column("currency")
