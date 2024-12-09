import uuid
from typing import Annotated

from fastapi import FastAPI, HTTPException, Depends

import click
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlmodel import Session

import dependencies
from config import Settings
from dependencies import engine, get_password_hash, verify_password, get_current_user
from pydantic_models import User, Project, Task
import database_models

def create_tables():
    database_models.Base_UUID.metadata.create_all(bind=engine)
app = FastAPI()

def get_db():
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()

# Маршруты
@app.get("/")
def read_root():
    return {"Hello": "World"}

# CRUD для пользователей
@app.post("/users/", response_model=User)
def create_user(user: User, db: Session = Depends(get_db)):
    db_user = database_models.User(
        username=user.username,
        email=user.email,
        phone=user.phone,
        password_hash=get_password_hash(user.password_hash),
        role=user.role,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/{user_id}", response_model=User)
def read_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = db.query(database_models.User).filter(database_models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/users/{user_id}", response_model=User)
def update_user(user_id: uuid.UUID, updated_user: User, db: Session = Depends(get_db)):
    db_user = db.query(database_models.User).filter(database_models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.username = updated_user.username
    db_user.email = updated_user.email
    db_user.phone = updated_user.phone
    db_user.password_hash = get_password_hash(updated_user.password_hash)
    db_user.role = updated_user.role
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
def delete_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = db.query(database_models.User).filter(database_models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}

# CRUD для проектов
@app.post("/projects/", response_model=Project)
def create_project(project: Project, db: Session = Depends(get_db)):
    db_project = database_models.Project(
        name=project.name,
        description=project.description,
        start_date=project.start_date,
        end_date=project.end_date
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/{project_id}", response_model=Project)
def read_project(project_id: uuid.UUID, db: Session = Depends(get_db)):
    db_project = db.query(database_models.Project).filter(database_models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@app.put("/projects/{project_id}", response_model=Project)
def update_project(project_id: uuid.UUID, updated_project: Project, db: Session = Depends(get_db)):
    db_project = db.query(database_models.Project).filter(database_models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    db_project.name = updated_project.name
    db_project.description = updated_project.description
    db_project.start_date = updated_project.start_date
    db_project.end_date = updated_project.end_date
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/projects/{project_id}")
def delete_project(project_id: uuid.UUID, db: Session = Depends(get_db)):
    db_project = db.query(database_models.Project).filter(database_models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted"}

# CRUD для задач
@app.post("/tasks/", response_model=Task)
def create_task(task: Task, db: Session = Depends(get_db)):
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
    return db_task

@app.get("/tasks/{task_id}", response_model=Task)
def read_task(task_id: uuid.UUID, db: Session = Depends(get_db)):
    db_task = db.query(database_models.Task).filter(database_models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: uuid.UUID, updated_task: Task, db: Session = Depends(get_db)):
    db_task = db.query(database_models.Task).filter(database_models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.title = updated_task.title
    db_task.description = updated_task.description
    db_task.status = updated_task.status
    db_task.due_date = updated_task.due_date
    db_task.project_id = updated_task.project_id
    db_task.created_by = updated_task.created_by
    db_task.assigned_to = updated_task.assigned_to
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: uuid.UUID, db: Session = Depends(get_db)):
    db_task = db.query(database_models.Task).filter(database_models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}


@click.group()
@click.pass_context
def root(ctx):
    settings = Settings()

@root.group(name="manage")
def manage_group():
    """manage commands"""

@manage_group.command(name="create_tables")
def create_tables_command():
    create_tables()
@manage_group.command(name="create_user")
@click.option('--username', prompt='Your name please')
@click.option(
    '--password',
    prompt=True,
    hide_input=True,
    confirmation_prompt=True,
)
def create_user(username: str, password: str):
    print(database_models.Base_decl.metadata)
    with Session(engine) as session:
        domain_user = database_models.User(
            username=username,
            password_hash=get_password_hash(password),
            is_active=True,
            role=0
        )
        session.add(domain_user)
        session.commit()
        session.refresh(domain_user)

@app.post('/login/access-token')
def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: Session = Depends(get_db)):
    user = session.query(database_models.User).filter(database_models.User.username == form_data.username).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token = dependencies.create_access_token(user.id)
    #response.set_cookie(key='access_token', value=f"Bearer {access_token}", httponly=True)

    return {"access_token": access_token,
            "token_type": "bearer"}

@app.get("/users_login/me", response_model=User)
def read_users_me(current_user: User=Depends(get_current_user)):
    return current_user

if __name__ == "__main__":
    root()