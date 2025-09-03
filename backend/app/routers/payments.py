"""
Router de Pagamentos - Integração com Stripe
Endpoints para processamento de pagamentos via Stripe
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from typing import Optional, Dict
from datetime import datetime
import logging

from ..database import get_db
from ..models import Payment, Subscription, User
from ..utils.auth import get_current_user
from ..services.stripe_service import stripe_service
from app.config import get_plan_limits
from app.config.stripe_config import stripe_config

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])

# Usar mapeamento da configuração centralizada
PLAN_MAPPING = stripe_config.PLAN_MAPPING


@router.post("/create-session")
async def create_payment_session(
    plan_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar sessão de pagamento Stripe

    Args:
        plan_name: Nome do plano (Básico, Profissional, Business)

    Returns:
        URL de checkout Stripe
    """

    # Mapear nome do plano
    mapped_plan = PLAN_MAPPING.get(plan_name)
    if not mapped_plan:
        raise HTTPException(status_code=400, detail="Plano inválido")

    # Verificar se já tem este plano ativo
    if current_user.plan == mapped_plan:
        raise HTTPException(status_code=400, detail="Você já possui este plano ativo")

    # Plano Básico é gratuito
    if mapped_plan == 'Básico':
        # Ativar plano diretamente
        current_user.plan = mapped_plan
        db.commit()

        return {
            "status": "success",
            "message": "Plano Básico ativado gratuitamente",
            "plan": mapped_plan
        }

    # Criar sessão Stripe
    session_data = stripe_service.create_checkout_session(
        user_id=current_user.id,
        plan_name=mapped_plan
    )

    if not session_data:
        raise HTTPException(status_code=500, detail="Erro ao criar sessão de pagamento")

    # Salvar tentativa de pagamento no banco
    payment = Payment(
        user_id=current_user.id,
        amount=session_data['amount'] / 100,  # converter de centavos
        currency='EUR',
        stripe_session_id=session_data['session_id'],
        payment_status='pending',
        plan_name=mapped_plan,
        created_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()

    logger.info(f"Sessão de pagamento criada: User {current_user.id}, Plano {mapped_plan}")

    return {
        "status": "success",
        "checkout_url": session_data['checkout_url'],
        "session_id": session_data['session_id'],
        "plan": mapped_plan,
        "amount": session_data['amount'] / 100,
        "currency": session_data['currency']
    }


@router.get("/verify/{session_id}")
async def verify_payment(session_id: str, db: Session = Depends(get_db)):
    """
    Verificar status do pagamento

    Args:
        session_id: ID da sessão Stripe

    Returns:
        Status do pagamento
    """

    result = stripe_service.verify_payment(session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    # Se pagamento foi completado, atualizar usuário
    if result['status'] == 'paid':
        user_id = result['metadata'].get('user_id')
        plan_name = result['metadata'].get('plan_name')

        if user_id and plan_name:
            # Atualizar plano do usuário
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user:
                user.plan = plan_name
                db.commit()

                # Atualizar status do pagamento
                payment = db.query(Payment).filter_by(stripe_session_id=session_id).first()
                if payment:
                    payment.payment_status = 'completed'
                    db.commit()

                logger.info(f"Pagamento confirmado: User {user_id}, Plano {plan_name}")

    return result


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db)
):
    """
    Webhook do Stripe para notificações de pagamento

    Args:
        request: Requisição HTTP
        stripe_signature: Assinatura do webhook no header

    Returns:
        Status do processamento
    """

    try:
        # Obter payload
        payload = await request.body()

        # Processar webhook
        event_data = stripe_service.process_webhook(payload, stripe_signature)

        if not event_data:
            logger.warning("Webhook inválido ou assinatura incorreta")
            raise HTTPException(status_code=400, detail="Webhook inválido")

        # Processar diferentes tipos de eventos
        event_type = event_data.get('type')

        if event_type == 'checkout.session.completed':
            await _handle_checkout_completed(event_data, db)

        elif event_type == 'payment_intent.succeeded':
            await _handle_payment_succeeded(event_data, db)

        elif event_type == 'payment_intent.payment_failed':
            await _handle_payment_failed(event_data, db)

        elif event_type == 'invoice.payment_succeeded':
            await _handle_invoice_payment(event_data, db)

        logger.info(f"Webhook processado com sucesso: {event_type}")

        return {"status": "success"}

    except Exception as e:
        logger.error(f"Erro no webhook: {e}")
        raise HTTPException(status_code=400, detail="Erro no processamento do webhook")


