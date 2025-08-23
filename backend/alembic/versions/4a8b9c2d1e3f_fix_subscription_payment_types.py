"""fix subscription and payment types to use Integer instead of UUID

Revision ID: 4a8b9c2d1e3f
Revises: 3f1a2c9b40e2
Create Date: 2025-08-16 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '4a8b9c2d1e3f'
down_revision = '3f1a2c9b40e2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop existing tables if they exist (with CASCADE to handle foreign keys)
    op.execute("DROP TABLE IF EXISTS subscriptions")
    op.execute("DROP TABLE IF EXISTS payments")
    
    # Create payments table with Integer IDs
    op.create_table('payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('payment_method', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('pagolu_payment_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('extra_data', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('pagolu_payment_id')
    )
    op.create_index(op.f('ix_payments_id'), 'payments', ['id'], unique=False)
    
    # Create subscriptions table with Integer IDs
    op.create_table('subscriptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('plan', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('current_period_start', sa.DateTime(), nullable=False),
        sa.Column('current_period_end', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('cancel_at_period_end', sa.Boolean(), nullable=True),
        sa.Column('messages_quota', sa.Integer(), nullable=True),
        sa.Column('messages_used', sa.Integer(), nullable=True),
        sa.Column('last_payment_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['last_payment_id'], ['payments.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subscriptions_id'), 'subscriptions', ['id'], unique=False)


def downgrade() -> None:
    # Drop the new tables
    op.drop_index(op.f('ix_subscriptions_id'), table_name='subscriptions')
    op.drop_table('subscriptions')
    op.drop_index(op.f('ix_payments_id'), table_name='payments')
    op.drop_table('payments')
    
    # Note: This downgrade doesn't recreate the old UUID-based tables
    # as that would require more complex data migration