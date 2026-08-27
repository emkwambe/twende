"""Application settings for the Twende backend."""
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # Underwriting guardrails
    DEFAULT_INTEREST_RATE: float = 10.0
    MIN_WEEKLY_INCOME_TZS: float = 50000.0
    MAX_LOAN_TO_SAVINGS_RATIO: float = 4.0
    MAX_DEBT_TO_SAVINGS_RATIO: float = 3.0
    MIN_PERSONAL_SAVINGS_RATIO: float = 0.15
    TARGET_DEBT_SERVICE_RATIO: float = 0.25
    HARD_DEBT_SERVICE_CEILING: float = 0.70
    MIN_GROUP_GUARANTEE_RATIO: float = 0.30

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
