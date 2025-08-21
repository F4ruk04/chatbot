/**
 * Biblioteca de API
 * Configuração do cliente Axios e funções de API
 */

import axios from 'axios';
import Cookies from 'js-cookie';

// Configurar URL base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Criar instância do Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag para prevenir múltiplos redirecionamentos
let isRedirecting = false;

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
    }
    
    if (error.response?.status === 401) {
      // Token expirado ou inválido - limpar cookies
      const cookieOptions = {
        path: '/',
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
      };
      
      Cookies.remove('access_token', cookieOptions);
      Cookies.remove('user_id', cookieOptions);
      Cookies.remove('user_name', cookieOptions);
      
      // Prevenir loops de redirecionamento
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAuthPage = ['/login', '/register', '/'].includes(currentPath);
      
      if (!isAuthPage && !isRedirecting && typeof window !== 'undefined') {
        isRedirecting = true;
        
        // Adicionar delay e resetar flag após redirecionamento
        setTimeout(() => {
          window.location.href = '/login';
          // Reset flag após 2 segundos para permitir futuras tentativas
          setTimeout(() => {
            isRedirecting = false;
          }, 2000);
        }, 100);
      }
    } else if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data?.detail || 'You do not have permission to access this resource');
    } else if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data?.detail || 'Invalid request');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data?.detail || 'Internal server error');
    }
    
    return Promise.reject(error);
  }
);

// Tipos de dados
export interface User {
  id: number;
  email: string;
  nome: string;
}

export interface Company {
  id: number;
  nome: string;
  descricao?: string;
  whatsapp_phone_number: string;
  context_prompt?: string;
  created_at: string;
}

export interface Message {
  id: number;
  whatsapp_message_id: string;
  sender_phone: string;
  sender_name?: string;
  message_text: string;
  response_text?: string;
  is_from_customer: boolean;
  company_id: number;
  created_at: string;
}

export interface DashboardStats {
  total_companies: number;
  total_messages: number;
  messages_today: number;
  messages_this_week: number;
  messages_this_month: number;
  active_conversations: number;
}

export interface CompanyStats {
  company_id: number;
  company_name: string;
  total_messages: number;
  messages_today: number;
  last_message_date?: string;
}

// Funções de autenticação
export const authAPI = {
  register: async (data: { email: string; nome: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

// Funções de empresas
export const companiesAPI = {
  getAll: async (): Promise<Company[]> => {
    const response = await api.get('/companies/');
    return response.data;
  },

  create: async (data: {
    nome: string;
    descricao?: string;
    whatsapp_phone_number: string;
    context_prompt?: string;
  }): Promise<Company> => {
    const response = await api.post('/companies/add', data);
    return response.data;
  },

  getById: async (id: number): Promise<Company> => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  update: async (id: number, data: {
    nome: string;
    descricao?: string;
    whatsapp_phone_number: string;
    context_prompt?: string;
  }): Promise<Company> => {
    const response = await api.put(`/companies/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },
};

// Funções do dashboard
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/');
    return response.data;
  },

  getCompaniesStats: async (): Promise<CompanyStats[]> => {
    const response = await api.get('/dashboard/companies');
    return response.data;
  },

  getMessagesChart: async (companyId: number, days: number = 30) => {
    const response = await api.get(`/dashboard/messages-chart/${companyId}?days=${days}`);
    return response.data;
  },
};

// Funções de mensagens
export const messagesAPI = {
  getByCompany: async (companyId: number, skip: number = 0, limit: number = 100): Promise<Message[]> => {
    const response = await api.get(`/whatsapp/messages/${companyId}?skip=${skip}&limit=${limit}`);
    return response.data;
  },
};
