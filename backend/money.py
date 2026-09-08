"""Money as a value type: an amount that cannot exist without a currency.

The platform previously stored every amount as a bare ``Numeric(12, 2)`` with the
denomination implicit in the fact that every row was Tanzanian. That holds until a
second market exists, at which point TZS 1,000,000 and KES 50,000 — near-equal in
value, twentyfold apart as numbers — share a column with nothing to tell them
apart. The failure mode is a wrong total that looks like a total.

The defence is to make the mistake unrepresentable rather than to rely on
discipline: ``Money`` carries its currency, refuses to be built without one, and
raises on any cross-currency arithmetic. The same move as the redacting
``NationalId`` type planned for Sprint 15.

Note this is deliberately *not* an FX layer. Money of different currencies does
not convert here — it raises. Conversion is a business decision with a rate, a
timestamp and an audit trail, and it does not belong in an arithmetic operator.
"""
from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from typing import Union

# ISO 4217 alphabetic codes for the markets the platform packs support or plans to.
# Validated on construction so a typo fails at the boundary rather than in a report.
KNOWN_CURRENCIES = frozenset({"TZS", "KES", "UGX", "RWF"})

Numeric = Union[int, float, str, Decimal]

CENTS = Decimal("0.01")


class CurrencyMismatch(ValueError):
    """Raised when two amounts in different currencies are combined.

    This is never a recoverable condition to be caught and papered over — it means
    a code path assumed a single denomination that no longer holds.
    """


class MissingCurrency(ValueError):
    """Raised when an amount is constructed without a currency."""


def _quantize(value: Numeric) -> Decimal:
    """Coerce to Decimal at 2dp. ``str`` first: float(0.1) is not 0.1."""
    if isinstance(value, float):
        value = str(value)
    return Decimal(value).quantize(CENTS, rounding=ROUND_HALF_UP)


class Money:
    """An amount bound to its currency.

    >>> Money("1000", "TZS") + Money("500", "TZS")
    Money('1500.00', 'TZS')
    >>> Money("1000", "TZS") + Money("500", "KES")
    Traceback (most recent call last):
    CurrencyMismatch: cannot add TZS and KES
    """

    __slots__ = ("_amount", "_currency")

    def __init__(self, amount: Numeric, currency: str):
        if not currency:
            raise MissingCurrency(
                "Money requires a currency; an undenominated amount is not a value"
            )
        code = str(currency).upper()
        if code not in KNOWN_CURRENCIES:
            raise ValueError(
                f"Unknown currency {code!r}; known: {sorted(KNOWN_CURRENCIES)}"
            )
        self._amount = _quantize(amount)
        self._currency = code

    # ── Accessors ───────────────────────────────────────────────────────────
    @property
    def amount(self) -> Decimal:
        return self._amount

    @property
    def currency(self) -> str:
        return self._currency

    # ── Guards ──────────────────────────────────────────────────────────────
    def _check(self, other: "Money", op: str) -> None:
        if not isinstance(other, Money):
            raise TypeError(
                f"cannot {op} Money and {type(other).__name__}; "
                "wrap the operand with its currency first"
            )
        if self._currency != other._currency:
            raise CurrencyMismatch(
                f"cannot {op} {self._currency} and {other._currency}"
            )

    # ── Arithmetic ──────────────────────────────────────────────────────────
    def __add__(self, other: "Money") -> "Money":
        self._check(other, "add")
        return Money(self._amount + other._amount, self._currency)

    def __sub__(self, other: "Money") -> "Money":
        self._check(other, "subtract")
        return Money(self._amount - other._amount, self._currency)

    def __mul__(self, factor: Numeric) -> "Money":
        """Money × scalar is meaningful; Money × Money is not."""
        if isinstance(factor, Money):
            raise TypeError("cannot multiply Money by Money")
        return Money(self._amount * _to_decimal(factor), self._currency)

    __rmul__ = __mul__

    def __truediv__(self, divisor: Union[Numeric, "Money"]):
        """Dividing by a scalar gives Money; dividing by Money gives a ratio.

        The second case is the one the underwriting engine relies on — DSR,
        savings-to-loan, group-guarantee are all dimensionless *only* when both
        sides share a currency, which is now enforced rather than assumed.
        """
        if isinstance(divisor, Money):
            self._check(divisor, "divide")
            if divisor._amount == 0:
                raise ZeroDivisionError("division by zero Money")
            return self._amount / divisor._amount
        d = _to_decimal(divisor)
        if d == 0:
            raise ZeroDivisionError("division by zero")
        return Money(self._amount / d, self._currency)

    def __neg__(self) -> "Money":
        return Money(-self._amount, self._currency)

    def __abs__(self) -> "Money":
        return Money(abs(self._amount), self._currency)

    # ── Comparison ──────────────────────────────────────────────────────────
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Money):
            return NotImplemented
        return self._amount == other._amount and self._currency == other._currency

    def __lt__(self, other: "Money") -> bool:
        self._check(other, "compare")
        return self._amount < other._amount

    def __le__(self, other: "Money") -> bool:
        self._check(other, "compare")
        return self._amount <= other._amount

    def __gt__(self, other: "Money") -> bool:
        self._check(other, "compare")
        return self._amount > other._amount

    def __ge__(self, other: "Money") -> bool:
        self._check(other, "compare")
        return self._amount >= other._amount

    def __hash__(self) -> int:
        return hash((self._amount, self._currency))

    def __bool__(self) -> bool:
        return self._amount != 0

    # ── Rendering ───────────────────────────────────────────────────────────
    def __repr__(self) -> str:
        return f"Money('{self._amount}', '{self._currency}')"

    def __str__(self) -> str:
        return f"{self._currency} {self._amount:,.2f}"

    def is_zero(self) -> bool:
        return self._amount == 0


def _to_decimal(value: Numeric) -> Decimal:
    if isinstance(value, float):
        value = str(value)
    return Decimal(value)


def zero(currency: str) -> Money:
    """The additive identity in a given currency."""
    return Money(Decimal("0.00"), currency)


def money_sum(items, currency: str) -> Money:
    """Sum an iterable of Money, seeded with an explicit currency.

    ``sum()`` seeds with ``int`` 0 and would raise on the first add. Requiring the
    currency up front also gives an empty iterable a correct, denominated zero
    rather than a bare 0 that silently adopts whatever it meets next.
    """
    total = zero(currency)
    for item in items:
        total = total + item
    return total
