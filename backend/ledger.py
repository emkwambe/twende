"""Financial records engine — the digital replacement for the paper pass book.

Money conventions used throughout (documented once, applied everywhere):

* ``GROUP_INFLOW``  — cash moving *into* the group box: member share purchases,
  loan repayments, and penalties.
* ``GROUP_OUTFLOW`` — cash moving *out*: loan disbursements and withdrawals.
* ``interest_earned`` credits a member's savings but is an internal allocation
  of funds the group already holds, so it is cash-neutral at group level.
* ``Transaction.balance_after`` always means **the member's savings balance**
  after the row was written — one consistent meaning for every row. A loan's
  own outstanding amount lives on ``LoanApplication.loan_balance``.

The group's opening seed is ``Group.total_savings``: the paper-era balance a
group carries in on the day it starts recording digitally.
"""
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Iterable, List, Optional

from sqlalchemy.orm import Session

from country_packs import tanzania as tz
from models import Group, LoanApplication, Member, Transaction

# ─── Transaction vocabulary ─────────────────────────────────────────────────
SHARE_PURCHASE = "share_purchase"
LOAN_DISBURSEMENT = "loan_disbursement"
LOAN_REPAYMENT = "loan_repayment"
INTEREST_EARNED = "interest_earned"
PENALTY = "penalty"
WITHDRAWAL = "withdrawal"

TRANSACTION_TYPES = [
    SHARE_PURCHASE,
    LOAN_DISBURSEMENT,
    LOAN_REPAYMENT,
    INTEREST_EARNED,
    PENALTY,
    WITHDRAWAL,
]

GROUP_INFLOW = {SHARE_PURCHASE, LOAN_REPAYMENT, PENALTY}
GROUP_OUTFLOW = {LOAN_DISBURSEMENT, WITHDRAWAL}

# Effect of each type on the member's own savings balance.
SAVINGS_DELTA_SIGN = {
    SHARE_PURCHASE: 1,
    INTEREST_EARNED: 1,
    WITHDRAWAL: -1,
}

ZERO = Decimal("0.00")


