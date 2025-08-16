#!/usr/bin/env python3
"""
Script de inicialização para Railway
Trata a variável PORT corretamente e executa migrações
"""

import os
import sys
import subprocess
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migrations():
    """Executa migrações do Alembic"""
    try:
        logger.info("🔄 Executando migrações do banco...")
        result = subprocess.run(["alembic", "upgrade", "head"], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("✅ Migrações executadas com sucesso")
        else:
            logger.warning(f"⚠️ Migrações falharam: {result.stderr}")
            logger.info("Continuando sem migrações...")
            
    except Exception as e:
        logger.warning(f"⚠️ Erro ao executar migrações: {e}")
        logger.info("Continuando sem migrações...")

def start_server():
    """Inicia o servidor Uvicorn"""
    try:
        # Obter porta do ambiente ou usar 8000 como padrão
        port = int(os.getenv("PORT", 8000))
        host = "0.0.0.0"
        
        logger.info(f"🚀 Iniciando servidor em {host}:{port}")
        
        # Importar e executar uvicorn
        import uvicorn
        from main import app
        
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info"
        )
        
    except Exception as e:
        logger.error(f"❌ Erro ao iniciar servidor: {e}")
        sys.exit(1)

def main():
    """Função principal"""
    logger.info("🎯 Iniciando SaaS Chatbot Inteligente no Railway...")
    
    # Executar migrações
    run_migrations()
    
    # Iniciar servidor
    start_server()

if __name__ == "__main__":
    main()