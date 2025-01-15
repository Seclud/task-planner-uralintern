import typing
import uuid
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

UserId = typing.NewType('UserId', uuid.UUID)
RoleId = typing.NewType('RoleId', int)
ProjectId = typing.NewType('ProjectId', uuid.UUID)
TaskId = typing.NewType('TaskId', uuid.UUID)
FileId = typing.NewType('FileId', uuid.UUID)
ActivityLogId = typing.NewType('ActivityLogId', uuid.UUID)
CommentId = typing.NewType('CommentId', uuid.UUID)
RequestId = typing.NewType('RequestId', uuid.UUID)


class Role(BaseModel):
    id: RoleId = Field(title='Role Identifier')
    name: str = Field(title='Role Name')


class User(BaseModel):
    id: UserId = Field(title='User Identifier')
    username: str = Field(title='User Name')
    email: str | None = Field(title='User Email')
    phone: Optional[str] | None = Field(title='User Phone')
    password_hash: str = Field(title='Password Hash')
    role: Optional[RoleId] | None = Field(title='Role Identifier')


class UserReg(BaseModel):
    username: str = Field(title='User Name')
    email: str | None = Field(title='User Email')
    phone: Optional[str] | None = Field(title='User Phone')
    password: str = Field(title='Password')


class UserUpdate(BaseModel):
    username: str = Field(title='User Name')
    email: str | None = Field(title='User Email')
    phone: Optional[str] | None = Field(title='User Phone')
    role: int | None = Field(title="User Role")


class Project(BaseModel):
    id: ProjectId = Field(title='Project Identifier')
    name: str = Field(title='Project Name')
    description: Optional[str] = Field(title='Project Description')
    start_date: Optional[date] = Field(title='Project Start Date')
    end_date: Optional[date] = Field(title='Project End Date')


class ProjectCreate(BaseModel):
    name: str = Field(title='Project Name')
    description: Optional[str] = Field(title='Project Description')
    start_date: Optional[date] = Field(title='Project Start Date')
    end_date: Optional[date] = Field(title='Project End Date')
    created_by: uuid.UUID = Field(title="Создатель проекта")
    participants: list[uuid.UUID] = Field(title="Участники проекта")
    statuses: list[str] = Field(default=["Новые задачи", "В процессе", "Ревью", "Завершенные"],
                                title="Статусы задач")


class ProjectUpdate(BaseModel):
    name: str = Field(title='Project Name')
    description: Optional[str] = Field(title='Project Description')
    start_date: Optional[date] = Field(title='Project Start Date')
    end_date: Optional[date] = Field(title='Project End Date')
    participants: list[uuid.UUID] = Field(title="Участники проекта")
    statuses: list[str] = Field(default=["Просроченные", "Новые задачи", "В процессе", "Ревью", "Завершенные"],
                                title="Статусы задач")


class Task(BaseModel):
    id: TaskId = Field(title='Task Identifier')
    project_id: Optional[ProjectId] = Field(title='Project Identifier')
    title: str = Field(title='Task Title')
    description: Optional[str] = Field(title='Task Description')
    status: Optional[str] = Field(title='Task Status Identifier')
    due_date: Optional[date] = Field(title='Task Due Date')
    created_by: Optional[UserId] = Field(title='Created By User Identifier')
    assigned_to: Optional[UserId] = Field(title='Assigned To User Identifier')


class TaskCreate(BaseModel):
    project_id: Optional[ProjectId] = Field(title='Project Identifier')
    title: str = Field(title='Task Title')
    description: Optional[str] = Field(title='Task Description')
    status: Optional[str] = Field(title='Task Status Identifier')
    due_date: Optional[date] = Field(title='Task Due Date')
    created_by: Optional[UserId] = Field(title='Created By User Identifier')
    assigned_to: Optional[UserId] = Field(title='Assigned To User Identifier')


class TaskUpdate(BaseModel):
    title: str = Field(title='Task Title')
    description: Optional[str] = Field(title='Task Description')
    status: Optional[str] = Field(title='Task Status Identifier')
    due_date: Optional[date] = Field(title='Task Due Date')
    assigned_to: Optional[UserId] = Field(title='Assigned To User Identifier')


class File(BaseModel):
    id: FileId = Field(title='File Identifier')
    task_id: Optional[TaskId] = Field(title='Task Identifier')
    file_path: str = Field(title='File Path')


class ActivityLog(BaseModel):
    id: ActivityLogId = Field(title='Activity Log Identifier')
    user_id: Optional[UserId] = Field(title='User Identifier')
    action: str = Field(title='Action')
    timestamp: Optional[datetime] = Field(title='Timestamp')


class Comment(BaseModel):
    id: CommentId = Field(title='Comment Identifier')
    task_id: Optional[TaskId] = Field(title='Task Identifier')
    user_id: Optional[UserId] = Field(title='User Identifier')
    content: str = Field(title='Content')
    created_at: Optional[datetime] = Field(title='Created At')


class CommentCreate(BaseModel):
    task_id: Optional[TaskId] = Field(title='Task Identifier')
    user_id: Optional[UserId] = Field(title='User Identifier')
    content: str = Field(title='Content')


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginData(BaseModel):
    username: str
    password: str


class Request(BaseModel):
    id: RequestId = Field(title='Request Identifier')
    user_id: UserId = Field(title='User Identifier')
    project_id: ProjectId = Field(title='Project Identifier')
    status: str = Field(title='Request Status')


class RequestCreate(BaseModel):
    user_id: UserId = Field(title='User Identifier')
    project_id: ProjectId = Field(title='Project Identifier')
    status: str = Field(title='Request Status')


class RequestUpdate(BaseModel):
    status: Optional[str] = Field(title='Request Status')
