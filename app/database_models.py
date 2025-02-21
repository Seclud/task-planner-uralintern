import uuid
from datetime import datetime, UTC, date
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects import postgresql as sa_psql

utc_now = datetime.now(UTC)
Base_decl = declarative_base()


class Base(Base_decl):
    __abstract__ = True

    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        default=utc_now,
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )


class Base_UUID(Base):
    __abstract__ = True

    id: Mapped[uuid.UUID] = mapped_column(
        sa_psql.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


class Role(Base):
    __tablename__ = 'roles'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True, nullable=False, comment='Название роли')


class UserProjectLink(Base):
    __tablename__ = 'user_project_link'

    user_id: Mapped[uuid.UUID] = mapped_column(sa_psql.UUID(as_uuid=True), sa.ForeignKey('users.id'), primary_key=True)
    project_id: Mapped[uuid.UUID] = mapped_column(sa_psql.UUID(as_uuid=True), sa.ForeignKey('projects.id'),
                                                  primary_key=True)


class User(Base_UUID):
    __tablename__ = 'users'

    username: Mapped[str] = mapped_column(unique=True, comment='Имя пользователя')
    email: Mapped[str] = mapped_column(nullable=True, unique=True, comment='Электронная почта')
    phone: Mapped[str] = mapped_column(nullable=True, comment='Телефон')
    password_hash: Mapped[str] = mapped_column(comment='Хэш пароля')
    role: Mapped[int] = mapped_column(sa.ForeignKey('roles.id'), comment='Идентификатор роли')
    is_active: Mapped[bool] = mapped_column(sa.Boolean(), default=True, comment='Активен')
    projects: Mapped[list["Project"]] = relationship(secondary='user_project_link', back_populates='participants')


class Project(Base_UUID):
    __tablename__ = 'projects'

    name: Mapped[str] = mapped_column(nullable=False, comment='Название проекта')
    description: Mapped[str] = mapped_column(nullable=True, comment='Описание проекта')
    start_date: Mapped[datetime] = mapped_column(sa.Date, nullable=True, comment='Дата начала')
    end_date: Mapped[datetime] = mapped_column(sa.Date, nullable=True, comment='Дата окончания')
    created_by: Mapped[uuid.UUID] = mapped_column(nullable=False, comment="Создатель проекта")
    participants: Mapped[list["User"]] = relationship(secondary='user_project_link', back_populates='projects')
    statuses: Mapped[list[str]] = mapped_column(sa.ARRAY(sa.String),
                                                default=["Новые задачи", "В процессе", "Ревью", "Завершенные"],
                                                comment='Статусы задач')


class Task(Base_UUID):
    __tablename__ = 'tasks'

    project_id: Mapped[uuid.UUID] = mapped_column(
        sa_psql.UUID(as_uuid=True),
        sa.ForeignKey('projects.id', ondelete='CASCADE'),
        comment='Идентификатор проекта'
    )
    title: Mapped[str] = mapped_column(nullable=False, comment='Название задачи')
    description: Mapped[str] = mapped_column(nullable=True, comment='Описание задачи')
    status: Mapped[str] = mapped_column(comment='Статус задачи')
    due_date: Mapped[date] = mapped_column(sa.Date, nullable=True, comment='Срок выполнения')
    created_by: Mapped[uuid.UUID] = mapped_column(sa_psql.UUID(as_uuid=True), sa.ForeignKey('users.id'),
                                                  comment='Создано пользователем')
    assigned_to: Mapped[uuid.UUID] = mapped_column(sa_psql.UUID(as_uuid=True), sa.ForeignKey('users.id'),
                                                   comment='Назначено пользователю')


class File(Base_UUID):
    __tablename__ = 'files'

    task_id: Mapped[uuid.UUID] = mapped_column(sa_psql.UUID(as_uuid=True), sa.ForeignKey('tasks.id'),
                                               comment='Идентификатор задачи')
    file_path: Mapped[str] = mapped_column(nullable=False, comment='Путь к файлу')


class ActivityLog(Base_UUID):
    __tablename__ = 'activitylog'

    user_id: Mapped[uuid.UUID] = mapped_column(sa_psql.UUID(as_uuid=True), sa.ForeignKey('users.id'),
                                               comment='Идентификатор пользователя')
    action: Mapped[str] = mapped_column(nullable=False, comment='Действие')


class Comment(Base_UUID):
    __tablename__ = 'comments'

    task_id: Mapped[uuid.UUID] = mapped_column(sa_psql.UUID(as_uuid=True),
                                               sa.ForeignKey('tasks.id', ondelete='CASCADE'),
                                               comment='Идентификатор задачи')
    user_id: Mapped[uuid.UUID] = mapped_column(sa_psql.UUID(as_uuid=True),
                                               sa.ForeignKey('users.id', ondelete='SET NULL'),
                                               comment='Идентификатор пользователя')
    content: Mapped[str] = mapped_column(nullable=False, comment='Содержание')
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), default=utc_now, comment='Дата создания')


class Request(Base_UUID):
    __tablename__ = 'requests'

    user_id: Mapped[uuid.UUID] = mapped_column(
        sa_psql.UUID(as_uuid=True),
        sa.ForeignKey('users.id'),
        nullable=False,
        comment='Идентификатор пользователя'
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        sa_psql.UUID(as_uuid=True),
        sa.ForeignKey('projects.id'),
        nullable=False,
        comment='Идентификатор проекта'
    )
    status: Mapped[str] = mapped_column(
        nullable=False,
        comment='Статус запроса'
    )
