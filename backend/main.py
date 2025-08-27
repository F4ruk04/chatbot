"""
Aplicação Principal FastAPI
Ponto de entrada da aplicação SaaS de Chatbot Inteligente
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.database import engine, Base
from app.routers import auth, companies, whatsapp, dashboard, health, payments, subscriptions
from app.services.redis_service import init_redis, close_redis
import os

# Importar os modelos para que o Alembic os detete
from app.models import user, company, message, subscription

# Importar middlewares
from app.middleware.performance import RateLimitMiddleware, PerformanceMiddleware, SecurityMiddleware
from app.middleware.auth_middleware import AuthMiddleware # Importar o novo middleware de autenticação

# Criar tabelas no banco de dados (apenas se não estiver usando Alembic para isso)
# Base.metadata.create_all(bind=engine)

# Inicializar aplicação FastAPI
app = FastAPI(
    title="SaaS Chatbot Inteligente",
    description="Sistema de chatbot inteligente para empresas com integração WhatsApp (via Twilio) e Gemini",
    version="1.0.0"
)

# Incluir router de healthcheck o mais cedo possível para garantir que seja público
app.include_router(health.router, prefix="/health", tags=["health"])

# Configurar CORS para permitir requisições do frontend
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://chatbot-frontend-pied.vercel.app",  # URL específica do Vercel
]
# Inclui FRONTEND_URL configurável
from app.config import settings as app_settings
if app_settings.frontend_url and app_settings.frontend_url not in allowed_origins:
    allowed_origins.append(app_settings.frontend_url)
# Em desenvolvimento, permitir todas as origens para debug
if os.getenv("RAILWAY_ENVIRONMENT") != "production":
    allowed_origins.append("*")

# Permitir configuração dinâmica via variável de ambiente ALLOWED_ORIGINS (CSV)
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    for o in env_origins.split(","):
        o = o.strip()
        if o and o not in allowed_origins:
            allowed_origins.append(o)

# Adicionar origem do Railway se estiver em produção
if os.getenv("RAILWAY_ENVIRONMENT"):
    railway_url = os.getenv("RAILWAY_STATIC_URL")
    if railway_url:
        allowed_origins.append(f"https://{railway_url}")
# Em produção, não usar '*' quando allow_credentials=True
if os.getenv("RAILWAY_ENVIRONMENT") == "production" and "*" in allowed_origins:
    allowed_origins = [o for o in allowed_origins if o != "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Adicionar AuthMiddleware ANTES de outros middlewares que dependem do usuário
app.add_middleware(AuthMiddleware)

# Configurar outros middlewares de performance e segurança
# Comprimir respostas
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Hosts confiáveis
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

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["whatsapp"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(subscriptions.router, prefix="/api/subscription", tags=["subscriptions"])


@app.get("/")
def read_root():
    """
    Endpoint raiz da API. Retorna uma mensagem de boas-vindas.
    """
    return {"message": "SaaS Chatbot Inteligente API is running!"}

@app.get("/api")
def api_info():
    """
    Informações detalhadas da API.
    """
    return {
        "message": "SaaS Chatbot Inteligente API",
        "version": "1.0.0",
        "status": "online",
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "development"),
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "companies": "/api/companies",
            "whatsapp": "/api/whatsapp",
            "dashboard": "/api/dashboard",
            "payments": "/api/payments",
            "subscriptions": "/api/subscription"
        },
        "frontend_landing_page": "https://chatbot-frontend-pied.vercel.app"
    }

# Configurar middlewares
# Evento de inicialização
@app.on_event("startup")
async def startup_event():
    """Inicializa serviços quando a aplicação inicia"""
    app.state.redis = await init_redis()

# Evento de encerramento
@app.on_event("shutdown")
async def shutdown_event():
    """Encerra serviços quando a aplicação é encerrada"""
    await close_redis(app)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
