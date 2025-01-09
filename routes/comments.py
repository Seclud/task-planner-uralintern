from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user
import database_models
import pydantic_models

router = APIRouter()

@router.post("/comments/", response_model=pydantic_models.Comment)
def create_comment(comment: pydantic_models.CommentCreate, db: Session = Depends(get_db)):
    db_comment = database_models.Comment(**comment.dict())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    
    db_activity_log = database_models.ActivityLog(
        user_id=comment.user_id,
        action="Comment created"
    )
    db.add(db_activity_log)
    db.commit()
    
    return db_comment

# @router.get("/comments/{comment_id}", response_model=pydantic_models.Comment)
# def read_comment(comment_id: int, db: Session = Depends(get_db)):
#     db_comment = db.query(database_models.Comment).filter(database_models.Comment.id == comment_id).first()
#     if db_comment is None:
#         raise HTTPException(status_code=404, detail="Comment not found")
#     return db_comment

# @router.put("/comments/{comment_id}", response_model=pydantic_models.Comment)
# def update_comment(comment_id: int, comment: pydantic_models.CommentUpdate, db: Session = Depends(get_db)):
#     db_comment = db.query(database_models.Comment).filter(database_models.Comment.id == comment_id).first()
#     if db_comment is None:
#         raise HTTPException(status_code=404, detail="Comment not found")
#     for key, value in comment.dict().items():
#         setattr(db_comment, key, value)
#     db.commit()
#     db.refresh(db_comment)
#     return db_comment

@router.delete("/comments/{comment_id}", response_model=pydantic_models.Comment)
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    db_comment = db.query(database_models.Comment).filter(database_models.Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(db_comment)
    db.commit()
    return db_comment

@router.get("/comments/tasks/{task_id}", response_model=list[pydantic_models.Comment])
def read_tasks_comment(task_id: str, db: Session = Depends(get_db)):
    db_comments = db.query(database_models.Comment).filter(database_models.Comment.task_id == task_id).all()
    print(db_comments)
    if db_comments is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return db_comments
