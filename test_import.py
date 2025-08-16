#!/usr/bin/env python3
"""
Teste de importação dos módulos principais
"""

import sys
import os

# Adicionar o diretório backend ao path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

def test_imports():
    """Testa importações principais"""
    try:
        print("🔍 Testando importações...")
        
        # Testar FastAPI
        import fastapi
        print("✅ FastAPI importado com sucesso")
        
        # Testar SQLAlchemy
        import sqlalchemy
        print("✅ SQLAlchemy importado com sucesso")
        
        # Testar modelos
        from app.models import user, company, message, subscription
        print("✅ Modelos importados com sucesso")
        
        # Testar routers principais
        from app.routers import auth, companies, whatsapp, dashboard, health, payments, subscriptions
        print("✅ Routers principais importados com sucesso")
        
        # Testar main (sem executar)
        import main
        print("✅ Main module importado com sucesso")
        
        print("\n🎉 Todos os imports funcionaram!")
        return True
        
    except ImportError as e:
        print(f"❌ Erro de importação: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        return False

if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1)