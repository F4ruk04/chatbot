"""
Configurações da aplicação
Este módulo contém todas as configurações necessárias para o funcionamento da aplicação
"""

import os
from pydantic import Field, BaseModel
from pydantic_settings import BaseSettings
from typing import Optional, Dict, List


# Configuração centralizada dos planos diretamente no config.py
class PlanFeature(BaseModel):
    text: str


class PlanConfig(BaseModel):
    id: str
    name: str
    price: int  # Preço em MZN
    price_display: str  # Preço formatado para exibição
    description: str
    features: List[PlanFeature]
    cta_text: str
    popular: bool = False
    company_limit: int
    message_limit: int
    has_detailed_history: bool
    has_export: bool
    support_level: str  # 'basic', 'priority', 'vip'
    dashboard_type: str  # 'basic', 'advanced', 'complete'


# Configuração centralizada dos planos
PLANS_CONFIG = [
    PlanConfig(
        id='Básico',
        name='Básico',
        price=0,
        price_display='0 MZN',
        description='Para testar a plataforma e para negócios com baixo volume de conversas.',
        features=[
            PlanFeature(text='1 conexão WhatsApp (1 empresa)'),
            PlanFeature(text='150 mensagens/mês'),
            PlanFeature(text='Dashboard simples: uso de mensagens + status da assinatura'),
            PlanFeature(text='⚠️ Aviso automático aos 80% do limite'),
            PlanFeature(text='Limitação: sem histórico detalhado e sem exportação'),
        ],
        cta_text='Comece Grátis',
        company_limit=1,
        message_limit=150,
        has_detailed_history=False,
        has_export=False,
        support_level='basic',
        dashboard_type='basic',
    ),
    PlanConfig(
        id='Profissional',
        name='Profissional',
        price=2499,
        price_display='2.499 MZN',
        description='A escolha ideal para empresas que buscam profissionalizar o atendimento e vender mais.',
        features=[
            PlanFeature(text='1 conexão WhatsApp (1 empresa)'),
            PlanFeature(text='5.000 mensagens/mês'),
            PlanFeature(text='Dashboard avançado: histórico de mensagens usadas + gráficos de consumo mensal'),
            PlanFeature(text='⚠️ Aviso automático aos 80% do limite'),
            PlanFeature(text='Suporte básico por email'),
        ],
        cta_text='Escolher Plano Profissional',
        popular=True,
        company_limit=1,
        message_limit=5000,
        has_detailed_history=True,
        has_export=False,
        support_level='priority',
        dashboard_type='advanced',
    ),
    PlanConfig(
        id='Business',
        name='Business',
        price=6999,
        price_display='6.999 MZN',
        description='Para negócios que exigem o máximo de performance e um suporte personalizado.',
        features=[
            PlanFeature(text='Até 3 conexões WhatsApp (3 empresas)'),
            PlanFeature(text='10.000 mensagens/mês'),
            PlanFeature(text='Dashboard completo: estatísticas por empresa + comparação entre conexões'),
            PlanFeature(text='⚠️ Aviso automático aos 80% do limite'),
            PlanFeature(text='Exportação de relatórios (CSV/Excel)'),
            PlanFeature(text='Suporte prioritário'),
        ],
        cta_text='Escolher Plano Business',
        company_limit=3,
        message_limit=10000,
        has_detailed_history=True,
        has_export=True,
        support_level='vip',
        dashboard_type='complete',
    )
]


def get_plan_limits(plan_id: str) -> Dict[str, int]:
    """Retorna os limites de um plano"""
    plan = next((plan for plan in PLANS_CONFIG if plan.id == plan_id), None)
    if not plan:
        return {'company_limit': 0, 'message_limit': 0}

    return {
        'company_limit': plan.company_limit,
        'message_limit': plan.message_limit,
    }


# Dicionários para compatibilidade com código existente
PLAN_COMPANY_LIMITS = {plan.id: plan.company_limit for plan in PLANS_CONFIG}
PLAN_MESSAGE_LIMITS = {plan.id: plan.message_limit for plan in PLANS_CONFIG}


class Settings(BaseSettings):
    """
    Classe de configurações da aplicação
    Utiliza pydantic-settings para carregar variáveis de ambiente
    """
    
    # Configurações do banco de dados
    database_url: str = Field("postgresql+psycopg2://user:password@localhost:5432/chatbot", env="DATABASE_URL")
    
    # Configurações de autenticação
    jwt_secret: str = Field("your-super-secret-jwt-key-change-this-in-production-2024", env="JWT_SECRET_KEY")
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Configurações da API do Gemini
    gemini_api_key: str = Field("your-gemini-api-key-here", env="GEMINI_API_KEY")
    
    # Configurações do Twilio para WhatsApp
    twilio_account_sid: str = Field("ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", env="TWILIO_ACCOUNT_SID")
    twilio_auth_token: str = Field("your_twilio_auth_token", env="TWILIO_AUTH_TOKEN")
    twilio_whatsapp_number: str = "whatsapp:+14155238886" # Número Twilio para WhatsApp
    
    # Configurações do Twilio para SMS
    twilio_sms_number: str = Field("+15017122661", env="TWILIO_SMS_NUMBER") # Exemplo: seu número Twilio SMS
    twilio_sms_sandbox_enabled: bool = Field(True, env="TWILIO_SMS_SANDBOX_ENABLED")
    twilio_sms_sandbox_number: str = Field("+15005550006", env="TWILIO_SMS_SANDBOX_NUMBER") # Número sandbox Twilio para testes
    
    # URL do frontend para redirecionamentos
    frontend_url: str = "http://localhost:3000"
    
    # Domínio da aplicação
    domain: str = "localhost"
    
    # Configurações do Redis - Prioriza REDIS_URL do Railway
    redis_url: str = Field(
        "redis://localhost:6379",
        env=["REDIS_URL", "RAILWAY_REDIS_URL"]
    )

    # Limites de empresas por plano (usando configuração centralizada)
    plan_company_limits: dict[str, int] = PLAN_COMPANY_LIMITS

    # Limites de mensagens por plano (usando configuração centralizada)
    plan_message_limits: dict[str, int] = PLAN_MESSAGE_LIMITS

    model_config = {
        "case_sensitive": False,
        "extra": "ignore"
    }


# Instância global das configurações
settings = Settings()
