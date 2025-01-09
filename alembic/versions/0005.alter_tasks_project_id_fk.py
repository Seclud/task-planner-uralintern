"""Alter tasks project_id FK to cascade on delete

Revision ID: 0005_alter_tasks_project_id_fk
Revises: 0004.projects_link_table
Create Date: 2024-12-18 17:18:54.530261

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0005_alter_tasks_project_id_fk'
down_revision: Union[str, None] = '0004.projects_link_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the existing foreign key constraint
    op.drop_constraint('tasks_project_id_fkey', 'tasks', type_='foreignkey')

    # Create a new foreign key constraint with cascade on delete
    op.create_foreign_key(
        'tasks_project_id_fkey',
        'tasks',
        'projects',
        ['project_id'],
        ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    # Drop the foreign key constraint with cascade on delete
    op.drop_constraint('tasks_project_id_fkey', 'tasks', type_='foreignkey')

    # Recreate the original foreign key constraint without cascade on delete
    op.create_foreign_key(
        'tasks_project_id_fkey',
        'tasks',
        'projects',
        ['project_id'],
        ['id']
    )
