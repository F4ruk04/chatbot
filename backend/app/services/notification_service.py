"""
Serviço de Notificações
Monitora uso e envia notificações automáticas
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from typing import List
import logging
from ..database import get_db
from ..models.user import User
from ..models.subscription import Subscription, SubscriptionStatus
from .email_service import email_service

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.email_service = email_service
    
    def check_and_send_usage_notifications(self, db: Session) -> dict:
        """
        Verifica todos os usuários e envia notificações de uso quando necessário
        """
        notifications_sent = {
            'warning_80': 0,
            'warning_100': 0,
            'errors': 0
        }
        
        try:
            # Buscar todas as subscriptions ativas
            active_subscriptions = db.query(Subscription).filter(
                Subscription.status == SubscriptionStatus.ACTIVE.value
            ).all()
            
            for subscription in active_subscriptions:
                try:
                    # Calcular percentual de uso
                    if subscription.messages_quota > 0:
                        usage_percent = (subscription.messages_used / subscription.messages_quota) * 100
                    else:
                        continue
                    
                    # Verificar se precisa enviar notificação
                    should_notify = False
                    notification_type = None
                    
                    if usage_percent >= 100 and not subscription.notified_100:
                        should_notify = True
                        notification_type = '100'
                        subscription.notified_100 = True
                        notifications_sent['warning_100'] += 1
                        
                    elif usage_percent >= 80 and not subscription.notified_80:
                        should_notify = True
                        notification_type = '80'
                        subscription.notified_80 = True
                        notifications_sent['warning_80'] += 1
                    
                    if should_notify:
                        # Buscar dados do usuário
                        user = db.query(User).filter(User.id == subscription.user_id).first()
                        if user:
                            # Enviar email de notificação
                            success = self.email_service.send_usage_warning_email(
                                user_email=user.email,
                                user_name=user.name,
                                usage_percent=usage_percent,
                                messages_used=subscription.messages_used,
                                messages_quota=subscription.messages_quota,
                                plan=subscription.plan
                            )
                            
                            if success:
                                logger.info(f"Notificação de {notification_type}% enviada para {user.email}")
                            else:
                                logger.error(f"Falha ao enviar notificação para {user.email}")
                                notifications_sent['errors'] += 1
                        
                        # Salvar alterações na subscription
                        db.commit()
                        
                except Exception as e:
                    logger.error(f"Erro ao processar subscription {subscription.id}: {e}")
                    notifications_sent['errors'] += 1
                    db.rollback()
                    
        except Exception as e:
            logger.error(f"Erro geral no serviço de notificações: {e}")
            notifications_sent['errors'] += 1
        
        return notifications_sent
    
    def reset_monthly_notifications(self, db: Session) -> int:
        """
        Reseta as flags de notificação no início de cada mês
        """
        try:
            # Resetar flags de notificação para todas as subscriptions
            updated = db.query(Subscription).update({
                'notified_80': False,
                'notified_100': False
            })
            
            db.commit()
            logger.info(f"Flags de notificação resetadas para {updated} subscriptions")
            return updated
            
        except Exception as e:
            logger.error(f"Erro ao resetar flags de notificação: {e}")
            db.rollback()
            return 0
    
    def send_welcome_notification(self, user: User) -> bool:
        """
        Envia email de boas-vindas para novo usuário
        """
        try:
            return self.email_service.send_welcome_email(
                user_email=user.email,
                user_name=user.name
            )
        except Exception as e:
            logger.error(f"Erro ao enviar email de boas-vindas para {user.email}: {e}")
            return False
    
    def increment_message_usage(self, user_id: int, db: Session) -> dict:
        """
        Incrementa o uso de mensagens e verifica se precisa notificar
        """
        try:
            subscription = db.query(Subscription).filter(
                and_(
                    Subscription.user_id == user_id,
                    Subscription.status == SubscriptionStatus.ACTIVE.value
                )
            ).first()
            
            if not subscription:
                return {'success': False, 'error': 'Subscription não encontrada'}
            
            # Incrementar uso
            subscription.messages_used += 1
            
            # Calcular novo percentual
            usage_percent = (subscription.messages_used / subscription.messages_quota) * 100 if subscription.messages_quota > 0 else 0
            
            # Verificar se atingiu limites de notificação
            notification_sent = False
            if usage_percent >= 100 and not subscription.notified_100:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    self.email_service.send_usage_warning_email(
                        user_email=user.email,
                        user_name=user.name,
                        usage_percent=usage_percent,
                        messages_used=subscription.messages_used,
                        messages_quota=subscription.messages_quota,
                        plan=subscription.plan
                    )
                    subscription.notified_100 = True
                    notification_sent = True
                    
            elif usage_percent >= 80 and not subscription.notified_80:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    self.email_service.send_usage_warning_email(
                        user_email=user.email,
                        user_name=user.name,
                        usage_percent=usage_percent,
                        messages_used=subscription.messages_used,
                        messages_quota=subscription.messages_quota,
                        plan=subscription.plan
                    )
                    subscription.notified_80 = True
                    notification_sent = True
            
            db.commit()
            
            return {
                'success': True,
                'messages_used': subscription.messages_used,
                'messages_quota': subscription.messages_quota,
                'usage_percent': usage_percent,
                'notification_sent': notification_sent,
                'within_limit': subscription.messages_used < subscription.messages_quota
            }
            
        except Exception as e:
            logger.error(f"Erro ao incrementar uso de mensagens para usuário {user_id}: {e}")
            db.rollback()
            return {'success': False, 'error': str(e)}

# Instância global do serviço
notification_service = NotificationService()