import httpx
from typing import Optional, Dict, Any
import json
from datetime import datetime

class PagoluService:
    def __init__(self, api_key: str, sandbox: bool = False):
        self.api_key = api_key
        self.base_url = "https://sandbox.pagolu.co.mz" if sandbox else "https://api.pagolu.co.mz"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def create_payment(
        self,
        amount: float,
        currency: str,
        payment_method: str,
        customer_email: str,
        reference: str,
        return_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Cria um novo pagamento no PagoLu
        """
        url = f"{self.base_url}/v1/payments"
        
        payload = {
            "amount": int(amount * 100),  # Converter para centavos
            "currency": currency,
            "payment_method": payment_method,
            "customer_email": customer_email,
            "reference": reference,
            "return_url": return_url,
            "metadata": metadata or {}
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            return response.json()

    async def get_payment_status(self, payment_id: str):
        """
        Verifica o status de um pagamento
        """
        url = f"{self.base_url}/v1/payments/{payment_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            return response.json()

    async def list_payment_methods(self):
        """
        Lista os métodos de pagamento disponíveis
        """
        url = f"{self.base_url}/v1/payment-methods"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            return response.json()
