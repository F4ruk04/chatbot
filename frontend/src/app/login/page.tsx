/**
 * Página de Login
 * Interface moderna para autenticação de utilizadores
 */
 
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { saveAuthData, verifyAuthDataSaved } from '@/lib/auth';
import { useNotification } from '@/hooks/useNotification';
import { Eye, EyeOff, LogIn, Building2, MessageSquare, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      
      // Salvar dados de autenticação
      saveAuthData(response.access_token, response.user_id, response.user_name);
      
      // Verificar se os cookies foram salvos corretamente antes de redirecionar
      const maxAttempts = 20; // Aumentar tentativas
      let attempts = 0;
      
      const checkAndRedirect = () => {
        console.log(`Attempt ${attempts + 1} to verify auth data`);
        
        if (verifyAuthDataSaved()) {
          console.log('Auth data verified successfully');
          showNotification({
            type: 'success',
            title: 'Login Bem-sucedido!',
            message: 'Você foi logado com sucesso.',
            duration: 3000
          });
          router.push('/dashboard');
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkAndRedirect, 100); // Aumentar delay
        } else {
          console.error('Failed to verify auth data after', maxAttempts, 'attempts');
          const msg = 'Erro ao salvar dados de autenticação. Tente novamente.';
          setError(msg);
          showNotification({
            type: 'error',
            title: 'Erro no Login',
            message: msg,
            duration: 5000
          });
          setLoading(false);
        }
      };
      
      checkAndRedirect();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const errorMessage = axiosError.response?.data?.detail || 'Erro ao fazer login';
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Erro no Login',
        message: errorMessage,
        duration: 5000
      });
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Link para registro */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não tem uma conta?{' '}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Hero section */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="max-w-2xl text-center text-white px-8">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Chatbot Inteligente para sua Empresa
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Automatize o atendimento ao cliente com IA avançada e integração WhatsApp. 
              Aumente a satisfação dos clientes e reduza custos operacionais.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-6 mt-12">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Atendimento 24/7</h3>
                <p className="text-blue-100">Respostas instantâneas a qualquer hora</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">IA Avançada</h3>
                <p className="text-blue-100">Respostas inteligentes e personalizadas</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Multi-empresa</h3>
                <p className="text-blue-100">Gerencie várias empresas em uma plataforma</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

