"""
Router de Empresas
Endpoints para gestão de empresas
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.company import Company
from app.models.message import Message
from app.models.subscription import Subscription, SubscriptionPlan
from app.utils.auth import get_current_user

router = APIRouter(prefix="/companies", tags=["companies"])


class CompanyCreate(BaseModel):
    """Schema para criação de empresa"""
    nome: str
    descricao: Optional[str] = None
    whatsapp_phone_number: str
    context_prompt: Optional[str] = None


class CompanyResponse(BaseModel):
    """Schema para resposta de empresa"""
    id: int
    nome: str
    descricao: Optional[str]
    whatsapp_phone_number: str
    context_prompt: Optional[str]
    created_at: str

    @field_validator('created_at', mode='before')
    @classmethod
    def convert_datetime_to_string(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    class Config:
        from_attributes = True


@router.post("/add", response_model=CompanyResponse)
def create_company(
    company_data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para adicionar nova empresa
    """
    # Obter a assinatura atual do usuário
    user_subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).order_by(Subscription.created_at.desc()).first()

    if not user_subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário não possui uma assinatura ativa para adicionar empresas."
        )

    # Definir limites de conexão WhatsApp com base no plano
    whatsapp_connection_limit = 0
    if user_subscription.plan == SubscriptionPlan.FREE.value:
        whatsapp_connection_limit = 1
    elif user_subscription.plan == SubscriptionPlan.PRO.value:
        whatsapp_connection_limit = 1
    elif user_subscription.plan == SubscriptionPlan.BUSINESS.value:
        whatsapp_connection_limit = 3
    
    # Contar as empresas existentes do usuário
    existing_companies_count = db.query(Company).filter(
        Company.owner_id == current_user.id
    ).count()

    # Verificar se o limite de conexões WhatsApp foi atingido
    if existing_companies_count >= whatsapp_connection_limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Você atingiu o limite de {whatsapp_connection_limit} conexões WhatsApp para o seu plano '{user_subscription.plan.capitalize()}'."
        )

    # Verificar se o número do WhatsApp já está em uso por qualquer empresa
    existing_whatsapp_number = db.query(Company).filter(
        Company.whatsapp_phone_number == company_data.whatsapp_phone_number
    ).first()
    
    if existing_whatsapp_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Número do WhatsApp já está em uso por outra empresa."
        )
    
    # Criar nova empresa
    new_company = Company(
        nome=company_data.nome,
        descricao=company_data.descricao,
        whatsapp_phone_number=company_data.whatsapp_phone_number,
        context_prompt=company_data.context_prompt,
        owner_id=current_user.id
    )
    
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    
    return new_company


@router.get("/", response_model=List[CompanyResponse])
def get_user_companies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para obter todas as empresas do utilizador
    """
    companies = db.query(Company).filter(Company.owner_id == current_user.id).all()
    return companies


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para obter uma empresa específica
    """
    company = db.query(Company).filter(
        Company.id == company_id,
        Company.owner_id == current_user.id
    ).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    return company


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    company_data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para atualizar uma empresa
    """
    company = db.query(Company).filter(
        Company.id == company_id,
        Company.owner_id == current_user.id
    ).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Verificar se o novo número do WhatsApp já está em uso (se foi alterado)
    if company_data.whatsapp_phone_number != company.whatsapp_phone_number:
        existing_company = db.query(Company).filter(
            Company.whatsapp_phone_number == company_data.whatsapp_phone_number
        ).first()
        
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Número do WhatsApp já está em uso"
            )
    
    # Atualizar dados da empresa
    company.nome = company_data.nome
    company.descricao = company_data.descricao
    company.whatsapp_phone_number = company_data.whatsapp_phone_number
    company.context_prompt = company_data.context_prompt
    
    db.commit()
    db.refresh(company)
    
    return company


@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para deletar uma empresa
    Remove primeiro todas as mensagens relacionadas e depois a empresa
    """
    company = db.query(Company).filter(
        Company.id == company_id,
        Company.owner_id == current_user.id
    ).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    try:
        # Primeiro, deletar todas as mensagens relacionadas à empresa
        messages_count = db.query(Message).filter(Message.company_id == company_id).count()
        db.query(Message).filter(Message.company_id == company_id).delete()
        
        # Depois, deletar a empresa
        db.delete(company)
        db.commit()
        
        return {
            "message": "Empresa deletada com sucesso",
            "deleted_messages": messages_count
        }
        
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao deletar empresa: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno do servidor: {str(e)}"
        )
