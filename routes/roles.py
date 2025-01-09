from fastapi import APIRouter, Depends
from sqlmodel import Session
from dependencies import get_db
import database_models

router = APIRouter()

@router.get("/roles")
def read_roles(session: Session = Depends(get_db)):
    db_roles = session.query(database_models.Role).all()
    return db_roles
