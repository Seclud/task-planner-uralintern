"""empty message

Revision ID: 0007.taskstatus_str
Revises: 0006.remove_timestamp_log
Create Date: 2025-01-08 17:50:56.251151

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0007.taskstatus_str'
down_revision: Union[str, None] = '0006.remove_timestamp_log'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'tasks',
        'status',
        type_=sa.String(),
        postgresql_using="status::varchar(255)",
        existing_nullable=False
    )
    op.execute("DROP TYPE taskstatus")


def downgrade() -> None:
    op.execute("CREATE TYPE taskstatus AS ENUM('open', 'inProgress', 'completed', 'review', 'overdue')")
    op.alter_column(
        'tasks',
        'status',
        existing_type=sa.String(),
        type_=postgresql.ENUM('open', 'inProgress', 'completed', 'review', 'overdue', name='taskstatus'),
        postgresql_using="status::taskstatus",
        existing_nullable=False
    )
    # ### end Alembic commands ###
