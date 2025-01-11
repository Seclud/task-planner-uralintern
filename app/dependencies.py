from collections.abc import Generator
from datetime import timedelta
import datetime
from typing import Annotated

import jwt
from fastapi import HTTPException, status, Depends
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlmodel import Session
from fastapi.security import OAuth2PasswordBearer

from . import database_models
from .config import Settings
from passlib.context import CryptContext
from .pydantic_models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"/login/access-token")

settings = Settings()
engine = create_engine(settings.DATABASE_URL)

SECRET_KEY = settings.SECRET_KEY

def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

SessionDep= Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str,Depends(reusable_oauth2)]

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_current_user(session:SessionDep, token:TokenDep) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_data = payload["sub"]
    except(InvalidTokenError, ValidationError):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")
    user = session.query(database_models.User).filter(database_models.User.id == token_data).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return user


def create_access_token(data:str, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.datetime.now(datetime.UTC) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.UTC) + timedelta(minutes=60)
    to_encode = {"exp": expire, "sub":str(data), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt