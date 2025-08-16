from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean
from datetime import datetime
import enum

from ..database import Base

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"

class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    BUSINESS = "business"

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan = Column(String, nullable=False)
    status = Column(String, default=SubscriptionStatus.PENDING)
    current_period_start = Column(DateTime, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cancel_at_period_end = Column(Boolean, default=False)
    messages_quota = Column(Integer)
    messages_used = Column(Integer, default=0)
    last_payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    
    # Flags de notificação
    notified_80 = Column(Boolean, default=False)
    notified_100 = Column(Boolean, default=False)