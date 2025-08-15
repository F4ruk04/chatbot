from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.subscription import Subscription, SubscriptionStatus
from ..models.user import User
from datetime import datetime

async def check_subscription_limits(user_id: str, db: Session = Depends(get_db)):
    """
    Middleware para verificar limites da assinatura
    """
    # Buscar assinatura ativa do usuário
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == SubscriptionStatus.ACTIVE.value
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=402, detail="Nenhuma assinatura ativa encontrada")
    
    # Verificar validade
    if subscription.current_period_end < datetime.utcnow():
        subscription.status = SubscriptionStatus.EXPIRED.value
        db.commit()
        raise HTTPException(status_code=402, detail="Assinatura expirada")
    
    # Verificar limite de mensagens
    if subscription.messages_used >= subscription.messages_quota:
        raise HTTPException(status_code=402, detail="Limite de mensagens atingido")
    
    # Se estiver próximo do limite (90%), retornar warning
    if subscription.messages_used >= (subscription.messages_quota * 0.9):
        return {
            "warning": "Você está próximo do limite de mensagens do seu plano",
            "used": subscription.messages_used,
            "total": subscription.messages_quota
        }
    
    return None
