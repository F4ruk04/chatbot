from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import json

from ..database import get_db
from ..models import Payment, Subscription, User
from ..services.pagolu_service import PagoluService
from ..utils.auth import get_current_user
from ..config import settings

router = APIRouter()

PLAN_PRICES = {
    "free": 0,
    "pro": 2499,  # 2.499 MZN
    "business": 6999  # 6.999 MZN
}

@router.post("/checkout/{plan}")
async def create_checkout(
    plan: str,
    payment_method: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Plano inválido")

    # Inicializar serviço do PagoLu
    pagolu = PagoluService(api_key=settings.PAGOLU_API_KEY, sandbox=settings.PAGOLU_SANDBOX)

    # Criar pagamento
    amount = PLAN_PRICES[plan]
    payment_data = await pagolu.create_payment(
        amount=amount,
        currency="MZN",
        payment_method=payment_method,
        customer_email=current_user.email,
        reference=f"sub_{current_user.id}_{plan}",
        return_url=f"{settings.FRONTEND_URL}/dashboard/payment/status",
        metadata={
            "user_id": str(current_user.id),
            "plan": plan
        }
    )

    # Criar registro de pagamento
    payment = Payment(
        user_id=current_user.id,
        amount=amount,
        currency="MZN",
        payment_method=payment_method,
        pagolu_payment_id=payment_data["id"],
        metadata=json.dumps({
            "plan": plan,
            "pagolu_data": payment_data
        })
    )
    db.add(payment)
    db.commit()

    return {
        "payment_url": payment_data["checkout_url"],
        "payment_id": payment.id
    }

@router.post("/webhook/pagolu")
async def pagolu_webhook(
    payload: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Webhook para receber notificações do PagoLu"""
    
    # Verificar assinatura do webhook (implementar depois)
    
    payment = db.query(Payment).filter_by(
        pagolu_payment_id=payload["payment_id"]
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")

    # Atualizar status do pagamento
    payment.status = payload["status"]
    db.commit()

    # Se o pagamento foi bem sucedido, atualizar assinatura
    if payload["status"] == "completed":
        metadata = json.loads(payment.metadata)
        plan = metadata["plan"]
        
        subscription = Subscription(
            user_id=payment.user_id,
            plan=plan,
            status="active",
            current_period_start=payload["paid_at"],
            current_period_end=payload["paid_at"] + timedelta(days=30),
            messages_quota=get_plan_quota(plan),
            last_payment_id=payment.id
        )
        db.add(subscription)
        db.commit()

    return {"status": "success"}
