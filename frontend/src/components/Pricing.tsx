'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import Cookies from 'js-cookie'; // Importar Cookies
import { PLANS, PlanDetails } from '@/config/plans'; // Importar configuração centralizada

const faqs = [
  {
    question: 'O que acontece se eu atingir o meu limite de mensagens?',
    answer: 'Não se preocupe, seu serviço não será interrompido. Nos planos Profissional e Enterprise, você poderá comprar pacotes de mensagens extras facilmente no seu dashboard a qualquer momento.'
  },
  {
    question: 'O Plano Básico é realmente grátis?',
    answer: 'Sim! É grátis para sempre, dentro dos limites. Não pedimos cartão de crédito para começar.'
  },
  {
    question: 'O que é o Onboarding Personalizado?',
    answer: 'No plano Enterprise, nós agendamos uma chamada de vídeo com você para configurar toda a plataforma, treinar sua IA e garantir que você tenha o máximo de sucesso.'
  }
];

export default function PricingSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!Cookies.get('access_token'));
  }, []);

  const getPlanLink = (planId: string) => {
    if (isLoggedIn) {
      if (planId === 'Básico') {
        return '/dashboard'; // Ou '/companies/new' se for o fluxo de criação de empresa
      }
      return `/billing?plan=${planId}`;
    }
    return '/register';
  };

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Um plano para cada fase do seu negócio
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Comece gratuitamente e faça o upgrade à medida que suas vendas e seu atendimento crescem.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={clsx(
                "relative rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-8 transition-all duration-300 hover:shadow-xl",
                plan.popular
                  ? "border-2 border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                  : "border border-gray-200 dark:border-gray-700"
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
                <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${plan.gradient} rounded-xl flex items-center justify-center`}>
                  <plan.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.priceDisplay}</span>
                  <span className="text-gray-500 dark:text-gray-400">/mês</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={getPlanLink(plan.id)}
                className={clsx(
                  "w-full py-3 px-6 rounded-lg font-semibold transition-colors block text-center",
                  plan.popular
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400"
                )}
              >
                {plan.ctaText}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Perguntas Comuns
          </h3>
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
