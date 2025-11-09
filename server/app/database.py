import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Read from env; example:
# postgresql+psycopg2://postgres:postgres@localhost:5432/weddingdb
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://siddhantjanbandhu:siddhant@localhost:5432/Weddingplanner",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

class Base(DeclarativeBase):
    pass

# Dependency for routers (when you add them)
def get_db():
    print("db")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
