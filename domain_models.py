from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class RoleBase(BaseModel):
    name: str

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str]
    password_hash: str
    role: Optional[int]

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int

    class Config:
        orm_mode = True

class TaskStatusBase(BaseModel):
    name: str

class TaskStatusCreate(TaskStatusBase):
    pass

class TaskStatus(TaskStatusBase):
    id: int

    class Config:
        orm_mode = True

class TaskBase(BaseModel):
    project_id: Optional[int]
    title: str
    description: Optional[str]
    status: Optional[int]
    due_date: Optional[date]
    created_by: Optional[int]
    assigned_to: Optional[int]

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int

    class Config:
        orm_mode = True

class FileBase(BaseModel):
    task_id: Optional[int]
    file_path: str

class FileCreate(FileBase):
    pass

class File(FileBase):
    id: int

    class Config:
        orm_mode = True

class ActivityLogBase(BaseModel):
    user_id: Optional[int]
    action: str
    timestamp: Optional[datetime]

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    id: int

    class Config:
        orm_mode = True

class CommentBase(BaseModel):
    task_id: Optional[int]
    user_id: Optional[int]
    content: str
    created_at: Optional[datetime]

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int

    class Config:
        orm_mode = True