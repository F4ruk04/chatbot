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
    
    # Configurações do Flutterwave
    flutterwave_secret_key: str
    flutterwave_public_key: str
    flutterwave_sandbox: bool = True
    
    # URL do frontend para redirecionamentos
    frontend_url: str = "http://localhost:3000"
    
    # Domínio da aplicação
    domain: str = "localhost"
    
    # Configurações do Redis - Prioriza REDIS_URL do Railway
    redis_url: str = "redis://localhost:6379"

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore"
    }

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Forçar uso da REDIS_URL do Railway se disponível
        if os.getenv('REDIS_URL'):
            self.redis_url = os.getenv('REDIS_URL')
        elif os.getenv('RAILWAY_REDIS_URL'):  # Fallback para variável específica do Railway
            self.redis_url = os.getenv('RAILWAY_REDIS_URL')


# Instância global das configurações
settings = Settings()
