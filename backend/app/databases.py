
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Change these according to your MySQL settings
DATABASE_URL = "mysql+pymysql://root:root%40123@localhost/ecommerce_support"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
