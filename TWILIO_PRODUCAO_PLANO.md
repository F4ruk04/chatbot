# 📱 **ESTRATÉGIA TWILIO PRODUÇÃO + PLANO GRATUITO**

## 🎯 **QUESTÕES CRÍTICAS IDENTIFICADAS**

### **1. TWILIO - SAINDO DO SANDBOX**
**Status Atual:** Sistema funciona apenas com sandbox Twilio
**Problema:** Números de teste limitados, não escalável

### **2. PLANO GRATUITO/TESTE**
**Status Atual:** Não definido/planejado
**Problema:** Como oferecer teste sem custos elevados?

---

## 💡 **ESTRATÉGIAS PROPOSTAS**

### **ESTRATÉGIA 1: POOL COMPARTILHADO (RECOMENDADA)**

#### **Conceito:**
- **Pool de números Twilio** compartilhados entre usuários gratuitos
- **Isolamento por empresa** - cada empresa tem seu próprio número dedicado
- **Limite de uso** rigoroso para controlar custos

#### **Vantagens:**
- ✅ **Custo controlado** - poucos números para muitos usuários
- ✅ **Setup simples** - não precisa comprar números dinamicamente
- ✅ **Escalável** - adicionar mais números ao pool conforme crescimento
- ✅ **Confiável** - números dedicados por empresa

#### **Implementação:**
```python
# Pool de números gratuitos
FREE_NUMBERS_POOL = [
    "whatsapp:+258840000001",
    "whatsapp:+258840000002",
    "whatsapp:+258840000003",
    # ... mais números conforme necessário
]

# Atribuição automática
def assign_free_number_to_company(company_id: int):
    # Lógica para atribuir número do pool
    # Marcar número como "em uso"
    # Associar à empresa
    pass
```

#### **Fluxo Usuário:**
```
1. Usuário cria conta gratuita
2. Sistema atribui automaticamente número do pool
3. Usuário pode criar 1 empresa (limite plano gratuito)
4. Número fica dedicado àquela empresa
5. Após upgrade, usuário ganha números próprios
```

### **ESTRATÉGIA 2: COMPRA AUTOMÁTICA (MAIS COMPLEXA)**

#### **Conceito:**
- **Compra automática** de números Twilio quando usuário paga
- **Quantidade baseada no plano** (1 para Pro, 3 para Business)
- **Atribuição imediata** após pagamento confirmado

#### **Vantagens:**
- ✅ **Experiência premium** - números dedicados desde o início
- ✅ **Sem compartilhamento** - isolamento total
- ✅ **Escalável automaticamente**

#### **Desvantagens:**
- ❌ **Setup complexo** - integração Twilio API para compras
- ❌ **Custos iniciais** - compra imediata de números
- ❌ **Gestão complexa** - lidar com falhas de compra

#### **Implementação:**
```python
# Serviço de compra de números
class TwilioNumberService:
    def purchase_number_for_plan(self, plan: str) -> str:
        """Compra número baseado no plano"""
        quantity = PLAN_NUMBER_MAPPING[plan]
        # API Twilio para comprar números
        # Retornar número comprado
        pass

    def assign_number_to_company(self, number: str, company_id: int):
        """Associa número à empresa"""
        pass
```

---

## 🎯 **ESTRATÉGIA RECOMENDADA: POOL COMPARTILHADO**

### **Por que recomendo esta abordagem:**

1. **🎯 Simplicidade de Implementação**
   - Não precisa integrar API de compra Twilio
   - Setup mais rápido
   - Menos pontos de falha

2. **💰 Controle de Custos**
   - Números compartilhados = custos menores
   - Previsibilidade de gastos
   - ROI melhor no início

3. **⚡ Velocidade de Mercado**
   - Pode lançar mais rápido
   - Menos complexidade técnica
   - Foco no core product primeiro

4. **🔄 Migração Futura Possível**
   - Começar com pool compartilhado
   - Migrar para compra automática depois
   - Usuários existentes podem manter números

---

## 📋 **PLANO DE IMPLEMENTAÇÃO DETALHADO**

### **FASE 1: INFRAESTRUTURA (1 semana)**

#### **Backend:**
```python
# backend/app/models/whatsapp_number.py
class WhatsAppNumber(Base):
    __tablename__ = "whatsapp_numbers"

    id = Column(Integer, primary_key=True)
    twilio_sid = Column(String, unique=True)
    phone_number = Column(String, unique=True)
    status = Column(String, default="free")  # free, assigned, paid
    assigned_to_company = Column(Integer, ForeignKey("companies.id"), nullable=True)
    plan_type = Column(String)  # free, pro, business
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### **API Endpoints:**
```python
# backend/app/routers/whatsapp_numbers.py
@router.post("/assign-free-number")
def assign_free_number_to_company(company_id: int, current_user: User):
    """Atribui número gratuito do pool à empresa"""
    pass

@router.get("/my-numbers")
def get_user_whatsapp_numbers(current_user: User):
    """Retorna números WhatsApp do usuário"""
    pass
