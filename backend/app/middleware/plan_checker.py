from fastapi import Request, HTTPException, status
from app.models.user import User
from app.config.plans import get_plan_by_id, can_access_feature
from typing import List

class PlanCheckerMiddleware:
    """
    Middleware para verificar o plano do usuário e restringir acesso a rotas.
    """
    def __init__(self, required_plans: List[str]):
        self.required_plans = required_plans

    async def __call__(self, request: Request, call_next):
        # Acessar o usuário atual do estado da requisição, se disponível
        # Assumimos que o AuthGuard já processou a autenticação
        user: User = request.state.user

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Não autenticado"
            )

        if user.plan not in self.required_plans:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Seu plano '{user.plan}' não permite acesso a esta funcionalidade. Upgrade para um plano superior."
            )

        response = await call_next(request)
        return response


def check_feature_access(user_plan: str, feature: str) -> bool:
    """
    Verifica se um plano do usuário pode acessar uma feature específica
    """
    return can_access_feature(user_plan, feature)


def get_plan_limits(user_plan: str) -> dict:
    """
    Retorna os limites de um plano específico
    """
    plan = get_plan_by_id(user_plan)
    if not plan:
        return {'company_limit': 0, 'message_limit': 0}

    return {
        'company_limit': plan.company_limit,
        'message_limit': plan.message_limit,
    }

# Exemplo de uso (não será usado diretamente aqui, mas para referência)
# from fastapi import Depends
# from app.utils.auth import get_current_user
#
# @router.get("/business-feature", dependencies=[Depends(PlanCheckerMiddleware(required_plans=["Business"]))])
# async def get_business_feature(current_user: User = Depends(get_current_user)):
#     return {"message": f"Bem-vindo, {current_user.nome}! Esta é uma funcionalidade Business."}
