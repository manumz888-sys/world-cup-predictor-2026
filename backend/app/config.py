from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://wcp_user:wcp_password@localhost:5432/wcp_db"
    TEST_DATABASE_URL: str = "postgresql://wcp_user:wcp_password@localhost:5432/wcp_test_db"
    SECRET_KEY: str = "supersecretkey-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
