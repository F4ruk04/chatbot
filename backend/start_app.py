#!/usr/bin/env python3
"""
Script de inicialização da aplicação
Trata dependências e configurações antes de iniciar o servidor
"""

import os
import sys
import subprocess
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_and_install_dependencies():
    """Verifica e instala dependências se necessário"""
    try:
        import redis
        import fastapi
        import sqlalchemy
        logger.info("✅ Dependências principais encontradas")
        return True
    except ImportError as e:
        logger.warning(f"⚠️ Dependência faltando: {e}")
        logger.info("📦 Instalando dependências...")
        
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            logger.info("✅ Dependências instaladas com sucesso")
            return True
        except subprocess.CalledProcessError:
            logger.error("❌ Erro ao instalar dependências")
            return False

def run_migrations():
    """Executa migrações do banco de dados"""
    try:
        logger.info("🔄 Executando migrações do banco...")
        subprocess.check_call(["alembic", "upgrade", "head"])
        logger.info("✅ Migrações executadas com sucesso")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Erro ao executar migrações: {e}")
        return False
    except FileNotFoundError:
        logger.error("❌ Alembic não encontrado. Instale as dependências primeiro.")
        return False

def start_application():
    """Inicia a aplicação FastAPI"""
    try:
        logger.info("🚀 Iniciando aplicação...")
        
        # Importar e iniciar a aplicação
        from main import app
        import uvicorn
        
        # Configurações do servidor
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", 8000))
        
        uvicorn.run(
            app,
            host=host,
            port=port,
            reload=os.getenv("RAILWAY_ENVIRONMENT") != "production"
        )
        
    except Exception as e:
        logger.error(f"❌ Erro ao iniciar aplicação: {e}")
        return False

def main():
    """Função principal"""
    logger.info("�� Iniciando SaaS Chatbot Inteligente...")
    
    # 1. Verificar e instalar dependências
    if not check_and_install_dependencies():
        logger.error("❌ Falha ao configurar dependências")
        sys.exit(1)
    
    # 2. Executar migrações (opcional, pode falhar se DB não estiver disponível)
    if not run_migrations():
        logger.warning("⚠️ Migrações falharam, continuando sem elas...")
    
    # 3. Iniciar aplicação
    start_application()

if __name__ == "__main__":
    main()