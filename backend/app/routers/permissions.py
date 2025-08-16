"""
Router de Permissões
Endpoints para verificar permissões e limites do usuário
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..utils.auth import get_current_user
from ..middleware.plan_access import get_user_permissions, get_user_plan, check_usage_limit

router = APIRouter()

@router.get("/permissions")
async def get_current_user_permissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna as permissões e limites do usuário atual
    """
    return await get_user_permissions(current_user, db)

@router.get("/permissions/check/{feature}")
async def check_feature_access(
    feature: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verifica se o usuário tem acesso a uma funcionalidade específica
    """
    from ..middleware.plan_access import has_feature_access
    
    user_plan = get_user_plan(current_user, db)
    has_access = has_feature_access(user_plan, feature)
    
    return {
        'feature': feature,
        'has_access': has_access,
        'user_plan': user_plan,
        'required_upgrade': not has_access
    }

@router.get("/permissions/limits/{limit_type}")
async def check_usage_limits(
    limit_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verifica os limites de uso para um tipo específico
    """
    if limit_type not in ['messages', 'companies']:
        return {'error': 'Tipo de limite inválido'}
    
    limit_info = check_usage_limit(current_user, db, limit_type)
    user_plan = get_user_plan(current_user, db)
    
    return {
        'limit_type': limit_type,
        'user_plan': user_plan,
        **limit_info
    }