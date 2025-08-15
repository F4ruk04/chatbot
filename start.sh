#!/bin/bash

# Script de inicialização para Railway
echo "🚀 Iniciando SaaS ChatBot Inteligente..."

# Aguardar banco de dados estar disponível
echo "⏳ Aguardando banco de dados..."
python -c "
import time
import psycopg2
import os
from urllib.parse import urlparse

def wait_for_db():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print('❌ DATABASE_URL não encontrada')
        return False
    
    parsed = urlparse(db_url)
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            conn = psycopg2.connect(
                host=parsed.hostname,
                port=parsed.port,
                user=parsed.username,
                password=parsed.password,
                database=parsed.path[1:]
            )
            conn.close()
            print('✅ Banco de dados conectado!')
            return True
        except Exception as e:
            retry_count += 1
            print(f'⏳ Tentativa {retry_count}/{max_retries} - Aguardando banco...')
            time.sleep(2)
    
    print('❌ Não foi possível conectar ao banco de dados')
    return False

wait_for_db()
"

# Executar migrações do Alembic
echo "📊 Executando migrações do banco de dados..."
alembic upgrade head

# Iniciar aplicação
echo "🎯 Iniciando aplicação..."
echo "--- Environment Variables ---"
env
echo "-----------------------------"
uvicorn main:app --host 0.0.0.0 --port $PORT
