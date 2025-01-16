from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI

import click
from sqlmodel import Session
from fastapi.middleware.cors import CORSMiddleware
from .config import Settings
from .dependencies import engine, get_password_hash
from . import database_models, mails
from .routes import users, projects, tasks, auth, roles, comments, requests


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(mails.send_task_reminder, 'interval', days=1)
    scheduler.start()


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield


def create_tables():
    database_models.Base.metadata.create_all(bind=engine)


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost",
    "https://planningpro.up.railway.app",
    "https://planningpro.up.railway.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(auth.router)
app.include_router(roles.router)
app.include_router(comments.router)
app.include_router(requests.router, prefix="/requests")


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
