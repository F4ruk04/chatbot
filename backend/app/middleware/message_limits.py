"""
Middleware para validação de limites de mensagens
Verifica se o usuário pode enviar mensagens baseado no plano
"""

from fastapi import Request, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.company import Company
from app.models.message import Message
from app.config import get_plan_limits
import logging

logger = logging.getLogger(__name__)


class MessageLimitsMiddleware:
    """
    Middleware para validar limites de mensagens antes do envio
    """

    def __init__(self, check_before_send: bool = True):
        self.check_before_send = check_before_send

    async def __call__(self, request: Request, call_next):
        """
        Verifica limites de mensagens para o usuário atual
        """
        # Pular validação para endpoints que não consomem mensagens
        if request.url.path in [
            "/health",
            "/docs",
            "/openapi.json",
            "/api/auth",
            "/api/dashboard",
            "/api/subscription"
        ] or request.url.path.startswith(("/health", "/docs", "/api/auth", "/api/dashboard")):
            return await call_next(request)

        # Para endpoints que consomem mensagens (WhatsApp send)
        if self.check_before_send and request.url.path == "/api/whatsapp/send":
            await self._validate_message_limits(request)

        response = await call_next(request)
        return response

    async def _validate_message_limits(self, request: Request):
        """
        Valida se o usuário pode enviar mensagens
        """
        try:
            # Obter usuário do request state (definido pelo AuthMiddleware)
            user = getattr(request.state, 'user', None)
            if not user:
                return  # Deixar AuthMiddleware lidar com isso

            # Obter sessão do banco
            db = next(get_db())

            # Obter limites do plano
            plan_limits = get_plan_limits(user.plan)
            message_limit = plan_limits['message_limit']

            if message_limit == 0:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Seu plano não permite envio de mensagens"
                )

            # Contar mensagens do usuário
            user_companies = db.query(Company.id).filter(Company.owner_id == user.id).all()
            company_ids = [c[0] for c in user_companies]

            total_messages = db.query(Message).filter(
                Message.company_id.in_(company_ids)
            ).count()

            # Verificar se excedeu limite
            if total_messages >= message_limit:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Você atingiu o limite de {message_limit} mensagens do seu plano. Faça upgrade para continuar."
                )

            # Log de uso
            usage_percentage = (total_messages / message_limit) * 100
            logger.info(f"Usuário {user.email}: {total_messages}/{message_limit} mensagens ({usage_percentage:.1f}%)")

            # Avisar quando接近 80%
            if usage_percentage >= 80 and usage_percentage < 100:
                logger.warning(f"Usuário {user.email} atingiu {usage_percentage:.1f}% do limite de mensagens")

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erro na validação de limites: {e}")
            # Não bloquear por erro de validação, deixar passar


def check_message_limits(user: User, db: Session) -> dict:
    """
    Verifica limites de mensagens para um usuário
    Retorna informações sobre uso e limites
    """
    try:
        # Obter limites do plano
        plan_limits = get_plan_limits(user.plan)
        message_limit = plan_limits['message_limit']

        # Contar mensagens
        user_companies = db.query(Company.id).filter(Company.owner_id == user.id).all()
        company_ids = [c[0] for c in user_companies]

        total_messages = db.query(Message).filter(
            Message.company_id.in_(company_ids)
        ).count()

        # Calcular percentual
        usage_percentage = 0.0
        if message_limit > 0:
            usage_percentage = (total_messages / message_limit) * 100

        # Status
        can_send = total_messages < message_limit if message_limit > 0 else False
        near_limit = usage_percentage >= 80 and usage_percentage < 100
        limit_exceeded = usage_percentage >= 100

        return {
            'can_send': can_send,
            'total_messages': total_messages,
            'message_limit': message_limit,
            'usage_percentage': round(usage_percentage, 2),
            'near_limit': near_limit,
            'limit_exceeded': limit_exceeded,
            'remaining_messages': max(0, message_limit - total_messages)
        }

    except Exception as e:
        logger.error(f"Erro ao verificar limites: {e}")
        return {
            'can_send': False,
            'total_messages': 0,
            'message_limit': 0,
            'usage_percentage': 0.0,
            'near_limit': False,
            'limit_exceeded': False,
            'remaining_messages': 0
        }


def increment_message_count(user: User, company_id: int, db: Session) -> bool:
    """
    Incrementa contador de mensagens (para uso futuro)
    """
    try:
        # Por enquanto, apenas log
        limits_info = check_message_limits(user, db)
        logger.info(f"Mensagem enviada - Usuário {user.email}: {limits_info['total_messages'] + 1}/{limits_info['message_limit']}")
        return True
    except Exception as e:
        logger.error(f"Erro ao incrementar contador: {e}")
        return False