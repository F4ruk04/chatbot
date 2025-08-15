"""
Aplicação Principal FastAPI
Ponto de entrada da aplicação SaaS de Chatbot Inteligente
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.database import engine, Base
from app.routers import auth, companies, whatsapp, dashboard, health
import os

# Importar os modelos para que o Alembic os detete
from app.models import user, company, message

# Importar middleware de performance
from app.middleware.performance import setup_middlewares

# Criar tabelas no banco de dados (apenas se não estiver usando Alembic para isso)
# Base.metadata.create_all(bind=engine)

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
    "*"  # Permitir todas as origens temporariamente para debug
]

# Adicionar origem do Railway se estiver em produção
if os.getenv("RAILWAY_ENVIRONMENT"):
    railway_url = os.getenv("RAILWAY_STATIC_URL")
    if railway_url:
        allowed_origins.append(f"https://{railway_url}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(whatsapp.router)
app.include_router(dashboard.router)


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
            "dashboard": "/api/dashboard"
        },
        "frontend_landing_page": "https://chatbot-frontend-pied.vercel.app"
    }

# Configurar middlewares
setup_middlewares(app)

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["whatsapp"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(health.router, prefix="/health", tags=["health"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


