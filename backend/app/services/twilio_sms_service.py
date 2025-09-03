"""
Serviço de Integração com Twilio para SMS
Responsável por enviar mensagens SMS via Twilio API
"""

from twilio.rest import Client
from app.config import settings
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TwilioSMSService:
    """
    Serviço para integração com a API do Twilio SMS
    """
    
    def __init__(self):
        """
        Inicializa o serviço com as configurações do Twilio
        """
        self.account_sid = settings.twilio_account_sid
        self.auth_token = settings.twilio_auth_token
        self.twilio_client = Client(self.account_sid, self.auth_token)
        self.twilio_sms_number = settings.twilio_sms_number # Número Twilio para SMS
        self.twilio_sms_sandbox_enabled = settings.twilio_sms_sandbox_enabled
        self.twilio_sms_sandbox_number = settings.twilio_sms_sandbox_number
    
    def send_sms(self, to_number: str, message: str) -> bool:
        """
        Envia uma mensagem SMS via Twilio.
        Se o modo sandbox estiver ativado, envia para o número sandbox configurado.
        
        Args:
            to_number: Número do destinatário (formato E.164, ex: +1234567890)
            message: Texto da mensagem
            
        Returns:
            True se enviado com sucesso, False caso contrário
        """
        from_number = self.twilio_sms_number
        target_to_number = to_number

        if self.twilio_sms_sandbox_enabled:
            logger.info(f"Modo Sandbox Twilio SMS ativado. Redirecionando SMS para {self.twilio_sms_sandbox_number}")
            target_to_number = self.twilio_sms_sandbox_number
            # No sandbox, o 'from_' number é geralmente o número sandbox da Twilio
            # ou um número verificado. Para simplificar, usaremos o configurado.
            # Em produção, seria o número Twilio real.
            # from_number = settings.twilio_sms_sandbox_from_number # Se houver um número FROM específico para sandbox

        try:
            message_instance = self.twilio_client.messages.create(
                body=message,
                from_=from_number,
                to=target_to_number
            )
            logger.info(f"SMS enviado com sucesso via Twilio: {message_instance.sid} para {target_to_number}")
            return True
        except Exception as e:
            logger.error(f"Erro ao enviar SMS via Twilio: {e}", exc_info=True)
            return False


# Instância global do serviço
twilio_sms_service = TwilioSMSService()