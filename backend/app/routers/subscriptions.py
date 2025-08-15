from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models.subscription import Subscription, SubscriptionStatus, SubscriptionPlan
from ..models.user import User
from ..utils.auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/subscription/status")
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna status da assinatura atual do usuário
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE.value
    ).first()
    
    if not subscription:
        return {
            "status": "NO_SUBSCRIPTION",
            "message": "Nenhuma assinatura ativa"
        }
    
    # Calcular uso e limites
    usage_percent = (subscription.messages_used / subscription.messages_quota) * 100
    days_remaining = (subscription.current_period_end - datetime.utcnow()).days
    
    return {
        "plan": subscription.plan,
        "status": subscription.status,
        "messages_used": subscription.messages_used,
        "messages_quota": subscription.messages_quota,
        "usage_percent": usage_percent,
        "days_remaining": days_remaining,
        "renewal_date": subscription.current_period_end,
        "warning_level": "HIGH" if usage_percent > 90 else "MEDIUM" if usage_percent > 70 else "LOW"
    }

@router.post("/subscription/upgrade/{plan}")
async def upgrade_subscription(
    plan: SubscriptionPlan,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Inicia processo de upgrade de plano
    """
    current_subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE.value
    ).first()
    
    if not current_subscription:
        raise HTTPException(status_code=400, detail="Nenhuma assinatura ativa encontrada")
    
    if plan == current_subscription.plan:
        raise HTTPException(status_code=400, detail="Você já está neste plano")
    
    # Retornar URL de checkout para o upgrade
    return {
        "checkout_url": f"/checkout?plan={plan}&upgrade=true",
        "current_plan": current_subscription.plan,
        "new_plan": plan
    }

@router.get("/subscription/usage/alert")
async def check_usage_alert(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verifica se há alertas de uso para o usuário
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE.value
    ).first()
    
    if not subscription:
        return {"has_alert": False}
    
    usage_percent = (subscription.messages_used / subscription.messages_quota) * 100
    days_remaining = (subscription.current_period_end - datetime.utcnow()).days
    
    alerts = []
    
    if usage_percent >= 90:
        alerts.append({
            "type": "CRITICAL",
            "message": f"Você usou {usage_percent:.1f}% do seu limite de mensagens"
        })
    elif usage_percent >= 70:
        alerts.append({
            "type": "WARNING",
            "message": f"Você já usou {usage_percent:.1f}% do seu limite de mensagens"
        })
    
    if days_remaining <= 5:
        alerts.append({
            "type": "INFO",
            "message": f"Sua assinatura renova em {days_remaining} dias"
        })
    
    return {
        "has_alert": len(alerts) > 0,
        "alerts": alerts
    }
