from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.database_models import Request as DBRequest, UserProjectLink, Project, User
from app.pydantic_models import Request, RequestCreate, RequestUpdate

router = APIRouter()

@router.post("/", response_model=Request)
def create_request(request: RequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_request = DBRequest(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/pending", response_model=list[Request])
def get_pending_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pending_requests = db.query(DBRequest).filter(DBRequest.status == 'pending').all()
    return pending_requests

@router.get("/{request_id}", response_model=Request)
def read_request(request_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_request = db.query(DBRequest).filter(DBRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_request

@router.delete("/{request_id}")
def delete_request(request_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_request = db.query(DBRequest).filter(DBRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(db_request)
    db.commit()
    return {"detail": "Request deleted"}

@router.post("/{request_id}/approve")
def approve_request(request_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_request = db.query(DBRequest).filter(DBRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    db_project = db.query(Project).filter(Project.id == db_request.project_id).first()
    db_user = db.query(User).filter(User.id == db_request.user_id).first()

    if db_project and db_user:
        user_project_link = UserProjectLink(user_id=db_user.id, project_id=db_project.id)
        db.add(user_project_link)
        db_request.status = 'approved'
        db.commit()
        return {"message": "Request approved"}
    else:
        raise HTTPException(status_code=404, detail="Project or User not found")

@router.post("/{request_id}/reject")
def reject_request(request_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_request = db.query(DBRequest).filter(DBRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    db_request.status = 'rejected'
    db.commit()
    return {"message": "Request rejected"}
