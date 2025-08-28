"""
Router do Dashboard
Endpoints para estatísticas e dados do dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from pydantic import BaseModel, field_validator
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.company import Company
from app.models.message import Message
from app.utils.auth import get_current_user
from app.config.plans import get_plan_limits # Importar funções de planos centralizadas
from app.middleware.plan_checker import PlanCheckerMiddleware # Importar o middleware

router = APIRouter(tags=["dashboard"])


class DashboardStats(BaseModel):
    """Schema para estatísticas do dashboard"""
    user_plan: str
    company_limit: int
    message_limit: int
    message_usage_percentage: float
    total_companies: int
    total_messages: int
    messages_today: int
    messages_this_week: int
    messages_this_month: int
    active_conversations: int


class CompanyStats(BaseModel):
    """Schema para estatísticas por empresa"""
    company_id: int
    company_name: str
    total_messages: int
    messages_today: int
    last_message_date: Optional[str] = None

    @field_validator('last_message_date', mode='before')
    @classmethod
    def convert_datetime_to_string(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v


class MessageStats(BaseModel):
    """Schema para estatísticas de mensagens por dia"""
    date: str
    message_count: int


@router.get("/", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para obter estatísticas gerais do dashboard
    """
    # Obter todas as empresas do utilizador
    user_companies = db.query(Company).filter(Company.owner_id == current_user.id).all()
    company_ids = [company.id for company in user_companies]
    
    # Obter plano e limites do usuário usando configuração centralizada
    user_plan_name = current_user.plan
    plan_limits = get_plan_limits(user_plan_name)
    company_limit = plan_limits['company_limit']
    message_limit = plan_limits['message_limit']

    # Obter todas as empresas do utilizador
    user_companies = db.query(Company).filter(Company.owner_id == current_user.id).all()
    company_ids = [company.id for company in user_companies]
    
    # Inicializar estatísticas
    total_companies = len(user_companies)
    total_messages = 0
    messages_today = 0
    messages_this_week = 0
    messages_this_month = 0
    active_conversations = 0
    message_usage_percentage = 0.0

    if company_ids:
        # Calcular datas
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Total de mensagens
        total_messages = db.query(Message).filter(
            Message.company_id.in_(company_ids)
        ).count()
        
        # Mensagens hoje
        messages_today = db.query(Message).filter(
            and_(
                Message.company_id.in_(company_ids),
                func.date(Message.created_at) == today
            )
        ).count()
        
        # Mensagens esta semana
        messages_this_week = db.query(Message).filter(
            and_(
                Message.company_id.in_(company_ids),
                func.date(Message.created_at) >= week_ago
            )
        ).count()
        
        # Mensagens este mês
        messages_this_month = db.query(Message).filter(
            and_(
                Message.company_id.in_(company_ids),
                func.date(Message.created_at) >= month_ago
            )
        ).count()
        
        # Conversas ativas (clientes únicos que enviaram mensagem nos últimos 7 dias)
        active_conversations = db.query(Message.sender_phone).filter(
            and_(
                Message.company_id.in_(company_ids),
                func.date(Message.created_at) >= week_ago,
                Message.is_from_customer == True
            )
        ).distinct().count()

        if message_limit > 0:
            message_usage_percentage = (total_messages / message_limit) * 100
    
    return DashboardStats(
        user_plan=user_plan_name,
        company_limit=company_limit,
        message_limit=message_limit,
        message_usage_percentage=round(message_usage_percentage, 2),
        total_companies=total_companies,
        total_messages=total_messages,
        messages_today=messages_today,
        messages_this_week=messages_this_week,
        messages_this_month=messages_this_month,
        active_conversations=active_conversations
    )


@router.get("/companies", response_model=List[CompanyStats])
def get_companies_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para obter estatísticas por empresa
    """
    # Obter empresas do utilizador com estatísticas
    companies_stats = []
    
    user_companies = db.query(Company).filter(Company.owner_id == current_user.id).all()
    today = datetime.now().date()
    
    for company in user_companies:
        # Total de mensagens da empresa
        total_messages = db.query(Message).filter(
            Message.company_id == company.id
        ).count()
        
        # Mensagens hoje
        messages_today = db.query(Message).filter(
            and_(
                Message.company_id == company.id,
                func.date(Message.created_at) == today
            )
        ).count()
        
        # Última mensagem
        last_message = db.query(Message).filter(
            Message.company_id == company.id
        ).order_by(Message.created_at.desc()).first()
        
        last_message_date = None
        if last_message:
            last_message_date = last_message.created_at
        
        companies_stats.append(CompanyStats(
            company_id=company.id,
            company_name=company.nome,
            total_messages=total_messages,
            messages_today=messages_today,
            last_message_date=last_message_date
        ))
    
    return companies_stats


@router.get(
    "/messages-chart/{company_id}", 
    response_model=List[MessageStats],
    dependencies=[Depends(PlanCheckerMiddleware(required_plans=["Profissional", "Business"]))] # Pro e Business podem acessar
)
def get_messages_chart_data(
    company_id: int,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para obter dados do gráfico de mensagens por dia
    """
    # Verificar se a empresa pertence ao utilizador
    company = db.query(Company).filter(
        and_(
            Company.id == company_id,
            Company.owner_id == current_user.id
        )
    ).first()
    
    if not company:
        return []
    
    # Calcular data de início
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    # Obter contagem de mensagens por dia
    messages_by_date = db.query(
        func.date(Message.created_at).label('date'),
        func.count(Message.id).label('count')
    ).filter(
        and_(
            Message.company_id == company_id,
            func.date(Message.created_at) >= start_date,
            func.date(Message.created_at) <= end_date
        )
    ).group_by(func.date(Message.created_at)).all()
    
    # Converter para formato de resposta
    chart_data = []
    for date_count in messages_by_date:
        chart_data.append(MessageStats(
            date=date_count.date.isoformat(),
            message_count=date_count.count
        ))
    
    return chart_data
