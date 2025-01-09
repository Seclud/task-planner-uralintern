import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from dependencies import get_db, get_password_hash, get_current_user
from pydantic_models import User, UserReg, UserUpdate
import database_models

router = APIRouter()

@router.post("/users/", response_model=User)
def create_user(user: UserReg, db: Session = Depends(get_db)):
    db_user = database_models.User(
        username=user.username,
        email=user.email,
        phone=user.phone,
        password_hash=get_password_hash(user.password),
        role=3,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    
    db_activity_log = database_models.ActivityLog(
        user_id=db_user.id,
        action="User created"
    )
    db.add(db_activity_log)
    db.commit()
    
    return db_user

@router.get("/users/{user_id}", response_model=User)
def read_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = db.query(database_models.User).filter(database_models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/users/", response_model=list[User])
def read_users(db: Session = Depends(get_db)):
    db_users = db.query(database_models.User).all()
    if db_users is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_users

@router.put("/users/{user_id}", response_model=User)
def update_user(user_id: uuid.UUID, updated_user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(database_models.User).filter(database_models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.username = updated_user.username
    db_user.email = updated_user.email
    db_user.phone = updated_user.phone
    db_user.role = updated_user.role #TODO
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
def delete_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = db.query(database_models.User).filter(database_models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}

@router.post("/users/signup")
def register_user(user_in: UserReg, session: Session = Depends(get_db)):
    user = ((session.query(database_models.User)
            .where((database_models.User.email == user_in.email) | (database_models.User.username == user_in.username)))
            .scalar())
    if user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с такой почтой или именем уже существует",
        )
    user = create_user(db=session, user=user_in)
    return {"message": "User registered successfully"}  # Remove role from response

@router.get("/users_login/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
