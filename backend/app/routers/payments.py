from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime, timedelta
import json

from ..database import get_db
from ..models import Payment, Subscription, User
from ..utils.auth import get_current_user
from ..config import settings
from ..models.subscription import SubscriptionPlan, SubscriptionStatus
from ..services.feature_service import PLAN_LIMITS # Import PLAN_LIMITS

router = APIRouter()

# Placeholder for a new checkout endpoint or if Pagolu is used for checkout
@router.post("/payments/checkout") # Changed path to match frontend call
async def create_checkout(
    request: Request, # Use Request to get JSON body
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get data from request body
    request_data = await request.json()
    plan_id = request_data.get("plan")
    payment_method = request_data.get("payment_method")

    if plan_id not in PLAN_LIMITS:
        raise HTTPException(status_code=400, detail="Plano inválido")

    # Get plan limits from central definition
    selected_plan_limits = PLAN_LIMITS.get(plan_id)
    if not selected_plan_limits:
        raise HTTPException(status_code=500, detail="Limites do plano não definidos")

    messages_quota = selected_plan_limits.get("messages_quota")
    
    # Find current active subscription
    current_subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE.value
    ).first()

    if not current_subscription:
        raise HTTPException(status_code=400, detail="Nenhuma assinatura ativa encontrada para upgrade.")

    # Update subscription details
    current_subscription.plan = plan_id
    current_subscription.messages_quota = messages_quota
    current_subscription.messages_used = 0 # Reset messages used on upgrade
    current_subscription.current_period_start = datetime.utcnow()
    current_subscription.current_period_end = datetime.utcnow() + timedelta(days=30) # Assume 30-day billing cycle
    current_subscription.status = SubscriptionStatus.ACTIVE.value # Set to active after "payment"

    db.commit()
    db.refresh(current_subscription)

    # For now, simulate a successful payment and return success
    # In a real scenario, this would involve calling a payment gateway
    # and handling its response via a webhook.
    return {
        "success": True,
        "message": f"Upgrade para o plano {plan_id.capitalize()} processado com sucesso (simulado).",
        "new_plan": current_subscription.plan,
        "new_messages_quota": current_subscription.messages_quota
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
