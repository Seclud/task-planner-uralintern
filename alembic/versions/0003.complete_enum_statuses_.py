"""Add review and overdue statuses

Revision ID: 0003.complete_enum_statuses
Revises: 0002.remove_taskstatus_table
Create Date: 2024-12-18 01:34:50.547116

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0003.complete_enum_statuses'
down_revision: Union[str, None] = '0002.remove_taskstatus_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Define the new enum type
new_status_enum = postgresql.ENUM('open', 'inprogress', 'completed', 'review', 'overdue', name='taskstatus', create_type=False)

def upgrade() -> None:
    # Create the new enum type in the database
    new_status_enum.create(op.get_bind(), checkfirst=True)

    # Alter the column to use the new enum type
    op.execute("ALTER TYPE taskstatus ADD VALUE 'review'")
    op.execute("ALTER TYPE taskstatus ADD VALUE 'overdue'")

def downgrade() -> None:
    # Define the old enum type
    old_status_enum = postgresql.ENUM('open', 'inprogress', 'completed', name='taskstatus', create_type=False)

    # Alter the column to use the old enum type
    op.alter_column('tasks', 'status',
               existing_type=new_status_enum,
               type_=old_status_enum,
               existing_nullable=False)

    # Drop the new enum type from the database
    new_status_enum.drop(op.get_bind(), checkfirst=True)
