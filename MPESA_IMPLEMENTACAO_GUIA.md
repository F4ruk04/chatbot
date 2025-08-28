# 💰 **GUIA COMPLETO: M-PESA PARA MOÇAMBIQUE**

## 🎯 **RESUMO EXECUTIVO**

### **✅ POR QUE M-PESA É IDEAL PARA MOÇAMBIQUE:**

1. **🏠 Conta nativa em MZN** - Sem conversões complicadas
2. **⚡ Transferências instantâneas** - Dinheiro disponível imediatamente
3. **💰 Taxas baixas** - 1-2% vs 2.9%+ do PayPal
4. **📱 Popular** - Milhões de usuários em Moçambique
5. **🔧 API moderna** - Fácil para desenvolvedores

### **🎯 ESTRATÉGIA RECOMENDADA:**
**M-Pesa como solução primária + PayPal/Stripe para internacionais**

---

## 📋 **ROADMAP DE IMPLEMENTAÇÃO M-PESA**

### **FASE 1: PREPARAÇÃO (1 semana)**
```python
✅ Criar conta comercial M-Pesa
✅ Configurar ambiente de desenvolvimento
✅ Obter credenciais da API
✅ Setup ambiente de teste
```

### **FASE 2: DESENVOLVIMENTO (2 semanas)**
```python
✅ Implementar API de pagamentos
✅ Sistema de webhooks
✅ Interface de checkout
✅ Testes de integração
```

### **FASE 3: PRODUÇÃO (1 semana)**
```python
✅ Configuração produção
✅ Testes end-to-end
✅ Go-live
✅ Monitoramento
```

---

## 🔧 **CONFIGURAÇÃO TÉCNICA M-PESA**

### **1. CRIAR CONTA COMERCIAL:**

#### **Requisitos:**
```python
✅ Empresa registada em Moçambique
✅ NUIT (Número Único de Identificação Tributária)
✅ Conta bancária comercial
✅ Documentos da empresa
✅ Responsável técnico identificado
```

#### **Processo:**
```bash
1. Acesse: https://developer.mpesa.vm.co.mz/
2. Clique "Registar" (para empresas)
3. Preencha dados da empresa
4. Faça upload de documentos
5. Aguarde aprovação (2-5 dias úteis)
```

### **2. CONFIGURAR AMBIENTE DESENVOLVIMENTO:**

#### **Credenciais necessárias:**
```python
# Sandbox (teste):
MPESA_CONSUMER_KEY_SANDBOX = "your_sandbox_consumer_key"
MPESA_CONSUMER_SECRET_SANDBOX = "your_sandbox_consumer_secret"
MPESA_SHORTCODE_SANDBOX = "174379"  # Padrão sandbox
MPESA_PASSKEY_SANDBOX = "your_passkey"

# Produção:
MPESA_CONSUMER_KEY_LIVE = "your_live_consumer_key"
MPESA_CONSUMER_SECRET_LIVE = "your_live_consumer_secret"
MPESA_SHORTCODE_LIVE = "your_assigned_shortcode"
MPESA_PASSKEY_LIVE = "your_live_passkey"
```

### **3. IMPLEMENTAÇÃO TÉCNICA:**

#### **Instalar SDK:**
```bash
pip install python-mpesa
# ou
pip install django-mpesa  # se usar Django
```

#### **Configuração básica:**
```python
from mpesa.api import MpesaAPI

# Configurar M-Pesa
mpesa = MpesaAPI(
    consumer_key="your_consumer_key",
    consumer_secret="your_consumer_secret",
    environment="sandbox"  # ou "production"
)
```

#### **Fluxo de pagamento típico:**
```python
# 1. STK Push (empurrar para telefone do usuário)
response = mpesa.stk_push(
    phone_number="258840000000",  # Número do cliente
    amount=2499,  # Valor em MZN (sem centavos)
    account_reference="PLANO_PROFISSIONAL",
    transaction_desc="Assinatura SaaS Chatbot",
    callback_url="https://seusite.com/mpesa/callback"
)

# 2. Verificar status do pagamento
payment_status = mpesa.query_transaction(
    checkout_request_id=response['CheckoutRequestID']
)

# 3. Processar callback
@app.post("/mpesa/callback")
async def mpesa_callback(data: dict):
    if data['Body']['stkCallback']['ResultCode'] == 0:
        # Pagamento bem-sucedido
        transaction_id = data['Body']['stkCallback']['CheckoutRequestID']
        amount = data['Body']['stkCallback']['CallbackMetadata']['Amount']
        phone = data['Body']['stkCallback']['CallbackMetadata']['PhoneNumber']

        # Atualizar assinatura do usuário
        await update_user_subscription(phone, amount, transaction_id)
```

---

## 💰 **CUSTOS E TAXAS M-PESA**

