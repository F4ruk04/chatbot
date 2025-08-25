
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/auth'; // Importando a interface de usuário existente

// Interface para o valor do contexto de autenticação
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: AuthUser, token: string) => void;
  logout: () => void;
}

// Criar o contexto com um valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provedor de Autenticação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Efeito para verificar a autenticação no carregamento inicial
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userDataString = localStorage.getItem('user');
      
      if (token && userDataString) {
        const userData: AuthUser = JSON.parse(userDataString);
        setUser(userData);
      }
    } catch (error) {
      console.error("Falha ao carregar dados de autenticação do localStorage", error);
      // Limpa o estado se os dados estiverem corrompidos
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((userData: AuthUser, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.push('/dashboard'); // Redireciona para o dashboard após o login
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login'); // Redireciona para a página de login após o logout
  }, [router]);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
