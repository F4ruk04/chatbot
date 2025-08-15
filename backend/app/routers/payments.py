from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime, timedelta
import json

from ..database import get_db
from ..models import Payment, Subscription, User
from ..services.flutterwave_service import FlutterwaveService
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

@router.post("/checkout/{plan}")
async def create_checkout(
    plan: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Plano inválido")

    # Inicializar serviço do Flutterwave
    flutterwave = FlutterwaveService(
        secret_key=settings.FLUTTERWAVE_SECRET_KEY,
        public_key=settings.FLUTTERWAVE_PUBLIC_KEY,
        sandbox=settings.FLUTTERWAVE_SANDBOX
    )

    # Gerar referência única
    tx_ref = f"sub_{uuid4().hex}"

    # Criar link de pagamento
    amount = PLAN_PRICES[plan]
    payment_data = await flutterwave.create_payment_link(
        amount=amount,
        currency="MZN",
        customer_email=current_user.email,
        customer_name=f"{current_user.first_name} {current_user.last_name}",
        payment_options="mpesa,card",
        redirect_url=f"{settings.FRONTEND_URL}/dashboard/payment/status",
        tx_ref=tx_ref,
        meta={
            "user_id": str(current_user.id),
            "plan": plan
        }
    )

    # Criar registro de pagamento
    payment = Payment(
        id=uuid4(),
        user_id=current_user.id,
        amount=amount,
        currency="MZN",
        payment_method="flutterwave",
        reference=tx_ref,
        metadata=json.dumps({
            "plan": plan,
            "flutterwave_data": payment_data
        })
    )
    db.add(payment)
    db.commit()

    return {
        "payment_link": payment_data["data"]["link"],
        "payment_id": payment.id
    }

@router.post("/webhook/flutterwave")
async def flutterwave_webhook(
    request: Request,
    verify_hash: str = Header(None),
    db: Session = Depends(get_db)
):
    """Webhook para receber notificações do Flutterwave"""
    
    # Verificar assinatura do webhook
    payload = await request.body()
    flutterwave = FlutterwaveService(
        secret_key=settings.FLUTTERWAVE_SECRET_KEY,
        public_key=settings.FLUTTERWAVE_PUBLIC_KEY,
        sandbox=settings.FLUTTERWAVE_SANDBOX
    )
    
    if not await flutterwave.verify_webhook_signature(verify_hash, payload.decode()):
        raise HTTPException(status_code=400, detail="Assinatura inválida")

    data = await request.json()
    
    # Verificar o pagamento
    payment = db.query(Payment).filter_by(
        reference=data["txRef"]
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")

    # Se o pagamento foi confirmado
    if data["status"] == "successful":
        payment.status = "completed"
        metadata = json.loads(payment.metadata)
        plan = metadata["plan"]
        
        # Criar ou atualizar assinatura
        subscription = Subscription(
            id=uuid4(),
            user_id=payment.user_id,
            plan=plan,
            status="active",
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30),
            messages_quota=get_plan_quota(plan),
            last_payment_id=payment.id
        )
        db.add(subscription)
        db.commit()

    return {"status": "success"}
