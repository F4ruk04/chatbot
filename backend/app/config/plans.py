"""
Configuração centralizada dos planos
Este arquivo contém todas as informações dos planos usados tanto no frontend quanto no backend
"""

from typing import Dict, List, Optional
from pydantic import BaseModel


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


def get_plan_by_id(plan_id: str) -> Optional[PlanConfig]:
    """Retorna um plano pelo ID"""
    return next((plan for plan in PLANS_CONFIG if plan.id == plan_id), None)


def get_plan_by_name(plan_name: str) -> Optional[PlanConfig]:
    """Retorna um plano pelo nome"""
    return next((plan for plan in PLANS_CONFIG if plan.name == plan_name), None)


def get_all_plans() -> List[PlanConfig]:
    """Retorna todos os planos"""
    return PLANS_CONFIG


def get_plan_limits(plan_id: str) -> Dict[str, int]:
    """Retorna os limites de um plano"""
    plan = get_plan_by_id(plan_id)
    if not plan:
        return {'company_limit': 0, 'message_limit': 0}

    return {
        'company_limit': plan.company_limit,
        'message_limit': plan.message_limit,
    }


def can_access_feature(plan_id: str, feature: str) -> bool:
    """Verifica se um plano pode acessar uma feature específica"""
    plan = get_plan_by_id(plan_id)
    if not plan:
        return False

    if feature == 'detailed_history':
        return plan.has_detailed_history
    elif feature == 'export':
        return plan.has_export
    else:
        return True


def get_company_limit(plan_id: str) -> int:
    """Retorna o limite de empresas para um plano"""
    plan = get_plan_by_id(plan_id)
    return plan.company_limit if plan else 0


def get_message_limit(plan_id: str) -> int:
    """Retorna o limite de mensagens para um plano"""
    plan = get_plan_by_id(plan_id)
    return plan.message_limit if plan else 0


# Dicionários para compatibilidade com código existente
PLAN_COMPANY_LIMITS = {plan.id: plan.company_limit for plan in PLANS_CONFIG}
PLAN_MESSAGE_LIMITS = {plan.id: plan.message_limit for plan in PLANS_CONFIG}