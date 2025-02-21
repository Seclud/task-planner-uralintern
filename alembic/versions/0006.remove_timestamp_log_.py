"""empty message

Revision ID: 0006.remove_timestamp_log
Revises: 0005_alter_tasks_project_id_fk
Create Date: 2024-12-19 05:06:35.153070

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0006.remove_timestamp_log'
down_revision: Union[str, None] = '0005_alter_tasks_project_id_fk'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('activitylog', 'timestamp')
    op.alter_column('tasks', 'status',
               existing_type=postgresql.ENUM('open', 'inProgress', 'completed', 'review', 'overdue', name='taskstatus'),
               comment='Идентификатор статуса задачи',
               existing_nullable=False)
    op.drop_constraint('tasks_project_id_fkey', 'tasks', type_='foreignkey')
    op.create_foreign_key(None, 'tasks', 'projects', ['project_id'], ['id'])
    op.drop_constraint('user_project_link_project_id_fkey', 'user_project_link', type_='foreignkey')
    op.drop_constraint('user_project_link_user_id_fkey', 'user_project_link', type_='foreignkey')
    op.create_foreign_key(None, 'user_project_link', 'users', ['user_id'], ['id'])
    op.create_foreign_key(None, 'user_project_link', 'projects', ['project_id'], ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'user_project_link', type_='foreignkey')
    op.drop_constraint(None, 'user_project_link', type_='foreignkey')
    op.create_foreign_key('user_project_link_user_id_fkey', 'user_project_link', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('user_project_link_project_id_fkey', 'user_project_link', 'projects', ['project_id'], ['id'], ondelete='CASCADE')
    op.drop_constraint(None, 'tasks', type_='foreignkey')
    op.create_foreign_key('tasks_project_id_fkey', 'tasks', 'projects', ['project_id'], ['id'], ondelete='CASCADE')
    op.alter_column('tasks', 'status',
               existing_type=postgresql.ENUM('open', 'inProgress', 'completed', 'review', 'overdue', name='taskstatus'),
               comment=None,
               existing_comment='Идентификатор статуса задачи',
               existing_nullable=False)
    op.add_column('activitylog', sa.Column('timestamp', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=False, comment='Временная метка'))
    # ### end Alembic commands ###
