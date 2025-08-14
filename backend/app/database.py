"""
Configuração do banco de dados
Este módulo configura a conexão com PostgreSQL usando SQLAlchemy
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Criar engine do SQLAlchemy
engine = create_engine(settings.database_url)

# Criar SessionLocal para interações com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()


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

