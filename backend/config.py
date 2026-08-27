"""Application settings for the Twende backend."""
from pydantic_settings import BaseSettings, SettingsConfigDict

from country_packs import tanzania as tz


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = "sqlite:///./twende.db"

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # OTP
    OTP_EXPIRE_MINUTES: int = 5
    OTP_LENGTH: int = 6

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Demo PIN / OTP
    DEMO_OTP: str = "123456"
    DEMO_PIN: str = "1234"

    # Underwriting guardrails — defaults from the active country pack,
    # still overridable per-deployment via environment variables.
    DEFAULT_INTEREST_RATE: float = tz.DEFAULT_INTEREST_RATE
    MIN_WEEKLY_INCOME_TZS: float = tz.MIN_WEEKLY_INCOME
    MAX_LOAN_TO_SAVINGS_RATIO: float = tz.MAX_LOAN_TO_SAVINGS_RATIO
    MAX_DEBT_TO_SAVINGS_RATIO: float = tz.MAX_DEBT_TO_SAVINGS_RATIO
    MIN_PERSONAL_SAVINGS_RATIO: float = tz.MIN_PERSONAL_SAVINGS_RATIO
    TARGET_DEBT_SERVICE_RATIO: float = tz.TARGET_DEBT_SERVICE_RATIO
    HARD_DEBT_SERVICE_CEILING: float = tz.HARD_DEBT_SERVICE_CEILING
    MIN_GROUP_GUARANTEE_RATIO: float = tz.MIN_GROUP_GUARANTEE_RATIO

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
