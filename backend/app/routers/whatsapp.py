"""
Router do WhatsApp
Endpoints para webhook e integração com WhatsApp via Twilio
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, Form
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from app.database import get_db
from app.models.company import Company
from app.models.message import Message
from app.services.twilio_whatsapp_service import twilio_whatsapp_service
from app.services.gemini_service import gemini_service

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])


# O webhook do Twilio envia dados como application/x-www-form-urlencoded
# Portanto, usamos Form em vez de Request.json()
@router.post("/webhook")
async def receive_twilio_webhook(
    From: str = Form(alias="From"),
    To: str = Form(alias="To"),
    Body: str = Form(alias="Body"),
    MessageSid: str = Form(alias="MessageSid"),
    db: Session = Depends(get_db)
):
    """
    Endpoint para receber mensagens via webhook do Twilio (WhatsApp)
    Retorna TwiML XML response para evitar timeout do Twilio
    """
    
    # Log da mensagem recebida
    logger.info(f"=== WEBHOOK TWILIO RECEBIDO ===")
    logger.info(f"Timestamp: {datetime.now()}")
    logger.info(f"From: {From}")
    logger.info(f"To: {To}")
    logger.info(f"Body: {Body}")
    logger.info(f"MessageSid: {MessageSid}")
    logger.info(f"================================")
    
    # Resposta TwiML imediata para evitar timeout
    twiml_response = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>"""
    
    try:
        # O Twilio envia o número no formato "whatsapp:+<numero>"
        # Precisamos remover o prefixo "whatsapp:" e limpar espaços
        from_number = From.replace("whatsapp:", "").strip()
        to_number = To.replace("whatsapp:", "").strip()
        
        # Garantir que o número tenha o prefixo + se não tiver
        if not to_number.startswith('+'):
            to_number = '+' + to_number
        message_text = Body
        message_id = MessageSid
        
        logger.info(f"Processando mensagem de {from_number} para {to_number}")
        
        # Encontrar a empresa pelo número do WhatsApp (o número para o qual a mensagem foi enviada)
        company = db.query(Company).filter(
            Company.whatsapp_phone_number == to_number
        ).first()
        
        if not company:
            logger.warning(f"Empresa não encontrada para o número: {to_number}")
            # Retornar TwiML vazio mas válido
            return Response(content=twiml_response, media_type="application/xml")
        
        logger.info(f"Empresa encontrada: {company.nome} (ID: {company.id})")
        
        # Verificar se a mensagem já foi processada (para evitar duplicados)
        existing_message = db.query(Message).filter(
            Message.whatsapp_message_id == message_id
        ).first()
        
        if existing_message:
            logger.info(f"Mensagem já processada: {message_id}")
            return Response(content=twiml_response, media_type="application/xml")
        
        # Buscar mensagens anteriores para contexto de conversa
        previous_messages = db.query(Message).filter(
            Message.company_id == company.id,
            Message.sender_phone == from_number
        ).order_by(Message.created_at.desc()).limit(5).all()
        
        # Construir histórico de conversa
        conversation_history = ""
        if previous_messages:
            history_parts = []
            for msg in reversed(previous_messages):  # Ordem cronológica
                history_parts.append(f"Cliente: {msg.message_text}")
                if msg.response_text:
                    history_parts.append(f"Assistente: {msg.response_text}")
            conversation_history = "\n".join(history_parts)
        
        # Gerar resposta usando Gemini
        logger.info(f"Gerando resposta com Gemini para: {message_text}")
        response_text = gemini_service.generate_response(
            message=message_text,
            context=company.context_prompt,
            company_name=company.nome,
            conversation_history=conversation_history if conversation_history else None
        )
        logger.info(f"Resposta gerada: {response_text}")
        
        # Salvar mensagem no banco de dados
        new_message = Message(
            whatsapp_message_id=message_id,
            sender_phone=from_number,
            sender_name=None, # Twilio não fornece nome do remetente diretamente no webhook
            message_text=message_text,
            response_text=response_text,
            is_from_customer=True,
            company_id=company.id
        )
        
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        logger.info(f"Mensagem salva no banco de dados com ID: {new_message.id}")
        
        # Enviar resposta via Twilio WhatsApp
        success = twilio_whatsapp_service.send_message(
            to_number=From, # Enviar de volta para o remetente original
            message=response_text,
            from_number=To # Usar o número da empresa como remetente
        )
        
        if success:
            logger.info(f"Resposta enviada com sucesso para {from_number} via {to_number}")
        else:
            logger.error(f"Erro ao enviar resposta para {from_number} via {to_number}")
        
        # Sempre retornar TwiML válido
        return Response(content=twiml_response, media_type="application/xml")
        
    except Exception as e:
        logger.error(f"Erro ao processar webhook do Twilio: {e}")
        # Mesmo em caso de erro, retornar TwiML válido para evitar timeout
        return Response(content=twiml_response, media_type="application/xml")


# O endpoint de verificação do webhook do WhatsApp (GET) não é mais necessário para Twilio
# O Twilio não usa o mesmo mecanismo de verificação do Meta direto
# @router.get("/webhook")
# def verify_webhook(
#     hub_mode: str = Query(alias="hub.mode"),
#     hub_verify_token: str = Query(alias="hub.verify_token"),
#     hub_challenge: str = Query(alias="hub.challenge")
# ):
#     """
#     Endpoint para verificação do webhook do WhatsApp
#     """
#     challenge = whatsapp_service.verify_webhook(
#         mode=hub_mode,
#         token=hub_verify_token,
#         challenge=hub_challenge
#     )
#     
#     if challenge:
#         return int(challenge)
#     else:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Token de verificação inválido"
#         )


@router.get("/messages/{company_id}")
def get_company_messages(
    company_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Endpoint para obter mensagens de uma empresa
    """
    messages = db.query(Message).filter(
        Message.company_id == company_id
    ).offset(skip).limit(limit).all()
    
    return messages


@router.get("/test")
def test_webhook():
    """
    Endpoint de teste para verificar se o servidor está funcionando
    """
    logger.info("Endpoint de teste acessado")
    return {
        "status": "success",
        "message": "Webhook WhatsApp está funcionando",
        "timestamp": datetime.now().isoformat(),
        "webhook_url": "/whatsapp/webhook"
    }


@router.post("/test-webhook")
async def test_webhook_post(
    From: str = Form(default="whatsapp:+1234567890"),
    To: str = Form(default="whatsapp:+14155238886"),
    Body: str = Form(default="Teste de mensagem"),
    MessageSid: str = Form(default="SM1234567890abcdef1234567890abcdef")
):
    """
    Endpoint de teste para simular uma chamada do webhook do Twilio
    """
    logger.info("=== TESTE DE WEBHOOK ===")
    logger.info(f"From: {From}")
    logger.info(f"To: {To}")
    logger.info(f"Body: {Body}")
    logger.info(f"MessageSid: {MessageSid}")
    logger.info("========================")
    
    # Retornar TwiML válido
    twiml_response = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Teste recebido com sucesso!</Message>
</Response>"""
    
    return Response(content=twiml_response, media_type="application/xml")

