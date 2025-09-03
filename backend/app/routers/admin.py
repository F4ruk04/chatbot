"""
Router de Administração Temporário
Endpoints para alterar planos de usuários (temporário para testes)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionStatus, SubscriptionPlan
from app.utils.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])

class ChangePlanRequest(BaseModel):
    user_email: str
    new_plan: str  # "Básico", "Profissional", "Business"

@router.post("/change-user-plan")
def change_user_plan(
    request: ChangePlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint temporário para alterar o plano de um usuário
    Apenas para testes - REMOVER EM PRODUÇÃO
    """
    try:
        # Verificar se o usuário existe
        target_user = db.query(User).filter(User.email == request.user_email).first()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )

        # Validar plano
        if request.new_plan not in ["Básico", "Profissional", "Business"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Plano inválido. Use: Básico, Profissional ou Business"
            )

        # Atualizar plano do usuário
        target_user.plan = request.new_plan
        db.commit()

        # Atualizar subscription
        subscription = db.query(Subscription).filter(
            Subscription.user_id == target_user.id,
            Subscription.status == SubscriptionStatus.ACTIVE.value
        ).first()

        if subscription:
            subscription.plan = request.new_plan

            # Atualizar limite de mensagens baseado no plano
            if request.new_plan == "Básico":
                subscription.messages_quota = 150
            elif request.new_plan == "Profissional":
                subscription.messages_quota = 5000
            elif request.new_plan == "Business":
                subscription.messages_quota = 10000

            db.commit()

        return {
            "success": True,
            "message": f"Plano do usuário {request.user_email} alterado para {request.new_plan}",
            "user_plan": target_user.plan,
            "messages_quota": subscription.messages_quota if subscription else 150
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao alterar plano: {str(e)}"
        )

@router.get("/user-status/{email}")
def get_user_status(
    email: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verificar status atual de um usuário
    """
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )

        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == SubscriptionStatus.ACTIVE.value
        ).first()

        return {
            "email": user.email,
            "plan": user.plan,
            "subscription_plan": subscription.plan if subscription else None,
            "messages_used": subscription.messages_used if subscription else 0,
            "messages_quota": subscription.messages_quota if subscription else 150,
            "status": subscription.status if subscription else "No subscription"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter status: {str(e)}"
        )