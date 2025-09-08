from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database configuration
    postgres_url: Optional[str] = None
    database_url: str = "postgresql://user:password@localhost/vatevo"
    db_pool_size: int = 10
    db_ssl_mode: str = "prefer"
    
    # Redis configuration
    redis_url: str = "redis://localhost:6379"
    
    # Authentication
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # AWS S3 configuration
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "eu-west-1"
    s3_bucket: str = "vatevo-invoices"
    s3_object_lock: bool = True
    
    # External services
    stripe_api_key: Optional[str] = None
    webhook_secret: str = "webhook-secret-change-in-production"
    
    # Environment
    environment: str = "development"
    
    @property
    def effective_database_url(self) -> str:
        """Get the effective database URL, preferring POSTGRES_URL in production."""
        if self.postgres_url and self.environment in ["staging", "production"]:
            return self.postgres_url
        return self.database_url
    
    class Config:
        env_file = ".env"


settings = Settings()
