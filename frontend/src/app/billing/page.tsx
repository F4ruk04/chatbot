/**
 * Página de Billing/Checkout
 * Interface para upgrade de planos e pagamentos
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import { 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  Headphones, 
  Star,
  CreditCard,
  Smartphone,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
  icon: React.ComponentType<any>;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    priceDisplay: '0 MZN',
    description: 'Para testar a plataforma',
    features: [
      '150 mensagens/mês',
      '1 Conexão WhatsApp',
      'Dashboard básico',
      'Suporte por email'
    ],
    color: 'from-gray-500 to-gray-600',
    icon: Shield
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2499,
    priceDisplay: '2.499 MZN',
    description: 'Para empresas em crescimento',
    features: [
      '3.000 mensagens/mês',
      '3 Conexões WhatsApp',
      'Dashboard avançado',
      'Relatórios detalhados',
      'Suporte prioritário',
      'Sem marca da plataforma'
    ],
    popular: true,
    color: 'from-blue-500 to-blue-600',
    icon: Zap
  },
  {
    id: 'business',
    name: 'Business',
    price: 6999,
    priceDisplay: '6.999 MZN',
    description: 'Para grandes operações',
    features: [
      '10.000 mensagens/mês',
      'Conexões ilimitadas',
      'Dashboard personalizado',
      'API personalizada',
      'Suporte 24/7',
      'Onboarding VIP',
      'Gerente de conta dedicado'
    ],
    color: 'from-purple-500 to-purple-600',
    icon: Crown
  }
];

const paymentMethods = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    description: 'Pagamento via M-Pesa',
    icon: Smartphone,
    available: true
  },
  {
    id: 'card',
    name: 'Cartão de Crédito',
    description: 'Visa, Mastercard',
    icon: CreditCard,
    available: true
  }
];

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('mpesa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  useEffect(() => {
    // Verificar plano atual do usuário
    fetchCurrentPlan();
    
    // Verificar se há um plano pré-selecionado na URL
    const planFromUrl = searchParams.get('plan');
    if (planFromUrl && plans.find(p => p.id === planFromUrl)) {
      setSelectedPlan(planFromUrl);
    }
  }, [searchParams]);

  const fetchCurrentPlan = async () => {
    try {
      const { api } = await import('@/lib/api');
      const response = await api.get('/api/subscription/status');
      setCurrentPlan(response.data.plan || 'free');
    } catch (error) {
      console.error('Erro ao carregar plano atual:', error);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setError('');
  };

  const handlePayment = async () => {
    if (selectedPlan === currentPlan) {
      setError('Você já está neste plano');
      return;
    }

    if (selectedPlan === 'free') {
      setError('Não é possível fazer downgrade para o plano gratuito');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { api } = await import('@/lib/api');
      
      // Simular processo de pagamento
      const response = await api.post('/api/payments/checkout', {
        plan: selectedPlan,
        payment_method: selectedPaymentMethod
      });

      if (response.data.success) {
        // Redirecionar para página de sucesso ou dashboard
        router.push('/dashboard?upgrade=success');
      } else {
        setError('Erro ao processar pagamento. Tente novamente.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const currentPlanData = plans.find(p => p.id === currentPlan);

  return (
    <Layout>
      <AuthGuard>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Upgrade do Plano
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Escolha o plano ideal para o seu negócio
              </p>
            </div>
          </div>

          {/* Plano atual */}
          {currentPlanData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${currentPlanData.color} rounded-lg flex items-center justify-center`}>
                  <currentPlanData.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Plano Atual
                  </p>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {currentPlanData.name} - {currentPlanData.priceDisplay}/mês
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seleção de planos */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Escolha seu novo plano
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  const isSelected = selectedPlan === plan.id;
                  const isCurrent = currentPlan === plan.id;
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${isCurrent ? 'opacity-50' : ''}`}
                      onClick={() => !isCurrent && handlePlanSelect(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Mais Popular</span>
                          </span>
                        </div>
                      )}
                      
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Plano Atual
                          </span>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-10 h-10 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {plan.name}
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {plan.priceDisplay}
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                /mês
                              </span>
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {plan.description}
                        </p>

                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo e pagamento */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Resumo do Pedido
                </h3>

                {selectedPlanData && (
                  <div className="space-y-4">
                    {/* Plano selecionado */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className={`w-8 h-8 bg-gradient-to-r ${selectedPlanData.color} rounded-lg flex items-center justify-center`}>
                        <selectedPlanData.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Plano {selectedPlanData.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cobrança mensal
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedPlanData.priceDisplay}
                      </p>
                    </div>

                    {/* Método de pagamento */}
                    {selectedPlanData.price > 0 && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                            Método de Pagamento
                          </h4>
                          <div className="space-y-2">
                            {paymentMethods.map((method) => {
                              const Icon = method.icon;
                              return (
                                <label
                                  key={method.id}
                                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    selectedPaymentMethod === method.id
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                  } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name="paymentMethod"
                                    value={method.id}
                                    checked={selectedPaymentMethod === method.id}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                    disabled={!method.available}
                                    className="text-blue-600"
                                  />
                                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {method.name}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {method.description}
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              Total
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {selectedPlanData.priceDisplay}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Cobrança recorrente mensal
                          </p>
                        </div>
                      </>
                    )}

                    {/* Erro */}
                    {error && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700 dark:text-red-400">
                          {error}
                        </span>
                      </div>
                    )}

                    {/* Botão de ação */}
                    <button
                      onClick={handlePayment}
                      disabled={loading || selectedPlan === currentPlan || selectedPlan === 'free'}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processando...</span>
                        </>
                      ) : selectedPlan === 'free' ? (
                        <span>Selecione um plano pago</span>
                      ) : selectedPlan === currentPlan ? (
                        <span>Plano atual</span>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          <span>Confirmar Upgrade</span>
                        </>
                      )}
                    </button>

                    {/* Garantia */}
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          Pagamento 100% seguro
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Cancele a qualquer momento
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    </Layout>
  );
}