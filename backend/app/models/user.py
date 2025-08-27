"""
Modelo de Utilizador
Define a estrutura da tabela de utilizadores no banco de dados
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """
    Modelo de Utilizador
    Representa um utilizador do sistema que pode ter múltiplas empresas
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nome = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    # Plano do usuário (Básico, Profissional, Business)
    plan = Column(String, nullable=False, default="Básico") # Alterado de "free" para "Básico"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamento com empresas (usando string para evitar importação circular)
    # companies = relationship("Company", back_populates="owner", lazy="dynamic")
