from pydantic import BaseSettings


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_seconds: int = 3600

    class Config:
        env_file = ".env"


settings = Settings()
