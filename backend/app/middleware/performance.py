from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time
from typing import Callable
import jwt
from ..config import settings

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Pegar IP do cliente
        client_ip = request.client.host
        
        # Rate limiting baseado no Redis
        try:
            current_minute = int(time.time() / 60)
            cache_key = f"rate_limit:{client_ip}:{current_minute}"
            
            # Permitir 100 requisições por minuto por IP
            request_count = await request.app.state.redis.incr(cache_key)
            
            # Define o TTL apenas na primeira requisição
            if request_count == 1:
                await request.app.state.redis.expire(cache_key, 60)
            
            if request_count > 100:
                return Response(
                    content='{"detail":"Too many requests"}',
                    media_type='application/json',
                    status_code=429
                )
        except Exception as e:
            # Em caso de falha do Redis, permite a requisição mas loga o erro
            print(f"Erro no rate limiting: {e}")
            # Não bloqueia a requisição em caso de falha do Redis
        
        response = await call_next(request)
        return response

class PerformanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        response = await call_next(request)
        
        # Adicionar headers de performance
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response

class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Adicionar headers de segurança
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response

def setup_middlewares(app: FastAPI) -> None:
    """Configurar todos os middlewares da aplicação"""
    
    # Comprimir respostas
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Hosts confiáveis
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[settings.domain]
    )
    
    # Rate limiting
    app.add_middleware(RateLimitMiddleware)
    
    # Performance tracking
    app.add_middleware(PerformanceMiddleware)
    
    # Security headers
    app.add_middleware(SecurityMiddleware)
