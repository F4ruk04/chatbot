from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Endpoint de health check para o Railway
    Verifica se o banco de dados está conectado
    """
    try:
        # Tenta fazer uma query simples para verificar a conexão
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "message": "Sistema operando normalmente"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "message": str(e)
        }
