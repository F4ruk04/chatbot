"""
Modelo de Mensagem
Define a estrutura da tabela de mensagens no banco de dados
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Message(Base):
    """
    Modelo de Mensagem
    Representa uma mensagem trocada entre cliente e chatbot
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    whatsapp_message_id = Column(String, unique=True, index=True)
    sender_phone = Column(String, nullable=False)
    sender_name = Column(String)
    message_text = Column(Text, nullable=False)
    response_text = Column(Text)
    is_from_customer = Column(Boolean, default=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamento
    # company = relationship("Company", back_populates="messages")

