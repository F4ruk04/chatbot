from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum

from ..database import Base

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class PaymentMethod(str, enum.Enum):
    MPESA = "mpesa"
    EMOLA = "emola"
    CARD = "card"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    currency = Column(String, default="MZN")
    payment_method = Column(String, nullable=False)
    status = Column(String, default=PaymentStatus.PENDING)
    pagolu_payment_id = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata = Column(String)  # JSON string for additional data