async def _handle_checkout_completed(event_data: Dict, db: Session):
    """Processar checkout completado"""
    user_id = event_data.get('user_id')
    plan_name = event_data.get('plan_name')
    session_id = event_data.get('session_id')

    if user_id and plan_name:
        # Atualizar plano do usuário
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user:
            old_plan = user.plan
            user.plan = plan_name
            db.commit()

            # Atualizar status do pagamento
            payment = db.query(Payment).filter_by(stripe_session_id=session_id).first()
            if payment:
                payment.payment_status = 'completed'
                payment.completed_at = datetime.utcnow()
                db.commit()

            logger.info(f"Plano atualizado: User {user_id}, {old_plan} → {plan_name}")


async def _handle_payment_succeeded(event_data: Dict, db: Session):
    """Processar pagamento bem-sucedido"""
    payment_intent_id = event_data.get('payment_intent_id')
    amount = event_data.get('amount')

    # Buscar pagamento por PaymentIntent ID
    payment = db.query(Payment).filter_by(stripe_session_id=payment_intent_id).first()
    if payment and payment.payment_status != 'completed':
        payment.payment_status = 'completed'
        payment.completed_at = datetime.utcnow()
        db.commit()

        logger.info(f"Pagamento confirmado: {payment_intent_id}, Amount: {amount}")


async def _handle_payment_failed(event_data: Dict, db: Session):
    """Processar pagamento falhado"""
    payment_intent_id = event_data.get('payment_intent_id')
    failure_code = event_data.get('failure_code')

    # Buscar pagamento por PaymentIntent ID
    payment = db.query(Payment).filter_by(stripe_session_id=payment_intent_id).first()
    if payment:
        payment.payment_status = 'failed'
        payment.failure_reason = failure_code
        db.commit()

        logger.warning(f"Pagamento falhou: {payment_intent_id}, Code: {failure_code}")


async def _handle_invoice_payment(event_data: Dict, db: Session):
    """Processar pagamento de fatura (assinaturas recorrentes)"""
    # Implementar quando adicionar assinaturas recorrentes
    logger.info("Pagamento de fatura recebido (assinaturas não implementadas ainda)")


@router.get("/webhook")
async def webhook_info():
    """
    Endpoint informativo sobre webhooks
    Útil para testar conectividade
    """
    return {
        "status": "webhook_endpoint_active",
        "message": "Stripe webhook endpoint is active",
        "supported_events": [
            "checkout.session.completed",
            "payment_intent.succeeded",
            "payment_intent.payment_failed",
            "invoice.payment_succeeded"
        ]
    }


@router.get("/history")
async def get_payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obter histórico de pagamentos do usuário

    Returns:
        Lista de pagamentos
    """

    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).all()

    return [{
        "id": payment.id,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.payment_status,
        "plan_name": payment.plan_name,
        "created_at": payment.created_at.isoformat(),
        "stripe_session_id": payment.stripe_session_id
    } for payment in payments]


@router.post("/refund/{payment_id}")
async def create_refund(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar reembolso para um pagamento

    Args:
        payment_id: ID do pagamento

    Returns:
        Status do reembolso
    """

    # Buscar pagamento
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user.id
    ).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")

    if payment.payment_status != 'completed':
        raise HTTPException(status_code=400, detail="Pagamento não foi completado")

    # Criar reembolso
    refund_result = stripe_service.create_refund(
        payment_intent_id=payment.stripe_session_id,
        amount=int(payment.amount * 100)  # converter para centavos
    )

    if refund_result:
        # Atualizar status do pagamento
        payment.payment_status = 'refunded'
        db.commit()

        logger.info(f"Reembolso criado: Payment {payment_id}, User {current_user.id}")

        return {
            "status": "success",
            "refund_id": refund_result['refund_id'],
            "amount": refund_result['amount'],
            "message": "Reembolso processado com sucesso"
        }
    else:
        raise HTTPException(status_code=500, detail="Erro ao processar reembolso")


# Endpoint legado para compatibilidade
@router.post("/checkout/{plan}")
async def legacy_checkout(
    plan: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint legado para compatibilidade
    Redireciona para o novo sistema Stripe
    """

    # Mapear plano legado
    plan_mapping = {
        "free": "Básico",
        "pro": "Profissional",
        "business": "Business"
    }

    mapped_plan = plan_mapping.get(plan)
    if not mapped_plan:
        raise HTTPException(status_code=400, detail="Plano inválido")

    # Usar novo endpoint
    return await create_payment_session(mapped_plan, db, current_user)
