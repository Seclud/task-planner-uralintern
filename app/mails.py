import smtplib
from email.mime.text import MIMEText

from app.config import Settings
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.dependencies import engine
from app.database_models import Task, User


def send_email(email_data):
    from_name = "planningPro"
    from_email = Settings().SMTP_USER
    msg = MIMEText(email_data["body"])
    msg["Subject"] = email_data["subject"]
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = email_data["to"]

    print(msg)
    print(from_email)
    print(Settings().SMTP_HOST, Settings().SMTP_PORT)

    try:
        s = smtplib.SMTP_SSL(Settings().SMTP_HOST, Settings().SMTP_PORT)
        s.login(Settings().SMTP_USER, Settings().SMTP_PASSWORD)
        s.sendmail(from_email, msg["To"], msg.as_string())
        s.quit()
        return "Email sent successfully"
    except Exception as e:
        return f"failed to send email: {str(e)}"
    


def send_task_reminder():
    with Session(engine) as session:
        current_date = date.today()
        tomorrow = current_date + timedelta(days=1)

        statement = (
            select(Task, User)
            .join(User, User.id == Task.assigned_to)
            .where(Task.due_date == tomorrow)
        )
        results = session.execute(statement).all()

        for task, user in results:
            email_data = {
                "subject": "Напоминание о задаче",
                "body": f"Напоминание: Завтра заканчивается срок у задачи '{task.title}' {Settings().FRONTEND_HOST}/tasks/{task.id}",
                "to": user.email,
            }
            send_email(email_data)