"""National identity numbers: normalise, validate, and refuse to print.

Three things this module deliberately does *not* do:

**No checksum.** There is no publicly documented check-digit algorithm for the
Tanzanian NIN — nothing from NIDA, and `python-stdnum` carries no Tanzania module
at all, which is meaningful given its inclusion criterion is "any number that has
some validation mechanism available". The trailing two digits are *presumed* to be
check digits; no source confirms even that. An invented mod-10/mod-11 would
silently reject real citizens — invisible to us, total for them.

**No identity claim.** Matching a submitted number against a stored one proves
only that the submitter knows a semi-public number. A NIN is printed on a card and
already held by every mobile operator, employer and landlord the person has dealt
with. Verification means a registry or licensed-provider match; this module only
establishes that a string is *shaped* like an identifier.

**No fixed-width assumption across markets.** Kenya's second-generation ID is up
to eight digits and is *not* zero-padded, so a `\\d{8}` rule rejects legitimate
older holders. Each market's rules live in its own country pack.

See `sprints/15-SPRINT_IDENTITY_KYC.md` §1.1–1.2 and `docs/ENGINEERING_FINDINGS.md`
#11 and #12.
"""
from __future__ import annotations

import logging
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date
from typing import Optional

logger = logging.getLogger(__name__)

NIDA_DIGITS = 20
MIN_AGE_YEARS = 18
MAX_AGE_YEARS = 120

# Characters people actually produce when typing or pasting an ID: separators of
# every kind, the invisible marks WhatsApp and RTL keyboards insert, and the
# feature-phone habit of prefixing with + or #.
_STRIP_CATEGORIES = {"Cf", "Zs"}  # format chars (ZWJ, RLM, …) and all spaces
_STRIP_CHARS = set(" \t\r\n 　-–—_.·,/\\()[]{}|+#*'\"")

# Only mapped in a numeric-only field, where each is unambiguous. Applied before
# rejection, not after: a user reading "O" off a card and typing the letter is a
# legible mistake, not an invalid identity.
_CONFUSABLES = {
    "O": "0", "o": "0", "Ο": "0", "О": "0", "о": "0",  # Greek/Cyrillic O
    "I": "1", "l": "1", "i": "1", "І": "1",
    "S": "5", "s": "5",
    "B": "8",
    "Z": "2", "z": "2",
    "G": "6",
    "D": "0",
    "Q": "0",
}


@dataclass
class Normalisation:
    """What normalising did to the input, so UX and security can both read it."""

    digits: str
    applied: list[str] = field(default_factory=list)

    @property
    def changed(self) -> bool:
        return bool(self.applied)


def normalize_nid(raw: Optional[str]) -> Normalisation:
    """Reduce free-form input to bare digits, recording what had to be fixed.

    The record matters twice over: a spike in `confusable:O->0` is a UX signal
    that the placeholder or font is misleading, and a spike in inputs needing no
    normalisation at all, arriving fast, is an enumeration signal.
    """
    if raw is None:
        return Normalisation("")

    applied: list[str] = []
    out: list[str] = []

    for ch in unicodedata.normalize("NFKC", raw):
        if ch in _STRIP_CHARS or unicodedata.category(ch) in _STRIP_CATEGORIES:
            if ch not in " -":  # ordinary spaces and hyphens are unremarkable
                applied.append(f"strip:{unicodedata.name(ch, repr(ch))}")
            continue
        if ch.isdigit():
            out.append(ch)
            continue
        mapped = _CONFUSABLES.get(ch)
        if mapped:
            applied.append(f"confusable:{ch}->{mapped}")
            out.append(mapped)
            continue
        applied.append(f"unexpected:{ch!r}")
        out.append(ch)  # kept so validation can report it rather than swallow it

    return Normalisation("".join(out), applied)


@dataclass
class ValidationResult:
    valid: bool
    digits: str = ""
    errors: list[str] = field(default_factory=list)
    normalisations: list[str] = field(default_factory=list)
    birth_date: Optional[date] = None

    def __bool__(self) -> bool:
        return self.valid


