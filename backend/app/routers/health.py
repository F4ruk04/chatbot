from fastapi import APIRouter

router = APIRouter()

@router.get("")
@router.get("/")
async def health_check():
    """
    Endpoint de health check para o Railway
    Retorna um status básico para verificar se a aplicação está rodando
    """
    return {"status": "ok"}
