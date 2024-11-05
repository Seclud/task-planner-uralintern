from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class Role(BaseModel):
    id: Optional[int]
    name: str

class User(BaseModel):
    id: Optional[int]
    name: str
    email: str
    phone: Optional[str]
    password_hash: str
    role: Optional[int]

class Project(BaseModel):
    id: Optional[int]
    name: str
    description: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]

class TaskStatus(BaseModel):
    id: Optional[int]
    name: str

class Task(BaseModel):
    id: Optional[int]
    project_id: Optional[int]
    title: str
    description: Optional[str]
    status: Optional[int]
    due_date: Optional[date]
    created_by: Optional[int]
    assigned_to: Optional[int]

class File(BaseModel):
    id: Optional[int]
    task_id: Optional[int]
    file_path: str

class ActivityLog(BaseModel):
    id: Optional[int]
    user_id: Optional[int]
    action: str
    timestamp: Optional[datetime]

class Comment(BaseModel):
    id: Optional[int]
    task_id: Optional[int]
    user_id: Optional[int]
    content: str
    created_at: Optional[datetime]