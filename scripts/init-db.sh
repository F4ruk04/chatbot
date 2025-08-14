#!/bin/bash

# Script para inicializar o banco de dados
# Executa as migrações do Alembic

echo "🔄 Aguardando o banco de dados ficar disponível..."

# Aguardar o PostgreSQL ficar disponível
while ! nc -z db 5432; do
  sleep 1
done

echo "✅ Banco de dados disponível!"

echo "🔄 Executando migrações do banco de dados..."

# Navegar para o diretório do backend
cd /app

# Executar migrações do Alembic
alembic upgrade head

echo "✅ Migrações executadas com sucesso!"

echo "🚀 Iniciando aplicação..."

# Iniciar a aplicação
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload

