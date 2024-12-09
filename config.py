from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env",env_ignore_empty=True, extra="ignore")
    DATABASE_URL: str
    SECRET_KEY: str = "5886584bc98dd7ade1788f2322ed42e2690be2bf1f33317c18d556052fcdc8bb"
    ALGORITHM: str = "HS256"