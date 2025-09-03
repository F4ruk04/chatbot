#!/usr/bin/env python3
"""
Script para alterar o plano do usuário faruk04@gmail.com
Permite testar se o dashboard e SubscriptionStatusCard mudam corretamente
"""

import requests
import json
from datetime import datetime, timedelta

# Configurações da API
API_BASE_URL = "https://chatbot-production-d2d7.up.railway.app"

# Credenciais do usuário
USUARIO_EMAIL = "faruk04@gmail.com"
USUARIO_SENHA = "demo123456"

def fazer_login():
    """Faz login e retorna token"""
    print("🔐 Fazendo login...")

    url = f"{API_BASE_URL}/api/auth/login"
    data = {
        "email": USUARIO_EMAIL,
        "password": USUARIO_SENHA
    }

    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Login realizado com sucesso!")
            return result['access_token']
        else:
            print(f"❌ Erro no login: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return None

def alterar_plano(token, novo_plano):
    """Altera o plano do usuário diretamente no banco"""
    print(f"🔄 Alterando plano para: {novo_plano}")

    # Como não temos endpoint direto para alterar plano, vamos fazer via SQL
    # Para isso, precisaremos de acesso ao banco ou criar um endpoint temporário

    print("⚠️  Para alterar o plano, execute este SQL no seu banco de dados:")
    print()
    print("UPDATE users SET plan = '{}' WHERE email = '{}';".format(novo_plano, USUARIO_EMAIL))
    print()
    print("UPDATE subscriptions SET plan = '{}', messages_quota = {} WHERE user_id = (SELECT id FROM users WHERE email = '{}');".format(
        novo_plano,
        5000 if novo_plano == "Profissional" else 10000,
        USUARIO_EMAIL
    ))
    print()

    # Planos disponíveis:
    # - Básico: 150 mensagens
    # - Profissional: 5000 mensagens
    # - Business: 10000 mensagens

def verificar_status_atual(token):
    """Verifica o status atual do usuário"""
    print("📊 Verificando status atual...")

    url = f"{API_BASE_URL}/api/subscriptions/status"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print("✅ Status obtido com sucesso!")
            print(f"   Plano atual: {result['plan']}")
            print(f"   Mensagens usadas: {result['messages_used']}")
            print(f"   Limite de mensagens: {result['messages_quota']}")
            print(".1f")
            return result
        else:
            print(f"❌ Erro ao obter status: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return None

def main():
    """Função principal"""
    print("🎯 ALTERAÇÃO DE PLANO - USUÁRIO faruk04@gmail.com")
    print("=" * 60)

    # Fazer login
    token = fazer_login()

    if token:
        # Verificar status atual
        status_atual = verificar_status_atual(token)

        if status_atual:
            print("\n" + "=" * 60)
            print("📋 OPÇÕES PARA ALTERAR PLANO:")
            print("=" * 60)

            print("\n1️⃣  ALTERAR PARA PROFISSIONAL (5000 mensagens)")
            alterar_plano(token, "Profissional")

            print("\n2️⃣  ALTERAR PARA BUSINESS (10000 mensagens)")
            alterar_plano(token, "Business")

            print("\n3️⃣  VOLTAR PARA BÁSICO (150 mensagens)")
            alterar_plano(token, "Básico")

            print("\n" + "=" * 60)
            print("🔄 APÓS EXECUTAR O SQL:")
            print("1. Reinicie a aplicação Railway")
            print("2. Faça login novamente no frontend")
            print("3. Verifique se o dashboard mudou")
            print("4. Verifique se o SubscriptionStatusCard mostra o novo plano")
            print("5. Teste os limites de mensagens")
            print("=" * 60)

if __name__ == "__main__":
    main()