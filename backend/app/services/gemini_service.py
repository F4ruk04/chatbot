"""
Serviço de Integração com Gemini API
Responsável por comunicar com a API do Google Gemini
"""

import google.generativeai as genai
from app.config import settings
from typing import Optional


class GeminiService:
    """
    Serviço para integração com a API do Gemini
    """
    
    def __init__(self):
        """
        Inicializa o serviço configurando a API key
        """
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    def generate_response(self, message: str, context: Optional[str] = None, company_name: Optional[str] = None, conversation_history: Optional[str] = None) -> str:
        """
        Gera uma resposta usando o Gemini baseada na mensagem e contexto
        
        Args:
            message: Mensagem do cliente
            context: Contexto da empresa (opcional)
            company_name: Nome da empresa (opcional)
            conversation_history: Histórico da conversa (opcional)
            
        Returns:
            Resposta gerada pelo Gemini
        """
        try:
            # Construir o prompt com contexto se fornecido
            if context:
                company_info = f"da {company_name}" if company_name else ""
                history_context = f"\n\nHistórico da conversa:\n{conversation_history}" if conversation_history else ""
                
                prompt = f"""
Você é um assistente virtual {company_info} e deve conversar de forma natural e casual com o cliente.

CONTEXTO DA EMPRESA: {context}

REGRAS DE COMPORTAMENTO:
- Converse de forma casual e natural, como se fosse uma pessoa real
- NÃO repita saudações em todas as mensagens (como "Olá", "Prezado cliente")
- Analise o contexto das mensagens anteriores antes de responder
- Evite respostas robóticas e estruturadas demais
- Use linguagem simples e direta, mas educada
- Mostre empatia e tente entender a intenção do usuário
- Não use termos técnicos desnecessários
- Se não tiver certeza, seja honesto e sugira próximos passos
- Mantenha coerência sem pedir informações já fornecidas{history_context}

MENSAGEM DO CLIENTE: {message}

Responda de forma natural e útil:
                """
            else:
                prompt = f"""
Você é um assistente virtual e deve conversar de forma natural e casual.

REGRAS:
- Seja natural e casual, como uma pessoa real
- Não use saudações repetitivas
- Linguagem simples e direta
- Mostre empatia e compreensão

MENSAGEM: {message}

Responda naturalmente:
                """
            
            # Gerar resposta
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            print(f"Erro ao gerar resposta com Gemini: {e}")
            return "Desculpe, ocorreu um erro ao processar a sua mensagem. Tente novamente mais tarde."


# Instância global do serviço
gemini_service = GeminiService()