def validate_nida(raw: Optional[str]) -> ValidationResult:
    """Validate a Tanzanian NIN as far as is defensible offline.

    Checks, and only these: exactly 20 digits after normalisation, and positions
    1–8 parsing as a real past calendar date implying a plausible adult age.
    """
    norm = normalize_nid(raw)
    errors: list[str] = []

    non_digits = [c for c in norm.digits if not c.isdigit()]
    if non_digits:
        errors.append(f"contains non-digits: {''.join(sorted(set(non_digits)))}")

    if len(norm.digits) != NIDA_DIGITS:
        errors.append(
            f"expected {NIDA_DIGITS} digits, got {len(norm.digits)}"
        )

    birth: Optional[date] = None
    if len(norm.digits) >= 8 and norm.digits[:8].isdigit():
        birth, date_error = _parse_birth_prefix(norm.digits[:8])
        if date_error:
            errors.append(date_error)

    if norm.applied:
        logger.info(
            "national_id normalisation applied",
            extra={"normalisations": norm.applied},
        )

    return ValidationResult(
        valid=not errors,
        digits=norm.digits if not errors else "",
        errors=errors,
        normalisations=norm.applied,
        birth_date=birth,
    )


def _parse_birth_prefix(prefix: str) -> tuple[Optional[date], Optional[str]]:
    """Positions 1–8 are the registered date of birth, YYYYMMDD.

    Treated as a shape check, never as identity evidence: it is the *registered*
    date, and NIDA runs a public amendment process, so it legitimately diverges
    from the record.
    """
    year, month, day = int(prefix[:4]), int(prefix[4:6]), int(prefix[6:8])
    try:
        birth = date(year, month, day)
    except ValueError:
        return None, f"positions 1-8 are not a real date: {prefix}"

    today = date.today()
    if birth > today:
        return birth, "date of birth is in the future"

    age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
    if age < MIN_AGE_YEARS:
        return birth, f"implies age {age}; must be at least {MIN_AGE_YEARS}"
    if age > MAX_AGE_YEARS:
        return birth, f"implies age {age}, which is not plausible"
    return birth, None


def format_nida(digits: str) -> str:
    """Render in the grouping printed on the card: 8-5-5-2.

    The repo previously rendered 4-4-5-5-2, which meant a user copying their card
    verbatim was told their own ID was invalid. Both are 20 digits; only one is
    what the holder is looking at.
    """
    d = normalize_nid(digits).digits
    if len(d) != NIDA_DIGITS:
        return d
    return f"{d[:8]}-{d[8:13]}-{d[13:18]}-{d[18:]}"


class NationalId:
    """An identity number that will not print itself.

    The dominant leak path for this class of data is not the database — it is an
    f-string in a log line, an exception repr, a dataclass default repr, or a JSON
    dump of a model. Overriding every string conversion closes all of them at once,
    and leaves `.reveal()` as a single greppable, reviewable call site.
    """

    __slots__ = ("_digits", "_label")

    def __init__(self, value: str, label: str = "NIDA"):
        result = validate_nida(value)
        if not result.valid:
            raise ValueError("; ".join(result.errors))
        self._digits = result.digits
        self._label = label

    @property
    def last4(self) -> str:
        return self._digits[-4:]

    @property
    def label(self) -> str:
        return self._label

    def reveal(self) -> str:
        """The raw digits. Every call site is an audit surface — keep them few."""
        return self._digits

    def formatted(self) -> str:
        """Card grouping, revealed. Same caution as `reveal`."""
        return format_nida(self._digits)

    # Every path to a string is redacted, including the implicit ones.
    def __repr__(self) -> str:
        return f"{self._label}(****{self.last4})"

    __str__ = __repr__

    def __format__(self, _spec: str) -> str:
        return self.__repr__()

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, NationalId):
            return NotImplemented
        return self._digits == other._digits

    def __hash__(self) -> int:
        return hash(self._digits)
