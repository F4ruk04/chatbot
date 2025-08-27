from fastapi import Request, HTTPException, status
from app.models.user import User
from app.config import settings
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

# Exemplo de uso (não será usado diretamente aqui, mas para referência)
# from fastapi import Depends
# from app.utils.auth import get_current_user
#
# @router.get("/business-feature", dependencies=[Depends(PlanCheckerMiddleware(required_plans=["Business"]))])
# async def get_business_feature(current_user: User = Depends(get_current_user)):
#     return {"message": f"Bem-vindo, {current_user.nome}! Esta é uma funcionalidade Business."}
