"""
Aplicação Principal FastAPI
Ponto de entrada da aplicação SaaS de Chatbot Inteligente
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, companies, whatsapp, dashboard, health, payments, subscriptions
import os

# Importar os modelos para que o Alembic os detete
from app.models import user, company, message, subscription

# Inicializar aplicação FastAPI
app = FastAPI(
    title="SaaS Chatbot Inteligente",
    description="Sistema de chatbot inteligente para empresas com integração WhatsApp (via Twilio) e Gemini",
    version="1.0.0"
)

# Configurar CORS para permitir requisições do frontend
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://chatbot-frontend-pied.vercel.app",  # URL específica do Vercel
]

# Inclui FRONTEND_URL configurável
try:
    from app.config import settings as app_settings
    if app_settings.frontend_url and app_settings.frontend_url not in allowed_origins:
        allowed_origins.append(app_settings.frontend_url)
except ImportError:
    pass

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
            "permissions": "/api/permissions",
            "usage": "/api/usage",
            "admin": "/api/admin"
        },
        "frontend_landing_page": "https://chatbot-frontend-pied.vercel.app"
    }

# Configurar middlewares opcionais
try:
    from app.middleware.performance import setup_middlewares
    setup_middlewares(app)
except ImportError:
    print("Warning: performance middleware not available")

# Configurar Redis opcionalmente
try:
    from app.services.redis_service import init_redis, close_redis
    
    @app.on_event("startup")
    async def startup_event():
        """Inicializa serviços quando a aplicação inicia"""
        try:
            app.state.redis = await init_redis()
        except Exception as e:
            print(f"Warning: Redis not available: {e}")
            app.state.redis = None

    @app.on_event("shutdown")
    async def shutdown_event():
        """Encerra serviços quando a aplicação é encerrada"""
        try:
            await close_redis(app)
        except Exception:
            pass
            
except ImportError:
    print("Warning: Redis service not available")

# Incluir routers principais
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["whatsapp"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(subscriptions.router, prefix="/api/subscription", tags=["subscriptions"])
app.include_router(health.router, prefix="/health", tags=["health"])

# Incluir routers opcionais (com tratamento de erro)
try:
    from app.routers import permissions
    app.include_router(permissions.router, prefix="/api/permissions", tags=["permissions"])
except ImportError:
    print("Warning: permissions router not found")

try:
    from app.routers import usage
    app.include_router(usage.router, prefix="/api/usage", tags=["usage"])
except ImportError:
    print("Warning: usage router not found")

try:
    from app.routers import admin
    app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
except ImportError:
    print("Warning: admin router not found")

# Incluir routers sem prefixo (mantido para compatibilidade)
app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(whatsapp.router)
app.include_router(dashboard.router)
app.include_router(payments.router)

if __name__ == "__main__":
    import uvicorn
    
    # Obter porta do ambiente com tratamento de erro
    try:
        port_str = os.getenv("PORT", "8000")
        port = int(port_str)
        if not (1 <= port <= 65535):
            print("Warning: PORT environment variable is not a valid port number (1-65535), defaulting to 8000")
        port = 8000
    except (ValueError, TypeError):
        port = 8000
    
    print(f"🚀 Iniciando servidor na porta {port}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("RAILWAY_ENVIRONMENT") != "production"
    )
