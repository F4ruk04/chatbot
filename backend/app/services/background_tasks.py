"""
Serviço de Tarefas em Background
Executa tarefas periódicas como verificação de uso e envio de notificações
"""

import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..database import get_db
from .notification_service import notification_service

logger = logging.getLogger(__name__)

class BackgroundTaskService:
    def __init__(self):
        self.notification_service = notification_service
        self.running = False
    
    async def start_periodic_tasks(self):
        """Inicia as tarefas periódicas"""
        self.running = True
        logger.info("Iniciando tarefas em background...")
        
        # Executar tarefas em paralelo
        await asyncio.gather(
            self.usage_monitoring_task(),
            self.monthly_reset_task(),
            return_exceptions=True
        )
    
    async def stop_periodic_tasks(self):
        """Para as tarefas periódicas"""
        self.running = False
        logger.info("Parando tarefas em background...")
    
    async def usage_monitoring_task(self):
        """Tarefa que monitora uso e envia notificações a cada hora"""
        while self.running:
            try:
                logger.info("Executando verificação de uso...")
                
                # Obter sessão do banco
                db = next(get_db())
                
                # Verificar e enviar notificações
                result = self.notification_service.check_and_send_usage_notifications(db)
                
                logger.info(f"Notificações enviadas: {result}")
                
                db.close()
                
                # Aguardar 1 hora antes da próxima verificação
                await asyncio.sleep(3600)  # 3600 segundos = 1 hora
                
            except Exception as e:
                logger.error(f"Erro na tarefa de monitoramento de uso: {e}")
                # Aguardar 5 minutos antes de tentar novamente em caso de erro
                await asyncio.sleep(300)
    
    async def monthly_reset_task(self):
        """Tarefa que reseta flags de notificação mensalmente"""
        while self.running:
            try:
                now = datetime.utcnow()
                
                # Verificar se é o primeiro dia do mês
                if now.day == 1 and now.hour == 0:
                    logger.info("Executando reset mensal de notificações...")
                    
                    # Obter sessão do banco
                    db = next(get_db())
                    
                    # Resetar flags de notificação
                    reset_count = self.notification_service.reset_monthly_notifications(db)
                    
                    logger.info(f"Reset mensal concluído: {reset_count} subscriptions atualizadas")
                    
                    db.close()
                
                # Aguardar 1 hora antes da próxima verificação
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f"Erro na tarefa de reset mensal: {e}")
                # Aguardar 5 minutos antes de tentar novamente em caso de erro
                await asyncio.sleep(300)
    
    async def send_welcome_email_task(self, user_email: str, user_name: str):
        """Tarefa para enviar email de boas-vindas de forma assíncrona"""
        try:
            success = self.notification_service.send_welcome_notification({
                'email': user_email,
                'name': user_name
            })
            
            if success:
                logger.info(f"Email de boas-vindas enviado para {user_email}")
            else:
                logger.error(f"Falha ao enviar email de boas-vindas para {user_email}")
                
        except Exception as e:
            logger.error(f"Erro ao enviar email de boas-vindas para {user_email}: {e}")

# Instância global do serviço
background_service = BackgroundTaskService()

# Funções auxiliares para integração com FastAPI
async def start_background_tasks():
    """Função para iniciar tarefas em background no startup da aplicação"""
    asyncio.create_task(background_service.start_periodic_tasks())

async def stop_background_tasks():
    """Função para parar tarefas em background no shutdown da aplicação"""
    await background_service.stop_periodic_tasks()

def schedule_welcome_email(user_email: str, user_name: str):
    """Agenda envio de email de boas-vindas"""
    asyncio.create_task(
        background_service.send_welcome_email_task(user_email, user_name)
    )