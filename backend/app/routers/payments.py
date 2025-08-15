from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime, timedelta
import json

from ..database import get_db
from ..models import Payment, Subscription, User
from ..services.pagolu_service import PagoluService # Assuming PagoluService is still needed
from ..utils.auth import get_current_user
from ..config import settings

router = APIRouter()

PLAN_PRICES = {
    "free": 0,
    "pro": 2499,  # 2.499 MZN
    "business": 6999  # 6.999 MZN
}

def get_plan_quota(plan: str) -> int:
    quotas = {
        "free": 150,
        "pro": 3000,
        "business": 10000
    }
    return quotas.get(plan, 0)

# Placeholder for a new checkout endpoint or if Pagolu is used for checkout
@router.post("/checkout/{plan}")
async def create_checkout(
    plan: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Plano inválido")

    # This endpoint needs to be re-implemented with the new payment gateway
    # For now, it will just return a placeholder response
    return {
        "message": "Checkout functionality needs to be implemented with a new payment gateway.",
        "plan": plan,
        "user_id": str(current_user.id)
    }

# Placeholder for a new webhook endpoint or if Pagolu has a webhook
@router.post("/webhook/payment-status")
async def payment_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Webhook para receber notificações de pagamento (genérico)"""
    # This webhook needs to be re-implemented with the new payment gateway's logic
    # For now, it will just return a success response
    return {"status": "success", "message": "Generic webhook received."}
