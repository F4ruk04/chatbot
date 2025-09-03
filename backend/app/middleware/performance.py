from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import os
import time
import logging
from typing import Callable
import jwt
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config import settings

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Não aplicar rate limiting em ambiente de desenvolvimento
        if os.getenv('RAILWAY_ENVIRONMENT') != 'production':
            return await call_next(request)
            
        # Pegar IP do cliente
        client_ip = request.client.host
        
        # Rate limiting baseado no Redis
        try:
            redis = getattr(request.app.state, 'redis', None)
            if not redis:
                logger.warning("Redis não disponível, pulando rate limiting")
                return await call_next(request)
                
            current_minute = int(time.time() / 60)
            cache_key = f"rate_limit:{client_ip}:{current_minute}"
            
            pipe = redis.pipeline()
            pipe.incr(cache_key)
            pipe.expire(cache_key, 60)
            request_count, _ = await pipe.execute()
            
            if request_count > 100:
                return Response(
                    content='{"detail":"Too many requests"}',
                    media_type='application/json',
                    status_code=429
                )
        except Exception as e:
            logger.error(f"Erro no rate limiting: {e}")
            # Em produção, ser conservador e permitir a requisição
            return await call_next(request)
        
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
    
    # CORS é configurado centralmente no main.py para evitar conflitos
    
    # Hosts confiáveis
    # Em produção, restringe ao domínio configurado e ao domínio do Railway
    # Em desenvolvimento, permite todos para evitar 400 Bad Request por Host inválido
    allowed_hosts = ["localhost", "127.0.0.1", "0.0.0.0"]
    railway_host = os.getenv("RAILWAY_STATIC_URL") or os.getenv("RAILWAY_URL")
    if railway_host:
        railway_host = railway_host.replace("https://", "").replace("http://", "")
        allowed_hosts.append(railway_host)
        allowed_hosts.append("*.railway.app")
    # Permitir configuração adicional via ALLOWED_HOSTS (CSV)
    env_hosts = os.getenv("ALLOWED_HOSTS")
    if env_hosts:
        for h in env_hosts.split(","):
            h = h.strip()
            if h and h not in allowed_hosts:
                allowed_hosts.append(h)
    if os.getenv("RAILWAY_ENVIRONMENT") != "production":
        allowed_hosts = ["*"]
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=allowed_hosts
    )
    
    # Rate limiting
    app.add_middleware(RateLimitMiddleware)
    
    # Performance tracking
    app.add_middleware(PerformanceMiddleware)
    
    # Security headers
    app.add_middleware(SecurityMiddleware)
