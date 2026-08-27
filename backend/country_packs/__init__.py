"""Country packs: per-market constants for Twende.

Each module holds everything market-specific (identity formats, currency,
group vocabulary, underwriting guardrails) so the rest of the backend stays
market-neutral. No adapter/strategy layer yet — this is centralised config.
"""
from country_packs import tanzania

PACKS = {"TZ": tanzania}


def get_pack(country_code: str = "TZ"):
    return PACKS.get(country_code.upper(), tanzania)
