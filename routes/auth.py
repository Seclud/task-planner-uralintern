from datetime import timedelta
from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from dependencies import get_db, verify_password, create_access_token
from config import Settings
import database_models

router = APIRouter()

@router.post("/login/access-token")
def login_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(database_models.User).filter(database_models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password"
        )

    access_token_expires = timedelta(minutes=Settings().ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data=str(user.id), expires_delta=access_token_expires
    )

    response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
