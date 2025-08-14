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
    twilio_whatsapp_number: str = "whatsapp:+14155238886" # Exemplo: whatsapp:+1234567890
    
    class Config:
        env_file = ".env"


# Instância global das configurações
settings = Settings()

