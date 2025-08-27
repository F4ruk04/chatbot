from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp
from typing import Callable
import jwt
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Rotas que não exigem autenticação
        public_routes = [
            "/health",
            "/api/auth/register",
            "/api/auth/login",
            "/whatsapp/webhook",
            "/whatsapp/test-webhook",
            "/docs",
            "/openapi.json",
            "/"
        ]

        # Permitir acesso a rotas públicas sem autenticação
        if any(request.url.path.startswith(route) for route in public_routes):
            response = await call_next(request)
            return response

        token = request.headers.get("Authorization")
        user = None

        if token and token.startswith("Bearer "):
            token = token.split(" ")[1]
            try:
                payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
                user_id = payload.get("sub")
                if user_id:
                    db: Session = SessionLocal()
                    try:
                        user = db.query(User).filter(User.id == int(user_id)).first()
                    finally:
                        db.close()
            except jwt.ExpiredSignatureError:
                logger.warning("Token JWT expirado")
            except jwt.InvalidTokenError:
                logger.warning("Token JWT inválido")
            except Exception as e:
                logger.error(f"Erro ao decodificar token JWT: {e}")

        if user:
            request.state.user = user
        else:
            # Se a rota não é pública e não há usuário autenticado, retornar 401
            if not any(request.url.path.startswith(route) for route in public_routes):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não autenticado")

        response = await call_next(request)
        return response
