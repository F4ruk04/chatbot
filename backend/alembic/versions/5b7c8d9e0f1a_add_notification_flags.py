"""Add notification flags to subscriptions

Revision ID: 5b7c8d9e0f1a
Revises: 4a8b9c2d1e3f
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5b7c8d9e0f1a'
down_revision = '4a8b9c2d1e3f'
branch_labels = None
depends_on = None


def upgrade():
    # Add notification flags to subscriptions table
    op.add_column('subscriptions', sa.Column('notified_80', sa.Boolean(), default=False))
    op.add_column('subscriptions', sa.Column('notified_100', sa.Boolean(), default=False))


def downgrade():
    # Remove notification flags from subscriptions table
    op.drop_column('subscriptions', 'notified_100')
    op.drop_column('subscriptions', 'notified_80')