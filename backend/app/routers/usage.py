"""
Router de Uso
Endpoints para controlar e monitorar uso de recursos
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..utils.auth import get_current_user
from ..services.notification_service import notification_service

router = APIRouter()

@router.post("/usage/messages/increment")
async def increment_message_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Incrementa o uso de mensagens do usuário e verifica limites
    """
    result = notification_service.increment_message_usage(current_user.id, db)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get('error', 'Erro ao incrementar uso de mensagens')
        )
    
    return {
        "success": True,
        "messages_used": result['messages_used'],
        "messages_quota": result['messages_quota'],
        "usage_percent": result['usage_percent'],
        "within_limit": result['within_limit'],
        "notification_sent": result.get('notification_sent', False)
    }

@router.get("/usage/check")
async def check_usage_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verifica o status de uso atual do usuário
    """
    from ..middleware.plan_access import check_usage_limit, get_user_plan
    
    user_plan = get_user_plan(current_user, db)
    message_usage = check_usage_limit(current_user, db, 'messages')
    company_usage = check_usage_limit(current_user, db, 'companies')
    
    return {
        "plan": user_plan,
        "messages": message_usage,
        "companies": company_usage,
        "alerts": {
            "message_warning": message_usage['percentage'] >= 80,
            "message_critical": message_usage['percentage'] >= 100,
            "company_limit": not company_usage['within_limit']
        }
    }

@router.post("/usage/reset-notifications")
async def reset_usage_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reseta as flags de notificação do usuário (admin only)
    """
    from ..models.subscription import Subscription, SubscriptionStatus
    
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE.value
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription não encontrada"
        )
    
    subscription.notified_80 = False
    subscription.notified_100 = False
    db.commit()
    
    return {"message": "Flags de notificação resetadas com sucesso"}