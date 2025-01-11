import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from dependencies import get_db, get_current_user
from pydantic_models import Project, ProjectCreate, User, ProjectUpdate
import database_models

router = APIRouter()

@router.post("/projects/", response_model=Project)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = database_models.Project(
        name=project.name,
        description=project.description,
        start_date=project.start_date,
        end_date=project.end_date,
        created_by=project.created_by,
        statuses=project.statuses
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    for participant_id in project.participants:
        db_user = db.query(database_models.User).filter(database_models.User.id == participant_id).first()
        if db_user:
            db_project.participants.append(db_user)

    db.commit()
    db.refresh(db_project)
    
    
    db_activity_log = database_models.ActivityLog(
        user_id=project.created_by,
        action="Project created"
    )
    db.add(db_activity_log)
    db.commit()
    
    return db_project

@router.get("/projects/all", response_model=list[Project])
def read_all_projects(db: Session = Depends(get_db)):
    projects = db.query(database_models.Project).all()
    return projects

@router.get("/projects/{project_id}")
def read_project(project_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_project = db.query(database_models.Project).filter(
        database_models.Project.id == project_id,
    ).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.put("/projects/{project_id}", response_model=Project)
def update_project(project_id: uuid.UUID, updated_project: ProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(database_models.Project).filter(database_models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_project.name = updated_project.name
    db_project.description = updated_project.description
    db_project.start_date = updated_project.start_date
    db_project.end_date = updated_project.end_date
    db_project.statuses = updated_project.statuses

    db_project.participants.clear()
    db.commit()

    for participant_id in updated_project.participants:
        db_user = db.query(database_models.User).filter(database_models.User.id == participant_id).first()
        if db_user:
            db_project.participants.append(db_user)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/projects/{project_id}")
def delete_project(project_id: uuid.UUID, db: Session = Depends(get_db)):
    db_project = db.query(database_models.Project).filter(database_models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted"}

@router.get("/projects/", response_model=list[Project])
def read_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = db.query(database_models.Project).filter(
        (database_models.Project.created_by == current_user.id) |
        (database_models.Project.participants.any(database_models.User.id == current_user.id))
    ).all()
    return projects

@router.get("/projects/{project_id}/participants", response_model=list[User])
def get_project_participants(project_id: uuid.UUID, db: Session = Depends(get_db)):
    db_project = db.query(database_models.Project).filter(database_models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    participants = db.query(database_models.User).join(database_models.UserProjectLink).filter(
        database_models.UserProjectLink.project_id == project_id
    ).all()

    return participants