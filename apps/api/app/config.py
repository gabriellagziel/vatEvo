from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str = "postgresql://user:password@localhost/vatevo"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "eu-west-1"
    s3_bucket: str = "vatevo-invoices"
    
    stripe_api_key: Optional[str] = None
    
    webhook_secret: str = "webhook-secret-change-in-production"
    
    environment: str = "development"
    
    class Config:
        env_file = ".env"


settings = Settings()
