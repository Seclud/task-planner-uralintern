from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.database_models import Request as DBRequest
from app.pydantic_models import Request, RequestCreate, RequestUpdate

router = APIRouter()

@router.post("/", response_model=Request)
def create_request(request: RequestCreate, db: Session = Depends(get_db)):
    db_request = DBRequest(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/{request_id}", response_model=Request)
def read_request(request_id: str, db: Session = Depends(get_db)):
    db_request = db.query(DBRequest).filter(DBRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_request

@router.put("/{request_id}", response_model=Request)
def update_request(request_id: str, request: RequestUpdate, db: Session = Depends(get_db)):
    db_request = db.query(DBRequest).filter(DBRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    for key, value in request.dict(exclude_unset=True).items():
        setattr(db_request, key, value)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.delete("/{request_id}")
def delete_request(request_id: str, db: Session = Depends(get_db)):
    db_request = db.query(DBRequest).filter(DBRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(db_request)
    db.commit()
    return {"detail": "Request deleted"}
