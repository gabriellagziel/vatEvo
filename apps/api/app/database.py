from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Use effective database URL from settings
SQLALCHEMY_DATABASE_URL = settings.effective_database_url

# Configure engine based on database type
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    # SQLite configuration (local development)
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL configuration (staging/production)
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=settings.db_pool_size,
        pool_pre_ping=True,
        pool_recycle=3600,
        connect_args={"sslmode": settings.db_ssl_mode}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
