/**
 * Biblioteca de Autenticação
 * Funções para gerir autenticação no frontend
 */

import Cookies from 'js-cookie';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

/**
 * Salvar dados de autenticação nos cookies
 */
export const saveAuthData = (token: string, userId: number, userName: string) => {
  console.log('Saving auth data:', { token, userId, userName });
  // Configurar cookies com opções mais seguras
  const cookieOptions: {
    expires: number;
    secure: boolean;
    sameSite: 'lax';
    path: string;
    domain?: string;
  } = {
    expires: 1, // 1 dia
    secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
    sameSite: 'lax' as const,
    path: '/'
  };
  
  // Em produção, definir o domínio para permitir cookies cross-domain
  if (process.env.NODE_ENV === 'production') {
    // Remover o protocolo e definir o domínio base
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (apiUrl) {
      try {
        const url = new URL(apiUrl);
        cookieOptions.domain = url.hostname;
      } catch (e) {
        console.error('Error parsing API URL:', e);
      }
    }
  }
  
  // Em produção, definir o domínio para permitir cookies cross-domain
  if (process.env.NODE_ENV === 'production') {
    // Remover o protocolo e definir o domínio base
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (apiUrl) {
      try {
        const url = new URL(apiUrl);
        cookieOptions.domain = url.hostname;
      } catch (e) {
        console.error('Error parsing API URL:', e);
      }
    }
  }
  
  Cookies.set('access_token', token, cookieOptions);
  Cookies.set('user_id', userId.toString(), cookieOptions);
  Cookies.set('user_name', userName, cookieOptions);
  
  // Verificar se os cookies foram salvos
  console.log('Cookies after saving:', {
    access_token: Cookies.get('access_token'),
    user_id: Cookies.get('user_id'),
    user_name: Cookies.get('user_name')
  });
};

/**
 * Verificar se os dados de autenticação foram salvos corretamente
 */
export const verifyAuthDataSaved = (): boolean => {
  const token = Cookies.get('access_token');
  const userId = Cookies.get('user_id');
  const userName = Cookies.get('user_name');
  
  return !!(token && userId && userName);
};

/**
 * Obter dados de autenticação dos cookies
 */
export const getAuthData = (): { token: string | null; user: AuthUser | null } => {
  const token = Cookies.get('access_token') || null;
  const userId = Cookies.get('user_id');
  const userName = Cookies.get('user_name');

  let user: AuthUser | null = null;
  if (userId && userName) {
    user = {
      id: parseInt(userId),
      name: userName,
      email: '', // Email não é armazenado no cookie por segurança
    };
  }

  return { token, user };
};

/**
 * Verificar se o utilizador está autenticado
 */
export const isAuthenticated = (): boolean => {
  const { token } = getAuthData();
  return !!token;
};

/**
 * Fazer logout (remover dados de autenticação)
 */
export const logout = () => {
  const cookieOptions = {
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
  Cookies.remove('access_token', cookieOptions);
  Cookies.remove('user_id', cookieOptions);
  Cookies.remove('user_name', cookieOptions);

  // Fallback de segurança: limpar manualmente via set com data expirada
  Cookies.set('access_token', '', { ...cookieOptions, expires: new Date(0) });
  Cookies.set('user_id', '', { ...cookieOptions, expires: new Date(0) });
  Cookies.set('user_name', '', { ...cookieOptions, expires: new Date(0) });
};

/**
 * Redirecionar para login se não autenticado
 */
export const requireAuth = () => {
  if (typeof window !== 'undefined' && !isAuthenticated()) {
    window.location.href = '/login';
  }
};

