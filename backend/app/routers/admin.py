"""
Router de Administração
Endpoints para administradores testarem funcionalidades
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..utils.auth import get_current_user
from ..services.notification_service import notification_service
from ..services.email_service import email_service

router = APIRouter()

@router.post("/admin/test-notifications")
async def test_notification_system(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Testa o sistema de notificações (apenas para desenvolvimento)
    """
    try:
        # Verificar e enviar notificações
        result = notification_service.check_and_send_usage_notifications(db)
        
        return {
            "message": "Sistema de notificações testado com sucesso",
            "results": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao testar notificações: {str(e)}"
        )

@router.post("/admin/test-email")
async def test_email_service(
    email: str,
    current_user: User = Depends(get_current_user)
):
    """
    Testa o envio de email
    """
    try:
        success = email_service.send_welcome_email(email, current_user.name)
        
        if success:
            return {"message": f"Email de teste enviado para {email}"}
        else:
            return {"message": "Falha ao enviar email (verifique configurações SMTP)"}
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao enviar email: {str(e)}"
        )

@router.post("/admin/simulate-usage/{percentage}")
async def simulate_usage(
    percentage: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simula uso de mensagens para testar notificações
    """
    from ..models.subscription import Subscription, SubscriptionStatus
    
    try:
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.status == SubscriptionStatus.ACTIVE.value
        ).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription não encontrada"
            )
        
        # Calcular uso baseado na percentagem
        target_usage = int((percentage / 100) * subscription.messages_quota)
        subscription.messages_used = min(target_usage, subscription.messages_quota)
        
        # Resetar flags de notificação para permitir novo envio
        subscription.notified_80 = False
        subscription.notified_100 = False
        
        db.commit()
        
        # Verificar se deve enviar notificação
        usage_percent = (subscription.messages_used / subscription.messages_quota) * 100
        
        notification_sent = False
        if usage_percent >= 80:
            success = email_service.send_usage_warning_email(
                user_email=current_user.email,
                user_name=current_user.name,
                usage_percent=usage_percent,
                messages_used=subscription.messages_used,
                messages_quota=subscription.messages_quota,
                plan=subscription.plan
            )
            
            if success:
                if usage_percent >= 100:
                    subscription.notified_100 = True
                else:
                    subscription.notified_80 = True
                db.commit()
                notification_sent = True
        
        return {
            "message": f"Uso simulado: {usage_percent:.1f}%",
            "messages_used": subscription.messages_used,
            "messages_quota": subscription.messages_quota,
            "notification_sent": notification_sent
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao simular uso: {str(e)}"
        )