#!/usr/bin/env python3
"""
Teste da variável PORT
"""

import os

def test_port_handling():
    """Testa o tratamento da variável PORT"""
    
    print("🔍 Testando tratamento da variável PORT...")
    
    # Teste 1: PORT não definida
    os.environ.pop('PORT', None)
    try:
        port = int(os.getenv("PORT", 8000))
        print(f"✅ PORT não definida: {port} (padrão)")
    except (ValueError, TypeError):
        port = 8000
        print(f"✅ PORT não definida com fallback: {port}")
    
    # Teste 2: PORT válida
    os.environ['PORT'] = '3000'
    try:
        port = int(os.getenv("PORT", 8000))
        print(f"✅ PORT válida: {port}")
    except (ValueError, TypeError):
        port = 8000
        print(f"❌ PORT válida falhou, usando fallback: {port}")
    
    # Teste 3: PORT inválida
    os.environ['PORT'] = 'invalid'
    try:
        port = int(os.getenv("PORT", 8000))
        print(f"❌ PORT inválida não tratada: {port}")
    except (ValueError, TypeError):
        port = 8000
        print(f"✅ PORT inválida tratada com fallback: {port}")
    
    # Teste 4: PORT vazia
    os.environ['PORT'] = ''
    try:
        port = int(os.getenv("PORT", 8000))
        print(f"❌ PORT vazia não tratada: {port}")
    except (ValueError, TypeError):
        port = 8000
        print(f"✅ PORT vazia tratada com fallback: {port}")
    
    print("\n🎉 Testes de PORT concluídos!")

if __name__ == "__main__":
    test_port_handling()