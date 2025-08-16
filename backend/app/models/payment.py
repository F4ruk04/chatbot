from sqlalchemy import Table, Column, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum

from ..database import Base, metadata # Import metadata from database.py

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class PaymentMethod(str, enum.Enum):
    MPESA = "mpesa"
    EMOLA = "emola"
    CARD = "card"

# Define the Payment table using Table and Column directly
payments_table = Table(
    "payments",
    metadata, # Use the metadata object from database.py
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id")),
    Column("amount", Float, nullable=False),
    Column("currency", String, default="MZN"),
    Column("payment_method", String, nullable=False),
    Column("status", String, default=PaymentStatus.PENDING),
    Column("pagolu_payment_id", String, unique=True),
    Column("created_at", DateTime, default=datetime.utcnow),
    Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow),
    Column("extra_data", String)  # JSON string for additional data
)

class Payment(Base):
    __table__ = payments_table # Link the class to the explicitly defined table

    # No need to redefine columns here, they are mapped via __table__
    # Add relationships if needed, e.g.:
    # user = relationship("User")
