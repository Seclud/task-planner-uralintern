import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from app.dependencies import get_db, get_current_user
from app.pydantic_models import Task, TaskCreate, User, TaskUpdate
from app import database_models

router = APIRouter()

@router.post("/tasks/", response_model=Task)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_task = database_models.Task(
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        status=task.status,
        due_date=task.due_date,
        created_by=task.created_by,
        assigned_to=task.assigned_to
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    
    db_activity_log = database_models.ActivityLog(
        user_id=task.created_by,
        action="Task created"
    )
    db.add(db_activity_log)
    db.commit()
    
    return db_task

@router.get("/projects/{project_id}/tasks")
def read_tasks(project_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_tasks = db.query(database_models.Task).filter(
        database_models.Task.project_id == project_id,
    ).all()
    return db_tasks

@router.put("/tasks/{task_id}")
def update_task(task_id: uuid.UUID, updated_task: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_task = db.query(database_models.Task).filter(database_models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.title = updated_task.title
    db_task.description = updated_task.description
    db_task.status = updated_task.status
    db_task.due_date = updated_task.due_date
    db_task.assigned_to = updated_task.assigned_to
    db.commit()
    db.refresh(db_task)

    db.commit()
    
    return db_task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_task = db.query(database_models.Task).filter(database_models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}

@router.get("/tasks/", response_model=list[Task])
def read_user_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(database_models.Task).filter(
        database_models.Task.assigned_to == current_user.id
    ).all()
    return tasks

@router.get("/tasks/{task_id}", response_model=Task)
def read_task(task_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_task = db.query(database_models.Task).filter(
        database_models.Task.id == task_id
    ).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task


