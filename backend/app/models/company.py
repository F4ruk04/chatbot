"""
Modelo de Empresa
Define a estrutura da tabela de empresas no banco de dados
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Company(Base):
    """
    Modelo de Empresa
    Representa uma empresa que utiliza o chatbot
    """
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(Text)
    whatsapp_phone_number = Column(String, unique=True, index=True)
    context_prompt = Column(Text)  # Contexto personalizado para o Gemini
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    # owner = relationship("User", back_populates="companies")
    # messages = relationship("Message", back_populates="company", lazy="dynamic")

