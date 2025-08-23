"""add plan column to users

Revision ID: 3f1a2c9b40e2
Revises: 2685eea29f0f
Create Date: 2025-08-16 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3f1a2c9b40e2'
down_revision = '2685eea29f0f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adiciona a coluna 'plan' com default 'free' para registros existentes
    op.add_column('users', sa.Column('plan', sa.String(), nullable=False, server_default='free'))
    # Remove o server_default para manter a lógica de default no nível da aplicação
    # SQLite doesn't support ALTER COLUMN, so we'll skip this step


def downgrade() -> None:
    # Remove a coluna 'plan'
    op.drop_column('users', 'plan')
