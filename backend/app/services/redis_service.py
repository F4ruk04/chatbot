"""
Redis Service
Módulo para gerenciar a conexão e operações com o Redis
"""

from redis import asyncio as aioredis
from app.config import settings

async def init_redis():
    """Inicializa a conexão com o Redis"""
    redis = await aioredis.from_url(
        settings.redis_url,
        password=settings.redis_password,
        encoding="utf-8",
        decode_responses=True
    )
    return redis

async def close_redis(app):
    """Fecha a conexão com o Redis quando a aplicação for encerrada"""
    await app.state.redis.close()
