from functools import lru_cache
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    app_name: str = "SupportGPT AI Service"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    core_api_url: str
    port: int

    database_url: str = Field(..., validation_alias="DATABASE_URL_ASYNC")
    redis_url: str = "redis://localhost:6379/0"

    secret_key: SecretStr = SecretStr("change-me-to-a-random-64-char-string-in-production")
    service_auth_key: SecretStr = SecretStr("change-me-inter-service-secret")
    encryption_master_key: SecretStr = SecretStr("change-me-to-a-random-32-byte-hex-string")

    default_embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    chunk_size: int = 512
    chunk_overlap: int = 50

    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:4000"]

@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]

settings = get_settings()
