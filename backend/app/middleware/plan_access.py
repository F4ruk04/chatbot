"""
Middleware de Controle de Acesso por Plano
Verifica se o usuário tem permissão para acessar funcionalidades específicas
"""

from functools import wraps
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.subscription import Subscription, SubscriptionStatus
from ..utils.auth import get_current_user

# Definir hierarquia de planos
PLAN_HIERARCHY = {
    'free': 0,
    'pro': 1,
    'business': 2
}

# Definir funcionalidades por plano
PLAN_FEATURES = {
    'free': [
        'basic_dashboard',
        'basic_companies',
        'basic_messages'
    ],
    'pro': [
        'basic_dashboard',
        'basic_companies', 
        'basic_messages',
        'advanced_dashboard',
        'advanced_reports',
        'priority_support',
        'custom_branding'
    ],
    'business': [
        'basic_dashboard',
        'basic_companies',
        'basic_messages', 
        'advanced_dashboard',
        'advanced_reports',
        'priority_support',
        'custom_branding',
        'unlimited_connections',
        'custom_api',
        'vip_support',
        'custom_onboarding'
    ]
}

# Limites por plano
PLAN_LIMITS = {
    'free': {
        'messages_per_month': 150,
        'whatsapp_connections': 1,
        'companies': 1
    },
    'pro': {
        'messages_per_month': 3000,
        'whatsapp_connections': 3,
        'companies': 5
    },
    'business': {
        'messages_per_month': 10000,
        'whatsapp_connections': -1,  # Ilimitado
        'companies': -1  # Ilimitado
    }
}

def get_user_plan(user: User, db: Session) -> str:
    """Obtém o plano atual do usuário"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user.id,
        Subscription.status == SubscriptionStatus.ACTIVE.value
    ).first()
    
    if subscription:
        return subscription.plan
    return 'free'  # Default para free se não houver subscription

def has_feature_access(user_plan: str, required_feature: str) -> bool:
    """Verifica se o plano do usuário tem acesso à funcionalidade"""
    return required_feature in PLAN_FEATURES.get(user_plan, [])

def has_plan_level_access(user_plan: str, required_plan: str) -> bool:
    """Verifica se o plano do usuário tem nível suficiente"""
    user_level = PLAN_HIERARCHY.get(user_plan, 0)
    required_level = PLAN_HIERARCHY.get(required_plan, 0)
    return user_level >= required_level

def check_usage_limit(user: User, db: Session, limit_type: str) -> dict:
    """Verifica se o usuário está dentro dos limites do plano"""
    user_plan = get_user_plan(user, db)
    limits = PLAN_LIMITS.get(user_plan, PLAN_LIMITS['free'])
    
    if limit_type == 'messages':
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == SubscriptionStatus.ACTIVE.value
        ).first()
        
        if subscription:
            used = subscription.messages_used
            quota = subscription.messages_quota
            return {
                'within_limit': used < quota,
                'used': used,
                'quota': quota,
                'percentage': (used / quota) * 100 if quota > 0 else 0
            }
    
    elif limit_type == 'companies':
        from ..models.company import Company
        company_count = db.query(Company).filter(Company.owner_id == user.id).count()
        limit = limits['companies']
        
        return {
            'within_limit': limit == -1 or company_count < limit,
            'used': company_count,
            'quota': limit,
            'percentage': (company_count / limit) * 100 if limit > 0 else 0
        }
    
    return {'within_limit': True, 'used': 0, 'quota': -1, 'percentage': 0}

def require_feature(feature: str):
    """Decorator para exigir acesso a uma funcionalidade específica"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extrair dependências do FastAPI
            current_user = None
            db = None
            
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                elif hasattr(value, 'query'):  # Session do SQLAlchemy
                    db = value
            
            if not current_user or not db:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro interno: dependências não encontradas"
                )
            
            user_plan = get_user_plan(current_user, db)
            
            if not has_feature_access(user_plan, feature):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Funcionalidade '{feature}' não disponível no seu plano atual. Faça upgrade para acessar."
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_plan(required_plan: str):
    """Decorator para exigir um plano mínimo"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extrair dependências do FastAPI
            current_user = None
            db = None
            
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                elif hasattr(value, 'query'):  # Session do SQLAlchemy
                    db = value
            
            if not current_user or not db:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro interno: dependências não encontradas"
                )
            
            user_plan = get_user_plan(current_user, db)
            
            if not has_plan_level_access(user_plan, required_plan):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Plano {required_plan.title()} ou superior necessário. Faça upgrade para acessar."
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def check_limit(limit_type: str):
    """Decorator para verificar limites de uso"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extrair dependências do FastAPI
            current_user = None
            db = None
            
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                elif hasattr(value, 'query'):  # Session do SQLAlchemy
                    db = value
            
            if not current_user or not db:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro interno: dependências não encontradas"
                )
            
            limit_check = check_usage_limit(current_user, db, limit_type)
            
            if not limit_check['within_limit']:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Limite de {limit_type} atingido ({limit_check['used']}/{limit_check['quota']}). Faça upgrade do seu plano."
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Funções auxiliares para uso direto
async def get_user_permissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Retorna as permissões do usuário atual"""
    user_plan = get_user_plan(current_user, db)
    features = PLAN_FEATURES.get(user_plan, [])
    limits = PLAN_LIMITS.get(user_plan, PLAN_LIMITS['free'])
    
    # Verificar uso atual
    usage = {}
    for limit_type in ['messages', 'companies']:
        usage[limit_type] = check_usage_limit(current_user, db, limit_type)
    
    return {
        'plan': user_plan,
        'features': features,
        'limits': limits,
        'usage': usage
    }