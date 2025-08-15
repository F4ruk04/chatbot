"""
Redis Service
Módulo para gerenciar a conexão e operações com o Redis
"""

import asyncio
from redis import asyncio as aioredis
from redis.exceptions import ConnectionError
from app.config import settings
import logging

logger = logging.getLogger(__name__)

async def init_redis(max_retries=5, retry_delay=5):
    """
    Inicializa a conexão com o Redis com suporte a retentativas
    
    Args:
        max_retries (int): Número máximo de tentativas de conexão
        retry_delay (int): Tempo em segundos entre tentativas
    """
    for attempt in range(max_retries):
        try:
            redis = await aioredis.from_url(
                settings.redis_url,
                password=settings.redis_password,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5
            )
            # Testa a conexão
            await redis.ping()
            logger.info("Conexão com Redis estabelecida com sucesso")
            return redis
        except ConnectionError as e:
            if attempt == max_retries - 1:
                logger.error(f"Falha ao conectar ao Redis após {max_retries} tentativas: {e}")
                raise
            logger.warning(f"Tentativa {attempt + 1} de {max_retries} falhou. Tentando novamente em {retry_delay}s...")
            await asyncio.sleep(retry_delay)
        except Exception as e:
            logger.error(f"Erro inesperado ao conectar ao Redis: {e}")
            raise

async def close_redis(app):
    """Fecha a conexão com o Redis quando a aplicação for encerrada"""
    try:
        if hasattr(app.state, 'redis'):
            await app.state.redis.close()
            logger.info("Conexão com Redis fechada com sucesso")
    except Exception as e:
        logger.error(f"Erro ao fechar conexão com Redis: {e}")
