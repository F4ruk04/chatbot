"""
Router de Autenticação
Endpoints para registo e login de utilizadores
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.user import User
from app.utils.auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class UserRegister(BaseModel):
    """Schema para registo de utilizador"""
    email: EmailStr
    nome: str
    password: str


class UserLogin(BaseModel):
    """Schema para login de utilizador"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema para resposta de token"""
    access_token: str
    token_type: str
    user_id: int
    user_name: str


@router.post("/register", response_model=Token)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Endpoint para registo de novo utilizador
    """
    # Verificar se o email já existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já registado"
        )
    
    # Criar novo utilizador
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        nome=user_data.nome,
        password_hash=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    from app.models.subscription import Subscription, SubscriptionPlan, SubscriptionStatus
    from datetime import datetime, timedelta

    # Criar assinatura FREE para novo usuário
    start = datetime.utcnow()
    end = start + timedelta(days=30)
    free_subscription = Subscription(
        user_id=new_user.id,
        plan=SubscriptionPlan.FREE.value,
        status=SubscriptionStatus.ACTIVE.value,
        current_period_start=start,
        current_period_end=end,
        messages_quota=150,
        messages_used=0
    )
    db.add(free_subscription)
    db.commit()
    db.refresh(free_subscription)
    
    # Criar token de acesso
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=new_user.id,
        user_name=new_user.nome
    )


@router.post("/login", response_model=Token)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Endpoint para login de utilizador
    """
    # Verificar se o utilizador existe
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou password incorretos"
        )
    
    # Verificar password
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou password incorretos"
        )
    
    # Criar token de acesso
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        user_name=user.nome
    )

