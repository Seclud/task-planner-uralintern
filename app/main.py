from fastapi import FastAPI

import click
from sqlmodel import Session
from fastapi.middleware.cors import CORSMiddleware
from .config import Settings
from .dependencies import engine, get_password_hash
from . import database_models
from .routes import users, projects, tasks, auth, roles, comments


def create_tables():
    database_models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost",
    "https://planningpro.up.railway.app",
    "https://backend-production-d986.up.railway.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(auth.router)
app.include_router(roles.router)
app.include_router(comments.router)

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
def create_user_manual(username: str, password: str):
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

if __name__ == "__main__":
    root()
