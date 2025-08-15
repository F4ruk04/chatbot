from httpx import AsyncClient
from typing import Optional, Dict, Any
from datetime import datetime
import json

class FlutterwaveService:
    def __init__(self, secret_key: str, public_key: str, sandbox: bool = False):
        self.secret_key = secret_key
        self.public_key = public_key
        self.base_url = "https://api.flutterwave.com/v3"
        self.headers = {
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json"
        }

    async def create_payment_link(
        self,
        amount: float,
        currency: str,
        customer_email: str,
        customer_name: str,
        payment_options: str,  # "mpesa,card"
        redirect_url: str,
        tx_ref: str,
        meta: Optional[Dict[str, Any]] = None
    ):
        """
        Cria um link de pagamento no Flutterwave
        """
        url = f"{self.base_url}/payments"
        
        payload = {
            "tx_ref": tx_ref,
            "amount": amount,
            "currency": currency,
            "redirect_url": redirect_url,
            "payment_options": payment_options,
            "customer": {
                "email": customer_email,
                "name": customer_name
            },
            "customizations": {
                "title": "Chatbot SaaS",
                "description": "Pagamento de assinatura",
                "logo": "https://seu-site.com/logo.png"
            },
            "meta": meta or {}
        }

        async with AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            return response.json()

    async def verify_transaction(self, transaction_id: str):
        """
        Verifica o status de uma transação
        """
        url = f"{self.base_url}/transactions/{transaction_id}/verify"
        
        async with AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            return response.json()

    async def verify_webhook_signature(self, signature: str, payload: str) -> bool:
        """
        Verifica a assinatura do webhook
        """
        import hmac
        import hashlib
        
        expected = hmac.new(
            self.secret_key.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected)
