"""Country-specific configuration for Kenya and Tanzania."""
from dataclasses import dataclass
from typing import Literal

from country_packs import tanzania as tz

CountryCode = Literal["KE", "TZ"]

# Re-exported from the Tanzania country pack (single source of truth).
NIDA_REGEX = tz.NIDA_REGEX
NIDA_FORMAT_HINT = tz.NIDA_FORMAT_HINT


@dataclass(frozen=True)
class CountryConfig:
    code: CountryCode
    name: str
    currency: str
    currency_symbol: str
    phone_prefix: str
    id_label: str
    id_regex: str | None  # None until exact format is provided
    mobile_money_providers: list[str]
    group_type_default: str
    group_types: list[str]


COUNTRY_CONFIG: dict[CountryCode, CountryConfig] = {
    "KE": CountryConfig(
        code="KE",
        name="Kenya",
        currency="KES",
        currency_symbol="KSh",
        phone_prefix="+254",
        id_label="Huduma Namba",
        id_regex=None,  # TODO: add Huduma Namba regex
        mobile_money_providers=["mpesa", "airtel_money"],
        group_type_default="chama",
        group_types=["chama", "sacco", "merry_go_round"],
    ),
    "TZ": CountryConfig(
        code="TZ",
        name="Tanzania",
        currency=tz.CURRENCY,
        currency_symbol=tz.CURRENCY_SYMBOL,
        phone_prefix=tz.PHONE_PREFIX,
        id_label=tz.ID_LABEL,
        id_regex=NIDA_REGEX,
        mobile_money_providers=tz.MOBILE_MONEY_PROVIDERS,
        group_type_default=tz.GROUP_TYPE_DEFAULT,
        group_types=tz.GROUP_TYPES,
    ),
}


def get_country_config(country: CountryCode) -> CountryConfig:
    return COUNTRY_CONFIG[country]


def format_currency(amount: float, country: CountryCode) -> str:
    cfg = get_country_config(country)
    return f"{cfg.currency_symbol} {amount:,.0f}"
