"""
Configuração do banco de dados
Este módulo configura a conexão com PostgreSQL usando SQLAlchemy
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Criar engine do SQLAlchemy
# Handle SQLite with proper connect_args
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,  # Verificar conexão antes de usar
        pool_recycle=3600,   # Reciclar conexões a cada hora
    )
else:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,  # Verificar conexão antes de usar
        pool_recycle=3600,   # Reciclar conexões a cada hora
        pool_size=10,        # Tamanho do pool de conexões
        max_overflow=20,     # Máximo de conexões extras
    )

# Criar SessionLocal para interações com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()
# Ensure Base.metadata is the explicitly defined MetaData object
metadata = Base.metadata


def get_db():
    """
    Função para obter uma sessão do banco de dados
    Utilizada como dependência no FastAPI
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
