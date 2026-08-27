"""Tanzania country pack — all TZ-specific constants in one place.

Sourced from config.py, underwriting.py, country_config.py and constitution.py
as part of the Sprint 14 refactor. Pure data: this module must not import any
other backend module, so it can be imported from anywhere without cycles.
"""

# ─── Identity ───────────────────────────────────────────────────────────────
COUNTRY_CODE = "TZ"
COUNTRY_NAME = "Tanzania"
PHONE_PREFIX = "+255"

# NIDA (national ID): YYYY-MMDD-XXXXX-XXXXX-XX
ID_LABEL = "NIDA"
NIDA_REGEX = r"^\d{4}-\d{4}-\d{5}-\d{5}-\d{2}$"
NIDA_FORMAT_HINT = "1984-0313-11101-00006-25"

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
