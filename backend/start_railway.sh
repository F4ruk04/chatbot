#!/bin/bash

echo "🎯 Iniciando SaaS Chatbot Inteligente no Railway..."

# Executar migrações
echo "🔄 Executando migrações..."
alembic upgrade head || echo "⚠️ Migrações falharam, continuando..."

# Obter porta do ambiente ou usar 8000
PORT=${PORT:-8000}

echo "🚀 Iniciando servidor na porta $PORT..."

# Iniciar servidor
exec python -m uvicorn main:app --host 0.0.0.0 --port "$PORT"