def money(value) -> Decimal:
    return Decimal(str(value or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(value: Optional[datetime]) -> Optional[datetime]:
    """SQLite hands back naive datetimes; normalise them to UTC for comparison."""
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


# ─── Period helpers ─────────────────────────────────────────────────────────
def week_start(moment: Optional[datetime] = None) -> datetime:
    moment = moment or utc_now()
    monday = moment - timedelta(days=moment.weekday())
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


def quarter_bounds(moment: Optional[datetime] = None) -> tuple[datetime, datetime, int, int]:
    """Return (start, end, year, quarter) for the calendar quarter of `moment`."""
    moment = moment or utc_now()
    quarter = (moment.month - 1) // 3 + 1
    start_month = 3 * (quarter - 1) + 1
    start = datetime(moment.year, start_month, 1, tzinfo=timezone.utc)
    if quarter == 4:
        end = datetime(moment.year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(moment.year, start_month + 3, 1, tzinfo=timezone.utc)
    return start, end, moment.year, quarter


# ─── Core posting primitive ─────────────────────────────────────────────────
def post_transaction(
    db: Session,
    *,
    member: Member,
    group: Group,
    transaction_type: str,
    amount: Decimal,
    description: str = "",
    reference: Optional[str] = None,
    week_number: Optional[int] = None,
    payment_method: Optional[str] = None,
    mpesa_receipt: Optional[str] = None,
    loan: Optional[LoanApplication] = None,
    debt_delta: Optional[Decimal] = None,
) -> Transaction:
    """Write one pass book row and apply its effect to the member's balances.

    `amount` is always the cash that moved. `debt_delta` lets a caller move the
    member's debt by a different figure than the cash: on disbursement the group
    hands over the principal, but the member owes principal + interest.
    """
    amount = money(amount)
    debt = money(debt_delta) if debt_delta is not None else amount

    sign = SAVINGS_DELTA_SIGN.get(transaction_type, 0)
    if sign:
        member.savings_balance = money(member.savings_balance or ZERO) + (amount * sign)

    if transaction_type == LOAN_DISBURSEMENT:
        member.loan_balance = money(member.loan_balance or ZERO) + debt
    elif transaction_type == LOAN_REPAYMENT:
        member.loan_balance = max(ZERO, money(member.loan_balance or ZERO) - debt)

    txn = Transaction(
        member_id=member.id,
        group_id=group.id,
        loan_id=loan.id if loan else None,
        transaction_type=transaction_type,
        amount=amount,
        balance_after=money(member.savings_balance or ZERO),
        description=description or None,
        reference=reference,
        week_number=week_number,
        payment_method=payment_method,
        mpesa_receipt=mpesa_receipt,
    )
    db.add(txn)
    return txn


# ─── Aggregation ────────────────────────────────────────────────────────────
def _sum(txns: Iterable[Transaction], types: Iterable[str]) -> Decimal:
    wanted = set(types)
    return money(sum((t.amount or ZERO) for t in txns if t.transaction_type in wanted))


def group_transactions(db: Session, group_id) -> List[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.group_id == group_id)
        .order_by(Transaction.created_at)
        .all()
    )


def balance_at(group: Group, txns: List[Transaction], as_of: Optional[datetime] = None) -> Decimal:
    """Group cash balance, seeded from the paper-era Group.total_savings."""
    scoped = [t for t in txns if as_of is None or _aware(t.created_at) < as_of]
    opening = money(group.total_savings or ZERO)
    return money(opening + _sum(scoped, GROUP_INFLOW) - _sum(scoped, GROUP_OUTFLOW))


def build_ledger(db: Session, group: Group) -> dict:
    txns = group_transactions(db, group.id)
    start = week_start()

    this_week = [t for t in txns if _aware(t.created_at) >= start]
    collections = _sum(this_week, GROUP_INFLOW)
    disbursements = _sum(this_week, GROUP_OUTFLOW)

    opening = balance_at(group, txns, as_of=start)
    closing = money(opening + collections - disbursements)

    loans = db.query(LoanApplication).filter(LoanApplication.group_id == group.id).all()
    outstanding = [
        l for l in loans
        if money(l.loan_balance or ZERO) > ZERO and l.status not in ("rejected", "repaid")
    ]
    defaulted = [l for l in loans if l.status == "defaulted"]

    active_members = (
        db.query(Member)
        .filter(Member.group_id == group.id, Member.status == "active")
        .count()
    )

    last_txn = max((_aware(t.created_at) for t in txns), default=None)
    last_updated = last_txn or _aware(group.updated_at) or utc_now()

    return {
        "group_name": group.name,
        "opening_balance": opening,
        "total_collections_this_week": collections,
        "total_disbursements": disbursements,
        # Named separately because `total_disbursements` above is scoped to the
        # current week so that opening + collections - disbursements == closing.
        "total_disbursements_all_time": _sum(txns, GROUP_OUTFLOW),
        "closing_balance": closing,
        "outstanding_loans": len(outstanding),
        "defaulted_loans": len(defaulted),
        "active_members": active_members,
        "last_updated": last_updated,
    }


# ─── Repayment scheduling ───────────────────────────────────────────────────
def installment_due_date(loan: LoanApplication, week_number: int) -> Optional[datetime]:
    created = _aware(loan.created_at)
    if created is None or not week_number:
        return None
    return created + timedelta(weeks=week_number)


def is_on_time(loan: LoanApplication, txn: Transaction) -> bool:
    due = installment_due_date(loan, txn.week_number or 0)
    paid = _aware(txn.created_at)
    if due is None or paid is None:
        return True  # no schedule to judge against
    return paid <= due


def is_defaulted(loan: LoanApplication, week_number: int) -> bool:
    """A loan defaults once payment slips past the schedule plus the grace window."""
    return week_number > (loan.repayment_weeks or 0) + tz.DEFAULT_GRACE_WEEKS


# ─── Quarterly report ───────────────────────────────────────────────────────
def build_quarterly_report(db: Session, group: Group) -> dict:
    start, end, year, quarter = quarter_bounds()
    txns = group_transactions(db, group.id)
    in_quarter = [t for t in txns if start <= (_aware(t.created_at) or start) < end]

    total_savings = _sum(in_quarter, [SHARE_PURCHASE])
    disbursed = _sum(in_quarter, [LOAN_DISBURSEMENT])
    repaid = _sum(in_quarter, [LOAN_REPAYMENT])

    loans = db.query(LoanApplication).filter(LoanApplication.group_id == group.id).all()
    quarter_loans = [l for l in loans if start <= (_aware(l.created_at) or start) < end]

    defaulted = [l for l in loans if l.status == "defaulted"]
    par = (len(defaulted) / len(loans) * 100) if loans else 0.0

    repayments = [t for t in in_quarter if t.transaction_type == LOAN_REPAYMENT]
    loans_by_id = {l.id: l for l in loans}
    on_time = [t for t in repayments if t.loan_id in loans_by_id and is_on_time(loans_by_id[t.loan_id], t)]
    on_time_rate = (len(on_time) / len(repayments) * 100) if repayments else 0.0

    avg_loan = money(
        sum((l.amount or ZERO) for l in quarter_loans) / len(quarter_loans)
    ) if quarter_loans else ZERO

    members = db.query(Member).filter(Member.group_id == group.id).all()
    at_start = sum(1 for m in members if (_aware(m.created_at) or start) < start)
    at_end = len(members)
    growth_pct = ((at_end - at_start) / at_start * 100) if at_start else (100.0 if at_end else 0.0)

    return {
        "group_name": group.name,
        "period": f"Q{quarter} {year}",
        "period_start": start.date(),
        "period_end": (end - timedelta(days=1)).date(),
        "currency": tz.CURRENCY,
        "total_savings": total_savings,
        "total_loans_disbursed": disbursed,
        "total_repayments_collected": repaid,
        "portfolio_at_risk_pct": round(par, 2),
        "on_time_repayment_rate_pct": round(on_time_rate, 2),
        "average_loan_size": avg_loan,
        "loans_issued": len(quarter_loans),
        "loans_defaulted": len(defaulted),
        "repayments_recorded": len(repayments),
        "repayments_on_time": len(on_time),
        "members_at_start": at_start,
        "members_at_end": at_end,
        "member_growth_pct": round(growth_pct, 2),
        "generated_at": utc_now(),
    }