### **PARA RECEBER PAGAMENTOS:**

#### **Taxas de Transação:**
```python
# C2B (Customer to Business):
- Taxa: 1% do valor (mínimo 1 MZN, máximo 200 MZN)
- Exemplo: Pagamento de 2,499 MZN
  - Taxa M-Pesa: 25 MZN (1%)
  - Você recebe: 2,474 MZN
  - Taxa efetiva: 1%

# B2C (Business to Customer - saques):
- Taxa: 0.5% do valor (mínimo 1 MZN, máximo 150 MZN)
- Exemplo: Sacar 10,000 MZN
  - Taxa: 50 MZN
  - Valor final: 9,950 MZN
```

#### **Comparação com PayPal:**
```python
# Mesmo pagamento de 2,499 MZN:

# ❌ PayPal:
- Taxa: 2.9% + 0.49 USD = ~150 MZN
- Conversão: +2.5% = ~60 MZN
- Total perdido: ~210 MZN
- Você recebe: ~2,289 MZN

# ✅ M-Pesa:
- Taxa: 1% = 25 MZN
- Total perdido: 25 MZN
- Você recebe: 2,474 MZN

# 📈 ECONOMIA: 185 MZN por transação!
```

---

## 🔄 **INTEGRAÇÃO COMPLETA NO SEU SISTEMA**

### **1. MODEL DE PAGAMENTO:**

#### **Criar tabela de pagamentos:**
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount INTEGER NOT NULL, -- em MZN (sem centavos)
    currency VARCHAR(3) DEFAULT 'MZN',
    payment_method VARCHAR(20) DEFAULT 'mpesa',
    transaction_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    plan_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **2. API DE PAGAMENTOS:**

#### **Backend (FastAPI):**
```python
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.models.user import User
from app.services.mpesa_service import mpesa_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/initiate")
async def initiate_payment(
    plan_name: str,
    phone_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Iniciar pagamento M-Pesa"""

    # Obter valor do plano
    plan_amounts = {
        "Básico": 0,  # Gratuito
        "Profissional": 2499,
        "Business": 6999
    }

    if plan_name not in plan_amounts:
        raise HTTPException(status_code=400, detail="Plano inválido")

    amount = plan_amounts[plan_name]
    if amount == 0:
        # Plano gratuito - ativar diretamente
        return {"status": "success", "message": "Plano gratuito ativado"}

    # Iniciar STK Push
    response = mpesa_service.initiate_payment(
        phone_number=phone_number,
        amount=amount,
        account_reference=f"USER_{current_user.id}",
        transaction_desc=f"Plano {plan_name} - SaaS Chatbot"
    )

    # Salvar tentativa de pagamento
    payment = Payment(
        user_id=current_user.id,
        amount=amount,
        plan_name=plan_name,
        transaction_id=response.get('CheckoutRequestID'),
        status='pending'
    )
    db.add(payment)
    db.commit()

    return {
        "status": "pending",
        "checkout_request_id": response.get('CheckoutRequestID'),
        "message": "Pagamento iniciado. Confirme no seu telefone."
    }

@router.post("/callback")
async def mpesa_callback(data: dict, db: Session = Depends(get_db)):
    """Processar callback do M-Pesa"""

    result_code = data['Body']['stkCallback']['ResultCode']

    if result_code == 0:
        # Pagamento bem-sucedido
        checkout_id = data['Body']['stkCallback']['CheckoutRequestID']
        metadata = data['Body']['stkCallback']['CallbackMetadata']['Item']

        # Extrair dados
        amount = next(item['Value'] for item in metadata if item['Name'] == 'Amount')
        phone = next(item['Value'] for item in metadata if item['Name'] == 'PhoneNumber')

        # Atualizar pagamento
        payment = db.query(Payment).filter_by(transaction_id=checkout_id).first()
        if payment:
            payment.status = 'completed'
            db.commit()

            # Ativar plano do usuário
            await activate_user_plan(payment.user_id, payment.plan_name, db)

        return {"status": "success"}

    else:
        # Pagamento falhou
        checkout_id = data['Body']['stkCallback']['CheckoutRequestID']
        payment = db.query(Payment).filter_by(transaction_id=checkout_id).first()
        if payment:
            payment.status = 'failed'
            db.commit()

        return {"status": "failed", "result_code": result_code}
```

### **3. SERVIÇO M-PESA:**

