# Makefile para SaaS Chatbot Inteligente
# Comandos úteis para desenvolvimento e produção

.PHONY: help build up down logs clean install-deps migrate test

# Mostrar ajuda
help:
	@echo "📋 Comandos disponíveis:"
	@echo ""
	@echo "🚀 Desenvolvimento:"
	@echo "  make up          - Iniciar todos os serviços"
	@echo "  make down        - Parar todos os serviços"
	@echo "  make build       - Construir imagens Docker"
	@echo "  make logs        - Ver logs dos serviços"
	@echo "  make restart     - Reiniciar todos os serviços"
	@echo ""
	@echo "🔧 Manutenção:"
	@echo "  make clean       - Limpar containers e volumes"
	@echo "  make migrate     - Executar migrações do banco"
	@echo "  make shell-be    - Acesso shell do backend"
	@echo "  make shell-fe    - Acesso shell do frontend"
	@echo "  make shell-db    - Acesso shell do banco"
	@echo ""
	@echo "📦 Instalação:"
	@echo "  make install     - Instalar dependências localmente"

# Construir imagens Docker
build:
	@echo "🔨 Construindo imagens Docker..."
	docker-compose build

# Iniciar todos os serviços
up:
	@echo "🚀 Iniciando serviços..."
	docker-compose up -d
	@echo "✅ Serviços iniciados!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔗 Backend: http://localhost:8000"
	@echo "📊 Docs API: http://localhost:8000/docs"

# Parar todos os serviços
down:
	@echo "⏹️  Parando serviços..."
	docker-compose down

# Ver logs dos serviços
logs:
	docker-compose logs -f

# Reiniciar todos os serviços
restart: down up

# Limpar containers e volumes
clean:
	@echo "🧹 Limpando containers e volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Executar migrações do banco
migrate:
	@echo "🔄 Executando migrações..."
	docker-compose exec backend alembic upgrade head

# Shell do backend
shell-be:
	docker-compose exec backend bash

# Shell do frontend
shell-fe:
	docker-compose exec frontend sh

# Shell do banco de dados
shell-db:
	docker-compose exec db psql -U user -d chatbot

# Instalar dependências localmente (para desenvolvimento)
install:
	@echo "📦 Instalando dependências do backend..."
	cd backend && pip install -r requirements.txt
	@echo "📦 Instalando dependências do frontend..."
	cd frontend && npm install
	@echo "✅ Dependências instaladas!"

# Verificar status dos serviços
status:
	docker-compose ps

# Ver uso de recursos
stats:
	docker stats

