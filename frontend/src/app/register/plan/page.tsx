'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import clsx from 'clsx';

interface Plan {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    title: 'Gratuito',
    price: '0 MZN',
    description: 'Para testar a plataforma',
    features: [
      '150 mensagens/mês',
      '1 Conexão WhatsApp',
      'Dashboard Simples',
      'Inclui nossa marca'
    ]
  },
  {
    id: 'pro',
    title: 'Pro',
    price: '2.499 MZN',
    description: 'Para empresas em crescimento',
    features: [
      '3.000 mensagens/mês',
      '3 Conexões WhatsApp',
      'Dashboard Completo',
      'Suporte Prioritário',
      'Sem nossa marca'
    ],
    recommended: true
  },
  {
    id: 'business',
    title: 'Business',
    price: '6.999 MZN',
    description: 'Para grandes operações',
    features: [
      '10.000 mensagens/mês',
      'Conexões Ilimitadas',
      'API Personalizada',
      'Suporte 24/7',
      'Dashboard Personalizado',
      'Onboarding VIP'
    ]
  }
];

export default function PlanSelection() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanSelectionContent />
    </Suspense>
  );
}

function PlanSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'free');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Salvar plano selecionado no localStorage para usar no registro
      localStorage.setItem('selectedPlan', selectedPlan);
      router.push(`/register?plan=${selectedPlan}`);
    } catch (error) {
      console.error('Erro ao selecionar plano:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal
          </h1>
          <p className="text-xl text-gray-600">
            Comece grátis e faça upgrade conforme seu negócio cresce
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={clsx(
                'bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-200 transform hover:scale-105',
                {
                  'border-green-500 ring-2 ring-green-500 ring-opacity-50':
                    selectedPlan === plan.id,
                  'border-transparent': selectedPlan !== plan.id
                }
              )}
            >
              {plan.recommended && (
                <div className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                  Recomendado
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {plan.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">{plan.price}</p>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={clsx(
                  'w-full py-3 px-4 rounded-lg font-medium transition-colors',
                  {
                    'bg-green-600 text-white hover:bg-green-700':
                      selectedPlan === plan.id,
                    'bg-gray-100 text-gray-900 hover:bg-gray-200':
                      selectedPlan !== plan.id
                  }
                )}
              >
                {selectedPlan === plan.id ? 'Selecionado' : 'Selecionar'}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : 'Continuar com o Plano Selecionado'}
          </button>
        </div>
      </div>
    </div>
  );
}
