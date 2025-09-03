"""
Configuração específica do Stripe
Configurações e constantes para integração Stripe
"""

import os
from typing import Optional


class StripeConfig:
    """Configuração do Stripe"""

    # Credenciais
    SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    PUBLISHABLE_KEY: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    # URLs
    SUCCESS_URL: str = os.getenv("STRIPE_SUCCESS_URL", "http://localhost:3000/success")
    CANCEL_URL: str = os.getenv("STRIPE_CANCEL_URL", "http://localhost:3000/cancel")

    # Configurações
    CURRENCY: str = "eur"  # EUR para Portugal
    API_VERSION: str = "2023-10-16"

    # Preços dos planos (em centavos)
    PLAN_PRICES = {
        'Básico': 0,        # Gratuito
        'Profissional': 2499,  # 24.99€
        'Business': 6999       # 69.99€
    }

    # Mapeamento de planos
    PLAN_MAPPING = {
        'Básico': 'Básico',
        'Profissional': 'Profissional',
        'Business': 'Business',
        'basic': 'Básico',
        'professional': 'Profissional',
        'business': 'Business'
    }

    @classmethod
    def is_configured(cls) -> bool:
        """Verifica se o Stripe está configurado"""
        return bool(cls.SECRET_KEY and cls.PUBLISHABLE_KEY)

    @classmethod
    def get_price(cls, plan_name: str) -> Optional[int]:
        """Retorna o preço do plano em centavos"""
        return cls.PLAN_PRICES.get(plan_name)

    @classmethod
    def map_plan_name(cls, plan_name: str) -> Optional[str]:
        """Mapeia nome do plano para formato interno"""
        return cls.PLAN_MAPPING.get(plan_name)

    @classmethod
    def get_webhook_events(cls) -> list:
        """Retorna lista de eventos que o webhook deve processar"""
        return [
            'checkout.session.completed',
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'invoice.payment_succeeded',
            'invoice.payment_failed'
        ]


# Instância global
stripe_config = StripeConfig()