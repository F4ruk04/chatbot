# 💳 **GUIA COMPLETO: STRIPE PARA MOÇAMBIQUE**

## 🎯 **RESUMO EXECUTIVO**

### **✅ STRIPE FUNCIONA EM MOÇAMBIQUE?**
**SIM!** Stripe tem suporte internacional e pode ser usado em Moçambique, mas com algumas estratégias específicas.

### **🎯 ESTRATÉGIAS PARA MOÇAMBIQUE:**

#### **1. CONTA INTERNACIONAL (Recomendada)**
- ✅ Criar conta em país com suporte Stripe
- ✅ Receber em USD/EUR
- ✅ Converter para MZN localmente

#### **2. SOLUÇÕES LOCAIS**
- ✅ Cartões internacionais (Visa/Mastercard)
- ✅ TransferWise/Revolut para conversões
- ✅ Bancos locais com contas internacionais

---

## 📋 **ROADMAP DE IMPLEMENTAÇÃO STRIPE**

### **FASE 1: PREPARAÇÃO (1 semana)**
```python
✅ Criar conta Stripe internacional
✅ Configurar ambiente de desenvolvimento
✅ Obter chaves da API
✅ Setup webhooks
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

## 🔧 **CONFIGURAÇÃO TÉCNICA STRIPE**

### **1. CRIAR CONTA STRIPE INTERNACIONAL**

#### **Opções de País:**
```python
# 🥇 RECOMENDADO: Portugal (próximo, suporte em português)
✅ Idiomas: Português + Inglês
✅ Moeda: EUR (fácil conversão)
✅ Suporte: Europeu mas acessível
✅ Documentação: Completa

# 🥈 ALTERNATIVA: Estados Unidos
✅ Moeda: USD (mais estável)
✅ Suporte: Global
✅ Documentação: Extensa

# 🥉 OUTRAS: Reino Unido, Alemanha, França
✅ Moedas: GBP, EUR
✅ Suporte: Bom
✅ Processo: Similar
```

#### **Processo de Criação:**
```bash
1. Acesse: https://stripe.com
2. Clique "Start now" (ou país específico)
3. Selecione "Portugal" ou "United States"
4. Preencha dados pessoais/empresa
5. Verificação de identidade
6. Ativação da conta (2-5 dias)
```

#### **Documentos Necessários:**
```python
✅ Passaporte moçambicano válido
✅ Comprovante de endereço (conta luz/telefone)
✅ Documentos da empresa (se aplicável)
✅ NUIT (Número Único de Identificação Tributária)
✅ Conta bancária internacional (para saques)
```

### **2. CONFIGURAR AMBIENTE DESENVOLVIMENTO**

#### **Chaves da API:**
```python
# Teste (sandbox):
STRIPE_PUBLISHABLE_KEY_TEST = "pk_test_..."
STRIPE_SECRET_KEY_TEST = "sk_test_..."

# Produção:
STRIPE_PUBLISHABLE_KEY_LIVE = "pk_live_..."
STRIPE_SECRET_KEY_LIVE = "sk_live_..."

# Webhook endpoint:
STRIPE_WEBHOOK_SECRET = "whsec_..."
```

#### **Instalar SDK:**
```bash
pip install stripe
# ou
npm install stripe
```

### **3. IMPLEMENTAÇÃO TÉCNICA**

#### **Configuração Básica:**
```python
import stripe
from flask import Flask, request, jsonify  # ou FastAPI

app = Flask(__name__)

# Configurar Stripe
stripe.api_key = "sk_test_..."

# Para produção:
# stripe.api_key = "sk_live_..."
```

#### **Criar Sessão de Checkout:**
```python
@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        # Dados do plano
        plan_name = request.json.get('plan_name')
        plans = {
            'Básico': {'price': 0, 'name': 'Plano Básico'},
            'Profissional': {'price': 2499, 'name': 'Plano Profissional'},
            'Business': {'price': 6999, 'name': 'Plano Business'}
        }

        plan = plans.get(plan_name)
        if not plan:
            return jsonify({'error': 'Plano inválido'}), 400

        # Criar sessão Stripe
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',  # ou 'usd'
                    'product_data': {
                        'name': plan['name'],
                        'description': f'Acesso ao {plan["name"]} - SaaS Chatbot',
                    },
                    'unit_amount': plan['price'],  # em centavos (24.99 EUR = 2499)
                },
                'quantity': 1,
            }],
            mode='payment',  # ou 'subscription' para recorrentes
            success_url='https://seusite.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://seusite.com/cancel',
            metadata={
                'user_id': request.json.get('user_id'),
                'plan_name': plan_name
            }
        )

        return jsonify({'checkout_url': session.url})

    except Exception as e:
        return jsonify({'error': str(e)}), 400
```

#### **Webhook para Processar Pagamentos:**
```python
@app.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('stripe-signature')

    try:
        # Verificar webhook
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )

    except ValueError as e:
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError as e:
        return 'Invalid signature', 400

    # Processar evento
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        # Extrair metadados
        user_id = session['metadata']['user_id']
        plan_name = session['metadata']['plan_name']

        # Atualizar assinatura do usuário
        update_user_subscription(user_id, plan_name)

        print(f'Pagamento confirmado: User {user_id}, Plano {plan_name}')

    return '', 200
```

---

## 💰 **CUSTOS E TAXAS STRIPE**

### **PARA RECEBER PAGAMENTOS:**

#### **Taxas de Transação:**
```python
# Europa (Portugal):
- Taxa padrão: 1.4% + 0.25€