#### **Criar serviço dedicado:**
```python
# app/services/mpesa_service.py
import requests
from datetime import datetime
import base64
import os

class MpesaService:
    def __init__(self):
        self.consumer_key = os.getenv("MPESA_CONSUMER_KEY")
        self.consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
        self.shortcode = os.getenv("MPESA_SHORTCODE")
        self.passkey = os.getenv("MPESA_PASSKEY")
        self.base_url = "https://sandbox.safaricom.co.ke"  # ou produção

    def get_access_token(self):
        """Obter access token"""
        auth = base64.b64encode(f"{self.consumer_key}:{self.consumer_secret}".encode()).decode()

        headers = {
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/json"
        }

        response = requests.get(f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials", headers=headers)
        return response.json()['access_token']

    def initiate_payment(self, phone_number: str, amount: int, account_reference: str, transaction_desc: str):
        """Iniciar STK Push"""

        access_token = self.get_access_token()
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(f"{self.shortcode}{self.passkey}{timestamp}".encode()).decode()

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": self.shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": os.getenv("MPESA_CALLBACK_URL"),
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        response = requests.post(f"{self.base_url}/mpesa/stkpush/v1/processrequest", json=payload, headers=headers)
        return response.json()

# Instância global
mpesa_service = MpesaService()
```

### **4. FRONTEND INTEGRATION:**

#### **Página de checkout:**
```typescript
// app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_name: plan,
          phone_number: phoneNumber
        })
      });

      const data = await response.json();

      if (data.status === 'pending') {
        // Mostrar mensagem para usuário confirmar no telefone
        alert('Pagamento iniciado! Confirme o pagamento no seu telefone M-Pesa.');

        // Polling para verificar status
        checkPaymentStatus(data.checkout_request_id);
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (checkoutId: string) => {
    // Verificar status a cada 5 segundos
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/status/${checkoutId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          clearInterval(interval);
          router.push('/dashboard?upgrade=success');
        } else if (data.status === 'failed') {
          clearInterval(interval);
          alert('Pagamento falhou. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 5000);

    // Parar após 5 minutos
    setTimeout(() => clearInterval(interval), 300000);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout - Plano {plan}</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Número do telefone M-Pesa
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="84 000 0000"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !phoneNumber}
          className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Pagar com M-Pesa'}
        </button>
      </div>
    </div>
  );
}
```

---

## 🎯 **ESTRATÉGIA HÍBRIDA RECOMENDADA**

### **PARA SEU NEGÓCIO:**

#### **1. M-PESA COMO PRIMÁRIA:**
```python
✅ 90% dos pagamentos em Moçambique
✅ Taxas baixas (1%)
✅ Experiência nativa
✅ Confiança dos usuários
```

#### **2. PAYPAL/STRIPE PARA INTERNACIONAIS:**
```python
✅ Clientes fora de Moçambique
✅ Empresas internacionais
✅ Freelancers/consultores
✅ Backup se M-Pesa falhar
```

### **IMPLEMENTAÇÃO HÍBRIDA:**

#### **Backend:**
```python
# Escolher método baseado na localização/moeda
def choose_payment_method(user_country: str, currency: str) -> str:
    if user_country == "MZ" and currency == "MZN":
        return "mpesa"
    elif user_country in ["US", "EU"] or currency in ["USD", "EUR"]:
        return "paypal"
    else:
        return "stripe"  # Mais flexível
```

#### **Frontend:**
```typescript
// Detectar localização e sugerir método
const PaymentMethodSelector = ({ plan, userLocation }) => {
  const [paymentMethod, setPaymentMethod] = useState('mpesa');

  useEffect(() => {
    if (userLocation === 'MZ') {
      setPaymentMethod('mpesa');
    } else {
      setPaymentMethod('paypal');
    }
  }, [userLocation]);

  return (
    <div>
      {userLocation === 'MZ' && (
        <button onClick={() => setPaymentMethod('mpesa')}>
          🟢 M-Pesa (Recomendado)
        </button>
      )}

      <button onClick={() => setPaymentMethod('paypal')}>
        🔵 PayPal
      </button>
    </div>
  );
};
```

---

## 🚀 **PRÓXIMOS PASSOS**

### **SEMANA 1: PREPARAÇÃO**
```python
✅ Criar conta comercial M-Pesa
✅ Configurar ambiente sandbox
✅ Obter credenciais da API
✅ Documentar processo completo
```

### **SEMANA 2-3: DESENVOLVIMENTO**
```python
✅ Implementar serviço M-Pesa
✅ Criar endpoints de pagamento
✅ Interface de checkout
✅ Sistema de callbacks
```

### **SEMANA 4: TESTES E PRODUÇÃO**
```python
✅ Testes end-to-end
✅ Configuração produção
✅ Go-live
✅ Monitoramento inicial
```

---

## 💬 **PERGUNTA DIRETA:**

**Quer que eu implemente a integração completa com M-Pesa agora?**

**Ou prefere que eu mostre primeiro como configurar a conta comercial M-Pesa?**

**Também posso implementar a estratégia híbrida (M-Pesa + PayPal) se preferir! 🚀**

**Qual caminho você escolhe?**