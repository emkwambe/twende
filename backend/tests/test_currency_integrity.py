"""Currency denomination integrity — Sprint 16 Phase 0.

Two things are under test:

  1. ``Money`` refuses to exist without a currency and refuses to mix them.
  2. The write and scoring paths refuse to produce or interpret a
     mixed-denomination record.

The point of all of it is that the failure mode being defended against is
*silent*: a cross-currency sum returns a plausible number rather than an error.
So every test here asserts that something **raises**, not that it computes.
"""
import sys
from decimal import Decimal
from pathlib import Path
from uuid import uuid4

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from models import Group, LoanApplication, Member  # noqa: E402
from money import (  # noqa: E402
    CurrencyMismatch,
    KNOWN_CURRENCIES,
    MissingCurrency,
    Money,
    money_sum,
    zero,
)
from underwriting import TanzanianUnderwritingEngine  # noqa: E402


# ─── The value type ─────────────────────────────────────────────────────────
class TestMoneyConstruction:
    def test_requires_a_currency(self):
        with pytest.raises(MissingCurrency):
            Money("1000", "")

    def test_rejects_unknown_currency(self):
        with pytest.raises(ValueError):
            Money("1000", "XXX")

    def test_normalises_case(self):
        assert Money("1000", "tzs").currency == "TZS"

    def test_quantises_to_two_places(self):
        assert Money("1000.005", "TZS").amount == Decimal("1000.01")

    def test_float_input_does_not_drift(self):
        # 0.1 + 0.2 is the canonical float trap; via str() it must land on 0.30.
        assert (Money(0.1, "TZS") + Money(0.2, "TZS")).amount == Decimal("0.30")


class TestMoneyArithmetic:
    def test_adds_within_a_currency(self):
        assert Money("1000", "TZS") + Money("500", "TZS") == Money("1500", "TZS")

    @pytest.mark.parametrize("op", ["add", "sub", "lt", "gt"])
    def test_refuses_to_mix_currencies(self, op):
        tzs, kes = Money("1000", "TZS"), Money("500", "KES")
        with pytest.raises(CurrencyMismatch):
            {"add": lambda: tzs + kes,
             "sub": lambda: tzs - kes,
             "lt": lambda: tzs < kes,
             "gt": lambda: tzs > kes}[op]()

    def test_ratio_of_same_currency_is_dimensionless(self):
        # This is the shape every underwriting ratio takes.
        assert Money("500", "TZS") / Money("1000", "TZS") == Decimal("0.5")

    def test_ratio_across_currencies_raises(self):
        with pytest.raises(CurrencyMismatch):
            Money("500", "TZS") / Money("1000", "KES")

    def test_scalar_multiplication_allowed(self):
        assert Money("1000", "TZS") * Decimal("1.10") == Money("1100", "TZS")

    def test_money_times_money_is_meaningless(self):
        with pytest.raises(TypeError):
            Money("2", "TZS") * Money("3", "TZS")

    def test_bare_number_is_not_money(self):
        with pytest.raises(TypeError):
            Money("1", "TZS") + Decimal("1")

    def test_sum_of_empty_is_a_denominated_zero(self):
        # sum() would seed with int 0 and adopt whatever currency it met next.
        assert money_sum([], "KES") == zero("KES")

    def test_zero_still_carries_a_currency(self):
        assert zero("TZS").currency == "TZS"
        with pytest.raises(CurrencyMismatch):
            zero("TZS") + zero("KES")


def test_known_currencies_cover_the_planned_markets():
    assert {"TZS", "KES", "UGX", "RWF"} <= KNOWN_CURRENCIES


# ─── The schema ─────────────────────────────────────────────────────────────
MONEY_TABLES = (
    "groups",
    "members",
    "loan_applications",
    "mobile_money_statements",
    "transactions",
)


def test_every_money_table_has_a_currency_column():
    from database import Base

    for table in MONEY_TABLES:
        cols = Base.metadata.tables[table].columns
        assert "currency" in cols, f"{table} has money columns but no currency"
        assert not cols["currency"].nullable, f"{table}.currency must be NOT NULL"


# ─── The scoring path ───────────────────────────────────────────────────────
def _fixture(member_ccy="TZS", group_ccy="TZS", loan_ccy="TZS"):
    gid, mid = uuid4(), uuid4()
    group = Group(
        id=gid, name="Nyota", country="TZ", currency=group_ccy, group_type="vicoba",
        member_count=20, total_savings=Decimal("20000000"), interest_rate=Decimal("10"),
    )
    member = Member(
        id=mid, group_id=gid, country="TZ", currency=member_ccy, full_name="Test",
        phone="+255700000001", national_id="1990-0101-99999-00009-00",
        savings_balance=Decimal("2000000"), loan_balance=Decimal("0"), role="member",
    )
    loan = LoanApplication(
        id=uuid4(), member_id=mid, group_id=gid, currency=loan_ccy,
        amount=Decimal("500000"), purpose="business", repayment_weeks=12,
        interest_rate=Decimal("10"), total_repayment=Decimal("550000"),
    )
    return member, group, loan


class TestUnderwritingRefusesMixedCurrency:
    def test_single_currency_evaluates(self):
        result = TanzanianUnderwritingEngine.evaluate(*_fixture())
        assert result["decision"] in {"approved", "flagged", "rejected"}
        assert 0 <= result["score"] <= 100, "capped bands must keep the score in range"

    @pytest.mark.parametrize(
        "member_ccy,group_ccy,loan_ccy",
        [("KES", "TZS", "TZS"), ("TZS", "KES", "TZS"), ("TZS", "TZS", "KES")],
    )
    def test_any_disagreement_raises(self, member_ccy, group_ccy, loan_ccy):
        with pytest.raises(CurrencyMismatch):
            TanzanianUnderwritingEngine.evaluate(
                *_fixture(member_ccy, group_ccy, loan_ccy)
            )
