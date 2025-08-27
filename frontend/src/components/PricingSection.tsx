'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  title: string;
  price: string;
  description: string;
  features: PricingFeature[];
  ctaText: string;
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    title: 'Básico',
    price: '0 MZN',
    description: 'Para testar a plataforma e para negócios com baixo volume de conversas.',
    features: [
      { text: 'Até 500 mensagens' },
      { text: '1 conexão WhatsApp (1 empresa)' },
      { text: 'Dashboard simples: contador de mensagens, status da conexão' },
      { text: 'Aviso ao atingir 80% do limite de mensagens' },
    ],
    ctaText: 'Comece Grátis'
  },
  {
    title: 'Profissional',
    price: '2.499 MZN',
    description: 'A escolha ideal para empresas que buscam profissionalizar o atendimento e vender mais.',
    features: [
      { text: 'Até 5000 mensagens' },
      { text: '1 conexão WhatsApp (1 empresa)' },
      { text: 'Dashboard completo: Uso de mensagens em gráfico, Relatório básico de atendimentos' },
      { text: 'Aviso ao atingir 80% do limite de mensagens' },
      { text: 'Sem a nossa marca' },
      { text: 'Suporte Prioritário via Email' },
    ],
    ctaText: 'Escolher Plano Profissional',
    popular: true
  },
  {
    title: 'Business',
    price: '6.999 MZN',
    description: 'Para negócios que exigem o máximo de performance e um suporte personalizado.',
    features: [
      { text: 'Até 10000 mensagens' },
      { text: 'Até 3 conexões WhatsApp (3 empresas)' },
      { text: 'Dashboard avançado: Gráficos detalhados de uso, Relatórios exportáveis, Gestão de múltiplas empresas/conexões' },
      { text: 'Aviso ao atingir 80% do limite de mensagens' },
      { text: 'Onboarding Personalizado por vídeo-chamada' },
      { text: 'Suporte VIP direto via WhatsApp' },
    ],
    ctaText: 'Escolher Plano Business'
  }
];

const faqs = [
  {
    question: 'O que acontece se eu atingir o meu limite de mensagens?',
    answer: 'Não se preocupe, seu serviço não será interrompido. Nos planos Pro e Business, você poderá comprar pacotes de mensagens extras facilmente no seu dashboard a qualquer momento.'
  },
  {
    question: 'O Plano Gratuito é realmente grátis?',
    answer: 'Sim! É grátis para sempre, dentro dos limites. Não pedimos cartão de crédito para começar.'
  },
  {
    question: 'O que é o Onboarding Personalizado?',
    answer: 'No plano Business, nós agendamos uma chamada de vídeo com você para configurar toda a plataforma, treinar sua IA e garantir que você tenha o máximo de sucesso.'
  }
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Um plano para cada fase do seu negócio
          </h2>
          <p className="text-xl text-gray-600">
            Comece gratuitamente e faça o upgrade à medida que suas vendas e seu atendimento crescem.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.title}
              className={clsx(
                "relative rounded-2xl shadow-lg bg-white p-8",
                plan.popular 
                  ? "border-2 border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                  : "border border-gray-200"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <span className="inline-block bg-blue-500 text-white text-sm font-semibold py-2 px-4 rounded-full">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.title}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <p className="text-gray-600 mb-8">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/register`}
                className={clsx(
                  "w-full py-3 px-6 rounded-lg font-semibold transition-colors block text-center",
                  plan.popular 
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                )}
              >
                {plan.ctaText}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perguntas Comuns
          </h3>
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
