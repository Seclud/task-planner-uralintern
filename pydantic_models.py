import typing
import uuid
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

UserId = typing.NewType('UserId', uuid.UUID)
RoleId = typing.NewType('RoleId', int)
ProjectId = typing.NewType('ProjectId', uuid.UUID)
TaskStatusId = typing.NewType('TaskStatusId', uuid.UUID)
TaskId = typing.NewType('TaskId', uuid.UUID)
FileId = typing.NewType('FileId', uuid.UUID)
ActivityLogId = typing.NewType('ActivityLogId', uuid.UUID)
CommentId = typing.NewType('CommentId', uuid.UUID)

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

class Project(BaseModel):
    id: ProjectId = Field(title='Project Identifier')
    name: str = Field(title='Project Name')
    description: Optional[str] = Field(title='Project Description')
    start_date: Optional[date] = Field(title='Project Start Date')
    end_date: Optional[date] = Field(title='Project End Date')

class TaskStatus(BaseModel):
    id: TaskStatusId = Field(title='Task Status Identifier')
    name: str = Field(title='Task Status Name')

class Task(BaseModel):
    id: TaskId = Field(title='Task Identifier')
    project_id: Optional[ProjectId] = Field(title='Project Identifier')
    title: str = Field(title='Task Title')
    description: Optional[str] = Field(title='Task Description')
    status: Optional[TaskStatusId] = Field(title='Task Status Identifier')
    due_date: Optional[date] = Field(title='Task Due Date')
    created_by: Optional[UserId] = Field(title='Created By User Identifier')
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