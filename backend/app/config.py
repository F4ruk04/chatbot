"""
Configurações da aplicação
Este módulo contém todas as configurações necessárias para o funcionamento da aplicação
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Classe de configurações da aplicação
    Utiliza pydantic-settings para carregar variáveis de ambiente
    """
    
    # Configurações do banco de dados
    database_url: str
    
    # Configurações de autenticação
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Configurações da API do Gemini
    gemini_api_key: str
    
    # Configurações do Twilio para WhatsApp
    twilio_account_sid: str
    twilio_auth_token: str
    twilio_whatsapp_number: str = "whatsapp:+14155238886"
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore"
    }
    
    def __init__(self, **kwargs):
        # Forçar leitura das variáveis de ambiente do Railway
        env_values = {
            'database_url': os.getenv('DATABASE_URL', 'postgresql+psycopg2://user:password@localhost:5432/chatbot'),
            'jwt_secret': os.getenv('JWT_SECRET_KEY', 'your-super-secret-jwt-key-change-this-in-production-2024'),
            'gemini_api_key': os.getenv('GEMINI_API_KEY', 'your-gemini-api-key-here'),
            'twilio_account_sid': os.getenv('TWILIO_ACCOUNT_SID', 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
            'twilio_auth_token': os.getenv('TWILIO_AUTH_TOKEN', 'your_twilio_auth_token'),
            'twilio_whatsapp_number': os.getenv('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886'),
        }
        
        # Merge com kwargs fornecidos
        env_values.update(kwargs)
        
        super().__init__(**env_values)


# Instância global das configurações
settings = Settings()

