"""Tanzania country pack — all TZ-specific constants in one place.

Sourced from config.py, underwriting.py, country_config.py and constitution.py
as part of the Sprint 14 refactor. Pure data: this module must not import any
other backend module, so it can be imported from anywhere without cycles.
"""

# ─── Identity ───────────────────────────────────────────────────────────────
COUNTRY_CODE = "TZ"
COUNTRY_NAME = "Tanzania"
PHONE_PREFIX = "+255"

# NIDA (national ID): 20 digits. Positions 1-8 are the registered date of birth
# as YYYYMMDD; 9-13 encode the postcode of the place of registration. There is no
# publicly documented check-digit algorithm, so validation stops at shape and
# date -- see national_id.py.
ID_LABEL = "NIDA"
ID_DIGITS = 20
# Accepts the grouping printed on the card (8-5-5-2), the historical 4-4-5-5-2
# form, and unseparated digits. Real validation runs on normalised digits via
# national_id.validate_nida; this pattern covers hints and client-side shape.
NIDA_REGEX = (
    r"^(?:\d{8}-\d{5}-\d{5}-\d{2}"
    r"|\d{4}-\d{4}-\d{5}-\d{5}-\d{2}"
    r"|\d{20})$"
)
# Rendered as the holder sees it on the card. Ward 99999 and check digits 00 do
# not occur in issued numbers, so this reads as synthetic at a glance.
NIDA_FORMAT_HINT = "19900101-99999-00000-00"

# ─── Money ──────────────────────────────────────────────────────────────────
CURRENCY = "TZS"
CURRENCY_SYMBOL = "TSh"
JOINING_FEE = 5_000
DEFAULT_INTEREST_RATE = 10.0

# ─── Group vocabulary ───────────────────────────────────────────────────────
GROUP_TYPE_DEFAULT = "vicoba"
GROUP_TYPES = ["vicoba", "upatu", "sacco", "other"]
MEETING_FREQUENCIES = ["weekly", "biweekly", "monthly"]

# Upatu rotates a fixed pot with no interest accumulation, so group savings
# are a weaker guarantee than in an interest-bearing VICOBA.
GUARANTEE_MULTIPLIER_BY_GROUP_TYPE = {"upatu": 0.8}

# ─── Mobile money ───────────────────────────────────────────────────────────
MOBILE_MONEY_PROVIDERS = ["mpesa", "mixx", "airtel", "halopesa", "tpesa"]
PAYMENT_METHODS = ["mpesa", "mixx", "airtel", "halopesa", "tpesa", "cash", "bank"]

# ─── Formalization documents (points feed the underwriting score) ───────────
FORMALIZATION_DOCS = {
    "national_id": {"label": "NIDA", "points": 8},
    "tin_number": {"label": "TIN", "points": 4},
    "brela_number": {"label": "BRELA", "points": 3},
}
MAX_FORMALIZATION_POINTS = sum(d["points"] for d in FORMALIZATION_DOCS.values())

# ─── Underwriting guardrails ────────────────────────────────────────────────
# Weekly cash-flow floor (~USD 19) — realistic for the informal sector.
MIN_WEEKLY_INCOME = 50_000.0
# Proxy: savings balance * this rate approximates weekly cash flow.
SAVINGS_TO_WEEKLY_INCOME_RATE = 0.05
MAX_LOAN_TO_SAVINGS_RATIO = 4.0      # classic VICOBA 4x rule
MAX_DEBT_TO_SAVINGS_RATIO = 3.0
MIN_PERSONAL_SAVINGS_RATIO = 0.15
TARGET_DEBT_SERVICE_RATIO = 0.25
HARD_DEBT_SERVICE_CEILING = 0.70
MIN_GROUP_GUARANTEE_RATIO = 0.30
WEEKS_PER_YEAR = 52.0

# ─── Scoring bands (max points per factor, total 100) ───────────────────────
SCORE_WEIGHTS = {
    "mobile_money_flow": 30,
    "debt_service": 25,
    "group_guarantee": 20,
    "formalization": MAX_FORMALIZATION_POINTS,
    "seasonality": 10,
}

# ─── Agricultural seasonality ───────────────────────────────────────────────
AGRICULTURE_MIN_WEEKS = 12   # below this a loan cannot span to harvest
AGRICULTURE_SHORT_PENALTY = -5
AGRICULTURE_LONG_BONUS = 5

# ─── Decision thresholds ────────────────────────────────────────────────────
SCORE_APPROVE = 70
SCORE_FLAG = 50

# ─── Loan servicing (Sprint 14) ─────────────────────────────────────────────
DEFAULT_GRACE_WEEKS = 2  # weeks past schedule before a loan is defaulted

