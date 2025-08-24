"""
Serviço de Integração com Twilio para WhatsApp
Responsável por enviar mensagens via Twilio WhatsApp API
"""

from twilio.rest import Client
from app.config import settings
from typing import Optional


class TwilioWhatsAppService:
    """
    Serviço para integração com a API do Twilio WhatsApp
    """
    
    def __init__(self):
        """
        Inicializa o serviço com as configurações do Twilio
        """
        self.account_sid = settings.twilio_account_sid
        self.auth_token = settings.twilio_auth_token
        self.twilio_client = Client(self.account_sid, self.auth_token)
        self.twilio_whatsapp_number = settings.twilio_whatsapp_number
    
    def send_message(self, to_number: str, message: str, from_number: Optional[str] = None) -> bool:
        """
        Envia uma mensagem de texto via Twilio WhatsApp
        
        Args:
            to_number: Número do destinatário (formato whatsapp:+<numero>)
            message: Texto da mensagem
            from_number: Número do remetente (formato whatsapp:+<numero>). Se None, usa o número configurado.
            
        Returns:
            True se enviado com sucesso, False caso contrário
        """
        try:
            logger.info(f"Attempting to send Twilio WhatsApp message:")
            logger.info(f"  - To: {to_number}")
            logger.info(f"  - Message: {message}")
            logger.info(f"  - From (provided): {from_number}")
            
            if not from_number:
                from_number = self.twilio_whatsapp_number
                logger.info(f"  - From (fallback from config): {from_number}")
            else:
                logger.info(f"  - From (used as-is): {from_number}")
            
            message_instance = self.twilio_client.messages.create(
                body=message,
                from_=from_number,
                to=to_number
            )
            print(f"Mensagem enviada com sucesso via Twilio: {message_instance.sid}")
            return True
        except Exception as e:
            print(f"Erro ao enviar mensagem Twilio WhatsApp: {e}")
            return False


# Instância global do serviço
twilio_whatsapp_service = TwilioWhatsAppService()

