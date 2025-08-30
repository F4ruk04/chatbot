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

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - apenas limpar cookies
      // Não redirecionar automaticamente para evitar loops
      Cookies.remove('access_token');
      Cookies.remove('user_id');
      Cookies.remove('user_name');
      
      // Só redirecionar se não estiver já na página de login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        // Adicionar um pequeno delay para evitar redirecionamentos muito rápidos
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
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
  telefone?: string; // Adicionado Telefone
  email?: string; // Adicionado Email
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
  user_plan: string;
  company_limit: number;
  message_limit: number;
  message_usage_percentage: number;
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

export interface MessageStats {
  date: string;
  message_count: number;
}

// Interface para o status da assinatura
export interface SubscriptionStatusResponse {
  plan: string;
  status: string;
  messages_used: number;
  messages_quota: number;
  usage_percent: number;
  days_remaining: number;
  renewal_date: string;
  warning_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Interface para os limites de planos
export interface PlanLimitsResponse {
  [key: string]: number; // Ex: { "Básico": 1, "Profissional": 5, "Enterprise": 999999 }
}

// Interfaces para pagamentos Stripe
export interface PaymentSessionResponse {
  status: string;
  checkout_url?: string;
  session_id?: string;
  plan?: string;
  amount?: number;
  currency?: string;
  message?: string;
}

export interface PaymentVerificationResponse {
  status: string;
  amount?: number;
  currency?: string;
  metadata?: any;
  customer_email?: string;
}

export interface PaymentHistoryItem {
  id: number;
  amount: number;
  currency: string;
  status: string;
  plan_name: string;
  created_at: string;
  stripe_session_id: string;
}

export interface RefundResponse {
  status: string;
  refund_id?: string;
  amount?: number;
  message?: string;
}

// Funções de autenticação
export const authAPI = {
  register: async (data: { email: string; nome: string; password: string }) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },
};

// Funções de empresas
export const companiesAPI = {
  getAll: async (): Promise<Company[]> => {
    const response = await api.get('/api/companies/');
    return response.data;
  },

  create: async (data: {
    nome: string;
    descricao?: string;
    whatsapp_phone_number: string;
    context_prompt?: string;
  }): Promise<Company> => {
    const response = await api.post('/api/companies/add', data);
    return response.data;
  },

  getById: async (id: number): Promise<Company> => {
    const response = await api.get(`/api/companies/${id}`);
    return response.data;
  },

  update: async (id: number, data: {
    nome: string;
    descricao?: string;
    whatsapp_phone_number: string;
    context_prompt?: string;
  }): Promise<Company> => {
    const response = await api.put(`/api/companies/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/companies/${id}`);
  },
};

// Funções de assinaturas
export const subscriptionsAPI = {
  getStatus: async (): Promise<SubscriptionStatusResponse> => {
    const response = await api.get('/api/subscription/status');
    return response.data;
  },
  getPlanLimits: async (): Promise<PlanLimitsResponse> => {
    const response = await api.get('/api/subscription/plan-limits');
    return response.data;
  },
};

// Funções do dashboard
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/dashboard/');
    return response.data;
  },

  getCompaniesStats: async (): Promise<CompanyStats[]> => {
    const response = await api.get('/api/dashboard/companies');
    return response.data;
  },

  getMessagesChart: async (companyId: number, days: number = 30) => {
    const response = await api.get(`/api/dashboard/messages-chart/${companyId}?days=${days}`);
    return response.data;
  },
};

// Funções de mensagens
export const messagesAPI = {
  getByCompany: async (companyId: number, skip: number = 0, limit: number = 100): Promise<Message[]> => {
    const response = await api.get(`/api/whatsapp/messages/${companyId}?skip=${skip}&limit=${limit}`);
    return response.data;
  },
};

// Funções de pagamentos Stripe
export const paymentsAPI = {
  createSession: async (planName: string): Promise<PaymentSessionResponse> => {
    const response = await api.post('/api/payments/create-session', { plan_name: planName });
    return response.data;
  },

  verifyPayment: async (sessionId: string): Promise<PaymentVerificationResponse> => {
    const response = await api.get(`/api/payments/verify/${sessionId}`);
    return response.data;
  },

  getHistory: async (): Promise<PaymentHistoryItem[]> => {
    const response = await api.get('/api/payments/history');
    return response.data;
  },

  createRefund: async (paymentId: number): Promise<RefundResponse> => {
    const response = await api.post(`/api/payments/refund/${paymentId}`);
    return response.data;
  },
};
