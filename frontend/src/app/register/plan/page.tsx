'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Check, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { authAPI } from '@/lib/api';
import { saveAuthData } from '@/lib/auth';
import { useNotification } from '@/hooks/useNotification';

interface Plan {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

const plans = [
  {
    id: 'free',
    title: 'Gratuito',
    price: '0 MZN',
    description: 'Para testar a plataforma e para negócios com baixo volume de conversas.',
    features: [
      '150 mensagens/mês',
      '1 Conexão WhatsApp',
      'Dashboard Simples',
      'Inclui a nossa marca nas respostas',
    ],
    ctaText: 'Comece Grátis',
  },
  {
    id: 'pro',
    title: 'Pro',
    price: '2.499 MZN',
    description: 'A escolha ideal para empresas que buscam profissionalizar o atendimento e vender mais.',
    features: [
      '3.000 mensagens/mês',
      '1 Conexão WhatsApp',
      'Dashboard Avançado com Relatórios',
      'Histórico de conversas (90 dias)',
      'Sem a nossa marca',
      'Suporte Prioritário via Email',
    ],
    ctaText: 'Escolher Plano Pro',
    popular: true,
  },
  {
    id: 'business',
    title: 'Business',
    price: '6.999 MZN',
    description: 'Para negócios que exigem o máximo de performance e um suporte personalizado.',
    features: [
      '10.000 mensagens/mês',
      '3 Conexões WhatsApp',
      'Tudo do Plano Pro +',
      'Onboarding Personalizado por vídeo-chamada',
      'Suporte VIP direto via WhatsApp',
    ],
    ctaText: 'Fale Conosco',
  },
];

export default function RegisterPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    const planFromStorage = localStorage.getItem('selectedPlan');
    const planFromUrl = searchParams.get('plan');

    if (planFromUrl && plans.some(p => p.id === planFromUrl)) {
      setSelectedPlan(planFromUrl);
    } else if (planFromStorage && plans.some(p => p.id === planFromStorage)) {
      setSelectedPlan(planFromStorage);
    }
  }, [searchParams]);

  const handleRegisterAndSelectPlan = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = JSON.parse(localStorage.getItem('registerData') || '{}');
      if (!userData.email || !userData.password || !userData.nome) {
        const msg = 'Dados de registro incompletos. Por favor, volte e preencha todos os campos.';
        setError(msg);
        showNotification({
          type: 'error',
          title: 'Erro no Registro',
          message: msg,
          duration: 7000
        });
        setLoading(false);
        return;
      }

      const response = await authAPI.register({
        email: userData.email,
        nome: userData.nome,
        password: userData.password,
      });

      saveAuthData(response.access_token, response.user_id, response.user_name);
      localStorage.removeItem('registerData');
      localStorage.removeItem('selectedPlan'); // Limpar após uso

      showNotification({
        type: 'success',
        title: 'Registro Concluído!',
        message: 'Sua conta foi criada com sucesso. Bem-vindo!',
        duration: 5000
      });

      // Redirecionar para o dashboard ou página de checkout se for plano pago
      if (selectedPlan === 'free') {
        router.push('/dashboard?welcome=true');
      } else {
        router.push(`/billing?plan=${selectedPlan}`);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const errorMessage = axiosError.response?.data?.detail || 'Erro ao registrar e selecionar plano.';
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Erro no Registro',
        message: errorMessage,
        duration: 7000
      });
      console.error('Erro de registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Escolha seu Plano
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Você pode mudar a qualquer momento.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erro:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={clsx(
                  "relative rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6 border-2 cursor-pointer",
                  selectedPlan === plan.id
                    ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block bg-blue-500 text-white text-xs font-semibold py-1 px-3 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.title}</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{plan.price} <span className="text-base font-normal text-gray-500 dark:text-gray-400">/mês</span></p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{plan.description}</p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button
            onClick={handleRegisterAndSelectPlan}
            disabled={loading}
            className={clsx(
              "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                Continuar com o Plano {plans.find(p => p.id === selectedPlan)?.title}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
