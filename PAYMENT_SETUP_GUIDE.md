# 💳 Configuração de Pagamentos com Flutterwave

Guia de configuração do sistema de pagamentos com Flutterwave para cobrar pelas assinaturas.

## 🔧 Configuração Inicial

### 1. Criar Conta no Flutterwave

1. Acesse [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Crie uma conta ou faça login
3. No dashboard, vá em Settings > API Keys
4. Copie sua `Public Key` e `Secret Key`

### 2. Configurar Variáveis de Ambiente

No arquivo `.env` do backend, adicione:

```env
FLUTTERWAVE_SECRET_KEY=seu_secret_key_aqui
FLUTTERWAVE_PUBLIC_KEY=seu_public_key_aqui
FLUTTERWAVE_SANDBOX=true  # Use 'false' em produção
FRONTEND_URL=http://localhost:3000  # URL do seu frontend
```

### 3. Configurar Webhook

1. No Flutterwave Dashboard, vá em Settings > Webhooks
2. Adicione a URL do seu webhook:
   ```
   https://seu-dominio.com/api/webhook/flutterwave
   ```
3. Flutterwave enviará notificações para esta URL quando houver pagamentos

## 💰 Métodos de Pagamento Suportados

- M-PESA
- Cartão de Crédito/Débito
- Transferência Bancária (Alguns países)

## 🔒 Segurança

- Todas as transações são criptografadas
- Flutterwave é PCI DSS Level 1 compliant
- Implementamos verificação de assinatura do webhook

## 🛠️ Testes

### Testar Pagamentos no Sandbox

1. Use os cartões de teste fornecidos pelo Flutterwave:
   ```
   Número: 5531 8866 5214 2950
   Data: Qualquer data futura
   CVV: 564
   PIN: 3310
   OTP: 12345
   ```

2. Para M-PESA no sandbox:
   ```
   Número: 123456789
   PIN: 12345
   ```

### Verificar Pagamentos

1. Os pagamentos aparecem no dashboard do Flutterwave
2. Webhooks notificam o sistema automaticamente
3. O sistema atualiza a assinatura após confirmação

## ⚠️ Notas Importantes

1. **Sandbox vs Produção**
   - Use `FLUTTERWAVE_SANDBOX=true` para testes
   - Mude para `false` em produção
   - Use chaves diferentes para sandbox e produção

2. **Webhook**
   - Configure ngrok ou domínio público para testes
   - Sempre verifique assinatura do webhook
   - Trate duplicidade de notificações

3. **Segurança**
   - Nunca exponha a SECRET_KEY
   - Valide todos os inputs
   - Use HTTPS em produção