# ─── Loan tiers (credit score -> borrowing terms, TZS) ──────────────────────
# Shared contract with the frontend Trust Engine's TIER_CONFIG. The Trust Score
# decides which tier a borrower qualifies for; the underwriting engine then
# decides whether a specific request inside that tier is affordable.
LOAN_TIERS = (
    {"tier": 1, "name": "Bronze",   "min_score": 300, "max_score": 499,
     "max_loan": 200_000,    "interest_rate": 24.0},
    {"tier": 2, "name": "Silver",   "min_score": 500, "max_score": 649,
     "max_loan": 1_000_000,  "interest_rate": 18.0},
    {"tier": 3, "name": "Gold",     "min_score": 650, "max_score": 749,
     "max_loan": 4_000_000,  "interest_rate": 14.0},
    {"tier": 4, "name": "Platinum", "min_score": 750, "max_score": 850,
     "max_loan": 10_000_000, "interest_rate": 10.0},
)


def tier_for_score(score: int) -> dict:
    """Return the loan tier a credit score falls into (lowest tier as floor)."""
    for band in reversed(LOAN_TIERS):
        if score >= band["min_score"]:
            return band
    return LOAN_TIERS[0]


# ─── KYC tiers (BoT Payment Systems (Electronic Money) Regulations 2015) ─────
# Mirrors the gazetted Third Schedule, Form F ladder rather than inventing one:
# aligning to a published schedule is a far better position in front of BoT than
# arguing from first principles.
#
# The load-bearing entry is WEO_LETTER. Form F's accepted photo ID list reads
# verbatim: "National ID; or Voter's registration card; or Employment ID; or
# Social Security ID; or Letter from ward/village executive." A ward or village
# executive officer letter is therefore a regulator-recognised identity document
# in Tanzania — which makes a NIDA-only onboarding flow stricter than the law
# requires, and stricter than the banks we compete with. See also NBC's Kikundi
# group account rules and GN 678 Tier 4 registration, which both require one.

# Documents that satisfy the Tier 1 identity requirement.
ACCEPTED_ID_DOCUMENTS = {
    "nida":            {"label": "NIDA (National ID)",        "photo_id": True},
    "voter_card":      {"label": "Voter's registration card", "photo_id": True},
    "employment_id":   {"label": "Employment ID",             "photo_id": True},
    "social_security": {"label": "Social Security ID",        "photo_id": True},
    "passport":        {"label": "Passport",                  "photo_id": True},
    "weo_letter":      {"label": "Ward/Village Executive letter", "photo_id": False},
}

# How a member reached their tier. Recorded so approval and default rates can be
# compared by route — the tripwire on formalization bias (see UNDERWRITING_ENGINE
# and the Chama Credit Calibration Analysis).
KYC_METHODS = ("registry", "document", "attestation", "agent")

KYC_TIERS = (
    {
        "tier": 0,
        "name": "Observer",
        "requires": ("phone_verified",),
        "unlocks": "Join a group, record contributions, view own passbook",
        "max_single_txn": 0,
        "max_daily": 0,
        "max_balance": 0,
        "can_borrow": False,
    },
    {
        "tier": 1,
        "name": "Member",
        "requires": ("phone_verified", "any_accepted_id"),
        "unlocks": "Contributions, withdrawals, group participation, Soko selling",
        "max_single_txn": 1_000_000,
        "max_daily": 1_000_000,
        "max_balance": 2_000_000,
        "can_borrow": False,
    },
    {
        "tier": 2,
        "name": "Verified",
        # Two routes, deliberately. Either a verified NIDA, or a WEO/VEO letter
        # backed by the group's own committee. Both reach credit.
        "requires": ("phone_verified", "verified_nida_or_attestation"),
        "unlocks": "Credit eligibility: loan application and disbursement",
        "max_single_txn": 5_000_000,
        "max_daily": 5_000_000,
        "max_balance": 10_000_000,
        "can_borrow": True,
    },
    {
        "tier": 3,
        "name": "Business",
        "requires": ("tier_2", "tin", "business_licence"),
        "unlocks": "Higher limits, supplier payments, agent participation",
        "max_single_txn": 10_000_000,
        "max_daily": 50_000_000,
        "max_balance": 50_000_000,
        "can_borrow": True,
    },
)

MIN_TIER_TO_BORROW = 2

# A NIN is not permanent state: NIDA suspends usage one month after an SMS notice
# when a produced card is never collected (~1.2m uncollected as of Jan 2025). A
# member can hold a valid NIN, be SIM-registered against it, and still have the
# credential switched off. Re-verify rather than caching "has NIDA" forever.
KYC_REVERIFY_DAYS = 365

# A committee attestation needs this many group officers, each verified in their
# own right, so the route cannot bootstrap itself from unverified accounts.
ATTESTATION_MIN_OFFICERS = 2


def tier_for(tier_number: int) -> dict:
    """Return a tier definition, clamped to the ladder."""
    for band in KYC_TIERS:
        if band["tier"] == tier_number:
            return band
    return KYC_TIERS[0]
