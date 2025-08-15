"""
Configurações da aplicação
Este módulo contém todas as configurações necessárias para o funcionamento da aplicação
"""

import os
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Classe de configurações da aplicação
    Utiliza pydantic-settings para carregar variáveis de ambiente
    """
    
    # Configurações do banco de dados
    database_url: str = Field(..., env="DATABASE_URL")
    
    # Configurações de autenticação
    jwt_secret: str = Field(..., env="JWT_SECRET_KEY")
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Configurações da API do Gemini
    gemini_api_key: str = Field(..., env="GEMINI_API_KEY")
    
    # Configurações do Twilio para WhatsApp
    twilio_account_sid: str = Field(..., env="TWILIO_ACCOUNT_SID")
    twilio_auth_token: str = Field(..., env="TWILIO_AUTH_TOKEN")
    twilio_whatsapp_number: str = "whatsapp:+14155238886"
    
    # Configurações do Flutterwave
    flutterwave_secret_key: str = Field(..., env="FLUTTERWAVE_SECRET_KEY")
    flutterwave_public_key: str = Field(..., env="FLUTTERWAVE_PUBLIC_KEY")
    flutterwave_sandbox: bool = True
    
    # URL do frontend para redirecionamentos
    frontend_url: str = "http://localhost:3000"
    
    # Domínio da aplicação
    domain: str = "localhost"
    
    # Configurações do Redis - Prioriza REDIS_URL do Railway
    redis_url: str = Field(
        "redis://localhost:6379",
        env=["REDIS_URL", "RAILWAY_REDIS_URL"]
    )

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore"
    }


# Instância global das configurações
settings = Settings()
