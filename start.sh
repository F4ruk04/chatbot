#!/bin/bash

echo "🎯 Iniciando SaaS Chatbot Inteligente..."

# Executar migrações (opcional)
echo "🔄 Executando migrações..."
alembic upgrade head || echo "⚠️ Migrações falharam, continuando..."

# Iniciar aplicação
echo "🚀 Iniciando servidor FastAPI..."
python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}