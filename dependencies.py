from collections.abc import Generator

from sqlalchemy import create_engine
from sqlmodel import Session
from fastapi.security import OAuth2PasswordBearer
from config import Settings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"/login/access-token")

settings = Settings()
engine = create_engine(settings.DATABASE_URL)

def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)