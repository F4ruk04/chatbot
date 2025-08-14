"""
Configurações da aplicação
Este módulo contém todas as configurações necessárias para o funcionamento da aplicação
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Classe de configurações da aplicação
    Utiliza pydantic-settings para carregar variáveis de ambiente
    """
    
    # Configurações do banco de dados
    database_url: str = "postgresql+psycopg2://user:password@localhost:5432/chatbot"
    
    # Configurações de autenticação
    jwt_secret: str = "your-super-secret-jwt-key-change-this-in-production-2024"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Configurações da API do Gemini
    gemini_api_key: str = "your-gemini-api-key-here"
    
    # Configurações do Twilio para WhatsApp
    twilio_account_sid: str = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    twilio_auth_token: str = "your_twilio_auth_token"
    twilio_whatsapp_number: str = "whatsapp:+14155238886"
    
    class Config:
        env_file = ".env"
        # Permitir variáveis de ambiente sobrescreverem valores padrão
        case_sensitive = False
        # Mapear nomes de variáveis de ambiente para campos
        fields = {
            'database_url': {'env': 'DATABASE_URL'},
            'jwt_secret': {'env': 'JWT_SECRET_KEY'},
            'gemini_api_key': {'env': 'GEMINI_API_KEY'},
            'twilio_account_sid': {'env': 'TWILIO_ACCOUNT_SID'},
            'twilio_auth_token': {'env': 'TWILIO_AUTH_TOKEN'},
            'twilio_whatsapp_number': {'env': 'TWILIO_WHATSAPP_NUMBER'},
        }


# Instância global das configurações
settings = Settings()

