"""
Serviço de Email
Gerencia envio de emails para notificações do sistema
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_username)
        self.from_name = os.getenv('FROM_NAME', 'Chatbot SaaS')
        
    def _create_connection(self):
        """Cria conexão SMTP"""
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            if self.smtp_username and self.smtp_password:
                server.login(self.smtp_username, self.smtp_password)
            return server
        except Exception as e:
            logger.error(f"Erro ao conectar ao servidor SMTP: {e}")
            return None
    
    def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str, 
        text_content: Optional[str] = None
    ) -> bool:
        """Envia email"""
        if not self.smtp_username or not self.smtp_password:
            logger.warning("Credenciais SMTP não configuradas. Email não enviado.")
            return False
            
        try:
            server = self._create_connection()
            if not server:
                return False
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Adicionar conteúdo texto se fornecido
            if text_content:
                text_part = MIMEText(text_content, 'plain', 'utf-8')
                msg.attach(text_part)
            
            # Adicionar conteúdo HTML
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
            
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email enviado com sucesso para {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar email para {to_email}: {e}")
            return False
    
    def send_usage_warning_email(
        self, 
        user_email: str, 
        user_name: str, 
        usage_percent: float,
        messages_used: int,
        messages_quota: int,
        plan: str
    ) -> bool:
        """Envia email de aviso de uso de mensagens"""
        
        if usage_percent >= 100:
            subject = "🚨 Limite de mensagens atingido - Chatbot SaaS"
            warning_type = "atingido"
            warning_color = "#dc2626"  # red-600
        elif usage_percent >= 80:
            subject = "⚠️ Limite de mensagens próximo - Chatbot SaaS"
            warning_type = "próximo"
            warning_color = "#d97706"  # amber-600
        else:
            return True  # Não enviar se menor que 80%
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Chatbot SaaS</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid {warning_color};">
                <h2 style="color: {warning_color}; margin-top: 0;">Limite de mensagens {warning_type}!</h2>
                
                <p>Olá <strong>{user_name}</strong>,</p>
                
                <p>Você está usando <strong>{usage_percent:.1f}%</strong> do seu limite mensal de mensagens.</p>
                
                <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span>Uso atual:</span>
                        <strong>{messages_used:,} / {messages_quota:,} mensagens</strong>
                    </div>
                    <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: {warning_color}; height: 100%; width: {min(usage_percent, 100)}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <p>Plano atual: <strong>{plan.title()}</strong></p>
                
                {"<p style='color: #dc2626;'><strong>⚠️ Seu limite foi atingido!</strong> Para continuar enviando mensagens, considere fazer upgrade do seu plano.</p>" if usage_percent >= 100 else "<p>Para evitar interrupções no serviço, considere fazer upgrade do seu plano.</p>"}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://seu-dominio.com/billing" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: bold;
                          display: inline-block;">
                    Fazer Upgrade do Plano
                </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>Este é um email automático. Se você tiver dúvidas, entre em contato conosco.</p>
                <p>© 2024 Chatbot SaaS. Todos os direitos reservados.</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Chatbot SaaS - Limite de mensagens {warning_type}!
        
        Olá {user_name},
        
        Você está usando {usage_percent:.1f}% do seu limite mensal de mensagens.
        
        Uso atual: {messages_used:,} / {messages_quota:,} mensagens
        Plano atual: {plan.title()}
        
        {"⚠️ Seu limite foi atingido! Para continuar enviando mensagens, considere fazer upgrade do seu plano." if usage_percent >= 100 else "Para evitar interrupções no serviço, considere fazer upgrade do seu plano."}
        
        Faça upgrade em: https://seu-dominio.com/billing
        
        Este é um email automático. Se você tiver dúvidas, entre em contato conosco.
        """
        
        return self.send_email(user_email, subject, html_content, text_content)
    
    def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """Envia email de boas-vindas"""
        subject = "🎉 Bem-vindo ao Chatbot SaaS!"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Bem-vindo ao Chatbot SaaS!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px;">
                <p>Olá <strong>{user_name}</strong>,</p>
                
                <p>Seja bem-vindo ao <strong>Chatbot SaaS</strong>! Estamos muito felizes em tê-lo conosco.</p>
                
                <p>Você começou com o <strong>Plano Gratuito</strong> que inclui:</p>
                <ul>
                    <li>✅ 150 mensagens por mês</li>
                    <li>✅ 1 Conexão WhatsApp</li>
                    <li>✅ Dashboard básico</li>
                    <li>✅ Suporte por email</li>
                </ul>
                
                <p>Para começar:</p>
                <ol>
                    <li>Acesse seu dashboard</li>
                    <li>Adicione sua primeira empresa</li>
                    <li>Configure seu chatbot</li>
                    <li>Comece a automatizar seu atendimento!</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://seu-dominio.com/dashboard" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: bold;
                          display: inline-block;">
                    Acessar Dashboard
                </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>Se você tiver dúvidas, estamos aqui para ajudar!</p>
                <p>© 2024 Chatbot SaaS. Todos os direitos reservados.</p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(user_email, subject, html_content)

# Instância global do serviço
email_service = EmailService()