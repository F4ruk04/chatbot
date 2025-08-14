"""
Aplicação Principal FastAPI
Ponto de entrada da aplicação SaaS de Chatbot Inteligente
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, companies, whatsapp, dashboard
import os

# Importar os modelos para que o Alembic os detete
from app.models import user, company, message

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
    "https://*.railway.app",
    "https://*.vercel.app"
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
    Endpoint raiz da API
    """
    return {
        "message": "SaaS Chatbot Inteligente API",
        "version": "1.0.0",
        "status": "online",
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "development"),
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """
    Endpoint para verificação de saúde da API
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


