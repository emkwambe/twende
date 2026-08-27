"""Country-specific configuration for Kenya and Tanzania."""
from dataclasses import dataclass
from typing import Literal

CountryCode = Literal["KE", "TZ"]

# NIDA (Tanzania national ID): YYYY-MMDD-XXXXX-XXXXX-XX
# e.g. 1984-0313-11101-00006-25
NIDA_REGEX = r"^\d{4}-\d{4}-\d{5}-\d{5}-\d{2}$"
NIDA_FORMAT_HINT = "1984-0313-11101-00006-25"


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
        currency="TZS",
        currency_symbol="TSh",
        phone_prefix="+255",
        id_label="NIDA",
        id_regex=NIDA_REGEX,
        mobile_money_providers=["mpesa", "mixx", "airtel", "halopesa", "tpesa"],
        group_type_default="vicoba",
        group_types=["vicoba", "upatu", "sacco", "other"],
    ),
}


def get_country_config(country: CountryCode) -> CountryConfig:
    return COUNTRY_CONFIG[country]


def format_currency(amount: float, country: CountryCode) -> str:
    cfg = get_country_config(country)
    return f"{cfg.currency_symbol} {amount:,.0f}"
