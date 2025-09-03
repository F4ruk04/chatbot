"""
Serviço Stripe para processamento de pagamentos
Integração completa com Stripe API
"""

import stripe
import os
from typing import Dict, Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class StripeService:
    def __init__(self):
        from app.config.stripe_config import stripe_config

        # Configurar Stripe
        stripe.api_key = stripe_config.SECRET_KEY or "sk_test_..."

        # Configurações da configuração centralizada
        self.currency = stripe_config.CURRENCY
        self.success_url = stripe_config.SUCCESS_URL
        self.cancel_url = stripe_config.CANCEL_URL
        self.webhook_secret = stripe_config.WEBHOOK_SECRET
        self.plan_prices = stripe_config.PLAN_PRICES
        self.plan_mapping = stripe_config.PLAN_MAPPING

    def create_checkout_session(
        self,
        user_id: int,
        plan_name: str,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Criar sessão de checkout Stripe

        Args:
            user_id: ID do usuário
            plan_name: Nome do plano
            success_url: URL de sucesso (opcional)
            cancel_url: URL de cancelamento (opcional)

        Returns:
            Dicionário com dados da sessão ou None se erro
        """

        # Preços em centavos (EUR)
        plan_prices = {
            'Básico': 0,        # Gratuito
            'Profissional': 2499,  # 24.99€
            'Business': 6999       # 69.99€
        }

        plan_names = {
            'Básico': 'Plano Básico - SaaS Chatbot',
            'Profissional': 'Plano Profissional - SaaS Chatbot',
            'Business': 'Plano Business - SaaS Chatbot'
        }

        if plan_name not in plan_prices:
            logger.error(f"Plano inválido: {plan_name}")
            return None

        try:
            # Usar URLs customizadas ou padrão
            final_success_url = success_url or self.success_url
            final_cancel_url = cancel_url or self.cancel_url

            # Adicionar parâmetros de sessão
            final_success_url += "?session_id={CHECKOUT_SESSION_ID}"
            final_success_url += f"&user_id={user_id}&plan_name={plan_name}"

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': self.currency,
                        'product_data': {
                            'name': plan_names[plan_name],
                            'description': f'Acesso completo ao {plan_names[plan_name]}',
                        },
                        'unit_amount': plan_prices[plan_name],
                    },
                    'quantity': 1,
                }],
                mode='payment',  # ou 'subscription' para recorrentes
                success_url=final_success_url,
                cancel_url=final_cancel_url,
                metadata={
                    'user_id': str(user_id),
                    'plan_name': plan_name
                }
            )

            logger.info(f"Sessão Stripe criada: {session.id} para usuário {user_id}")

            return {
                'session_id': session.id,
                'checkout_url': session.url,
                'amount': plan_prices[plan_name],
                'currency': self.currency
            }

        except stripe.error.StripeError as e:
            logger.error(f"Erro Stripe ao criar sessão: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro geral ao criar sessão Stripe: {e}")
            return None

    def verify_payment(self, session_id: str) -> Optional[Dict]:
        """
        Verificar status do pagamento

        Args:
            session_id: ID da sessão Stripe

        Returns:
            Dicionário com dados do pagamento ou None se erro
        """

        try:
            session = stripe.checkout.Session.retrieve(session_id)

            return {
                'status': session.payment_status,
                'amount': session.amount_total / 100,  # converter de centavos
                'currency': session.currency,
                'metadata': session.metadata,
                'customer_email': session.customer_details.email if session.customer_details else None,
                'payment_intent': session.payment_intent
            }

        except stripe.error.StripeError as e:
            logger.error(f"Erro Stripe ao verificar pagamento: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro geral ao verificar pagamento: {e}")
            return None

    def process_webhook(self, payload: bytes, signature: str) -> Optional[Dict]:
        """
        Processar webhook do Stripe

        Args:
            payload: Payload do webhook
            signature: Assinatura do webhook

        Returns:
            Dados do evento processado ou None se erro
        """

        try:
            # Verificar webhook
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )

            logger.info(f"Webhook Stripe recebido: {event['type']}")

            # Processar tipos de evento
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                return self._handle_checkout_completed(session)

            elif event['type'] == 'payment_intent.succeeded':
                payment_intent = event['data']['object']
                return self._handle_payment_succeeded(payment_intent)

            elif event['type'] == 'payment_intent.payment_failed':
                payment_intent = event['data']['object']
                return self._handle_payment_failed(payment_intent)

            return {'type': event['type'], 'processed': True}

        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Assinatura webhook inválida: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro ao processar webhook: {e}")
            return None

    def _handle_checkout_completed(self, session) -> Dict:
        """Processar checkout completado"""
        return {
            'type': 'checkout.session.completed',
            'session_id': session.id,
            'user_id': session.metadata.get('user_id'),
            'plan_name': session.metadata.get('plan_name'),
            'amount': session.amount_total / 100,
            'currency': session.currency,
            'status': 'completed'
        }

    def _handle_payment_succeeded(self, payment_intent) -> Dict:
        """Processar pagamento bem-sucedido"""
        return {
            'type': 'payment_intent.succeeded',
            'payment_intent_id': payment_intent.id,
            'amount': payment_intent.amount / 100,
            'currency': payment_intent.currency,
            'status': 'succeeded'
        }

    def _handle_payment_failed(self, payment_intent) -> Dict:
        """Processar pagamento falhado"""
        return {
            'type': 'payment_intent.payment_failed',
            'payment_intent_id': payment_intent.id,
            'amount': payment_intent.amount / 100,
            'currency': payment_intent.currency,
            'status': 'failed',
            'failure_code': payment_intent.last_payment_error.code if payment_intent.last_payment_error else None
        }

    def create_refund(self, payment_intent_id: str, amount: Optional[int] = None) -> Optional[Dict]:
        """
        Criar reembolso

        Args:
            payment_intent_id: ID do PaymentIntent
            amount: Valor para reembolsar (opcional, reembolsa total se não especificado)

        Returns:
            Dados do reembolso ou None se erro
        """

        try:
            refund = stripe.Refund.create(
                payment_intent=payment_intent_id,
                amount=amount  # em centavos
            )

            logger.info(f"Reembolso criado: {refund.id} para {payment_intent_id}")

            return {
                'refund_id': refund.id,
                'amount': refund.amount / 100,
                'currency': refund.currency,
                'status': refund.status
            }

        except stripe.error.StripeError as e:
            logger.error(f"Erro Stripe ao criar reembolso: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro geral ao criar reembolso: {e}")
            return None

    def get_payment_methods(self, customer_id: str) -> List[Dict]:
        """
        Obter métodos de pagamento do cliente

        Args:
            customer_id: ID do cliente Stripe

        Returns:
            Lista de métodos de pagamento
        """

        try:
            payment_methods = stripe.PaymentMethod.list(
                customer=customer_id,
                type='card'
            )

            return [{
                'id': pm.id,
                'type': pm.type,
                'card': {
                    'brand': pm.card.brand,
                    'last4': pm.card.last4,
                    'exp_month': pm.card.exp_month,
                    'exp_year': pm.card.exp_year
                } if pm.card else None
            } for pm in payment_methods.data]

        except stripe.error.StripeError as e:
            logger.error(f"Erro Stripe ao obter métodos de pagamento: {e}")
            return []
        except Exception as e:
            logger.error(f"Erro geral ao obter métodos de pagamento: {e}")
            return []


# Instância global
stripe_service = StripeService()