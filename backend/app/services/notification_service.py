"""
Serviço de notificações
Gerencia avisos de limite de mensagens e outras notificações do sistema
"""

import logging
from typing import Optional
from app.models.user import User
from app.services.twilio_whatsapp_service import twilio_whatsapp_service

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Serviço para gerenciar notificações do sistema
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def send_message_limit_warning(self, user: User, current_messages: int, limit: int) -> bool:
        """
        Envia aviso de limite de mensagens接近 80%
        """
        try:
            usage_percentage = (current_messages / limit) * 100

            message = f"""🚨 *Aviso de Limite de Mensagens*

Olá {user.nome}!

Você já usou *{current_messages}* de *{limit}* mensagens do seu plano.
Isso representa *{usage_percentage:.1f}%* do seu limite mensal.

📊 *Status:* Quase no limite!
⚡ *Recomendação:* Considere fazer upgrade para evitar interrupções.

Para fazer upgrade, acesse: /billing

Atenciosamente,
Equipe SaaS Chatbot"""

            # Por enquanto, apenas log (futuramente enviar email/WhatsApp)
            self.logger.warning(f"AVISO ENVIADO - Usuário {user.email}: {current_messages}/{limit} mensagens ({usage_percentage:.1f}%)")

            # TODO: Implementar envio real
            # - Email para o usuário
            # - Notificação no dashboard
            # - WhatsApp (se usuário optou)

            return True

        except Exception as e:
            self.logger.error(f"Erro ao enviar aviso de limite: {e}")
            return False

    def send_message_limit_exceeded(self, user: User, limit: int, customer_number: str) -> bool:
        """
        Envia mensagem para cliente informando limite excedido
        """
        try:
            message = f"""🚫 *Limite de Mensagens Atingido*

Olá!

Você atingiu o limite de *{limit}* mensagens do plano atual.

Para continuar usando o serviço, faça upgrade do seu plano em: /billing

Atenciosamente,
Equipe SaaS Chatbot"""

            # Enviar mensagem para o cliente via WhatsApp
            success = twilio_whatsapp_service.send_message(
                to_number=customer_number,
                message=message
            )

            if success:
                self.logger.info(f"Limite excedido - Mensagem enviada para {customer_number}")
            else:
                self.logger.error(f"Erro ao enviar mensagem de limite excedido para {customer_number}")

            return success

        except Exception as e:
            self.logger.error(f"Erro ao enviar mensagem de limite excedido: {e}")
            return False

    def send_welcome_message(self, user: User, plan_name: str) -> bool:
        """
        Envia mensagem de boas-vindas para novo usuário
        """
        try:
            message = f"""🎉 *Bem-vindo ao SaaS Chatbot!*

Olá {user.nome}!

Seu plano *{plan_name}* foi ativado com sucesso!

🚀 *Próximos passos:*
1. Crie sua primeira empresa
2. Configure o número do WhatsApp
3. Comece a atender seus clientes

📚 *Dicas:*
- Configure um contexto personalizado para sua empresa
- Monitore o uso de mensagens no dashboard
- Faça upgrade quando necessário

Qualquer dúvida, estamos aqui para ajudar!

Atenciosamente,
Equipe SaaS Chatbot"""

            # TODO: Implementar envio de boas-vindas
            self.logger.info(f"Bem-vindo enviado para {user.email} (plano: {plan_name})")

            return True

        except Exception as e:
            self.logger.error(f"Erro ao enviar mensagem de boas-vindas: {e}")
            return False

    def send_upgrade_success(self, user: User, new_plan: str) -> bool:
        """
        Envia confirmação de upgrade de plano
        """
        try:
            message = f"""🚀 *Upgrade Realizado com Sucesso!*

Parabéns {user.nome}!

Seu plano foi atualizado para *{new_plan}* com sucesso!

✅ *Novos benefícios desbloqueados:*
- Mais mensagens por mês
- Recursos avançados
- Suporte prioritário

Aproveite ao máximo seu novo plano!

Atenciosamente,
Equipe SaaS Chatbot"""

            # TODO: Implementar envio de confirmação de upgrade
            self.logger.info(f"Upgrade confirmado para {user.email} (novo plano: {new_plan})")

            return True

        except Exception as e:
            self.logger.error(f"Erro ao enviar confirmação de upgrade: {e}")
            return False

    def log_notification(self, notification_type: str, user_email: str, details: dict) -> None:
        """
        Registra notificações no log para auditoria
        """
        self.logger.info(f"NOTIFICATION: {notification_type} - User: {user_email} - Details: {details}")


# Instância global do serviço
notification_service = NotificationService()