```

### **FASE 2: LÓGICA DE NEGÓCIO (1 semana)**

#### **Regras de Atribuição:**
```python
def can_assign_free_number(user: User) -> bool:
    """Verifica se usuário pode receber número gratuito"""
    # Regras:
    # - Plano gratuito
    # - Não tem números gratuitos ativos
    # - Não excedeu limite de empresas
    # - Período de teste ainda válido
    pass

def assign_free_number(user: User, company_id: int) -> WhatsAppNumber:
    """Atribui número gratuito do pool"""
    # Lógica:
    # 1. Verificar elegibilidade
    # 2. Selecionar número disponível do pool
    # 3. Marcar como atribuído
    # 4. Associar à empresa
    # 5. Retornar número
    pass
```

### **FASE 3: INTEGRAÇÃO FRONTEND (3 dias)**

#### **Componentes a Criar:**
- `WhatsAppNumberSelector` - escolher número ao criar empresa
- `NumberStatusCard` - mostrar status do número
- `UpgradePrompt` - incentivar upgrade quando limites atingidos

#### **Fluxo UI:**
```
Criar Empresa → Selecionar Número → Confirmar Atribuição → Empresa Criada
```

### **FASE 4: LIMITES E CONTROLE (1 semana)**

#### **Sistema de Limites:**
```python
# Limites por plano
PLAN_LIMITS = {
    "Básico": {
        "max_messages": 150,
        "max_companies": 1,
        "trial_days": 7,
        "number_type": "shared"
    },
    "Profissional": {
        "max_messages": 5000,
        "max_companies": 1,
        "number_type": "dedicated"
    },
    "Business": {
        "max_messages": 10000,
        "max_companies": 3,
        "number_type": "dedicated"
    }
}
```

#### **Controle de Uso:**
- **Mensagens:** Contador em tempo real
- **Empresas:** Limite por plano
- **Período de teste:** 7 dias para gratuito
- **Notificações:** Avisos aos 80% do limite

---

## 🚀 **ROADMAP ESPECÍFICO PARA TWILIO + GRATUITO**

### **SPRINT ESPECIAL: TWILIO PRODUÇÃO (2 semanas)**

#### **Semana 1: Infraestrutura**
- ✅ **Model WhatsAppNumber** criado
- ✅ **API de atribuição** implementada
- ✅ **Pool de números** configurado
- ✅ **Testes básicos** realizados

#### **Semana 2: Integração Completa**
- ✅ **Frontend integrado** com seleção de números
- ✅ **Sistema de limites** implementado
- ✅ **Notificações** configuradas
- ✅ **Testes end-to-end** realizados

### **SPRINT CONCOMITANTE: PLANO GRATUITO (1 semana)**

#### **Definições:**
- **Período:** 7 dias de teste
- **Limite:** 50 mensagens
- **Empresas:** 1 empresa máxima
- **Número:** Compartilhado do pool

#### **Implementação:**
- ✅ **Lógica de elegibilidade** implementada
- ✅ **Controle de período** configurado
- ✅ **Limites aplicados** em tempo real
- ✅ **UI de upgrade** criada

---

## 💰 **ANÁLISE DE CUSTOS**

### **Pool Compartilhado (Recomendado):**
- **Compra inicial:** 10 números = ~$100-200
- **Custos mensais:** ~$10-20 por número
- **Usuários suportados:** 1000+ usuários gratuitos
- **Custo por usuário:** <$0.02/mês

### **Compra Automática:**
- **Compra por usuário:** $1-2 por número
- **Custos iniciais:** $0 (pago pelo usuário)
- **Complexidade:** Alta
- **Setup time:** 2-3 semanas extra

---

## 🎯 **PRÓXIMOS PASSOS IMEDIATOS**

### **Esta Semana:**
1. **Finalizar Sprint 1** (limites + notificações)
2. **Implementar model WhatsAppNumber**
3. **Criar pool de números de teste**

### **Próxima Semana:**
1. **Implementar API de atribuição**
2. **Integrar frontend**
3. **Testar fluxo completo**

### **Decisões a Tomar:**
1. **Quantos números no pool inicial?** (5-10 recomendado)
2. **Período de teste gratuito?** (7 dias recomendado)
3. **Limite de mensagens gratuito?** (50-100 recomendado)

---

## 📊 **MÉTRICAS DE SUCESSO**

### **Para considerar implementado:**
- ✅ Usuários gratuitos podem criar empresas
- ✅ Números atribuídos automaticamente
- ✅ Limites aplicados corretamente
- ✅ Upgrade incentivado quando limites atingidos
- ✅ Sem custos excessivos no início

### **KPIs a Monitorar:**
- **Conversão gratuita → paga:** Target >20%
- **Custo por usuário gratuito:** Target <$0.05/mês
- **Tempo médio para upgrade:** Target <7 dias
- **Satisfação usuários gratuitos:** Target >4/5 estrelas

---

*Estratégia definida em 28/08/2024 - Foco em simplicidade e controle de custos*