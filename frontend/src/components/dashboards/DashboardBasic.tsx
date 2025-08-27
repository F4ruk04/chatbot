'use client';

import { useRouter } from 'next/navigation';
import { DashboardStats, CompanyStats } from '@/lib/api';
import { Building2, MessageSquare, TrendingUp, Users, Activity, BarChart3, LucideIcon } from 'lucide-react';
import SubscriptionStatusCard from '@/components/SubscriptionStatusCard';
import { Progress } from '@/components/ui/progress';

interface DashboardBasicProps {
  stats: DashboardStats;
  companiesStats: CompanyStats[];
}

export default function DashboardBasic({ stats, companiesStats }: DashboardBasicProps) {
  const router = useRouter();

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = "blue" 
  }: {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500'
    };

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value.toLocaleString()}
            </p>
          </div>
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const messageUsageWarning = stats.message_usage_percentage >= 80 && stats.message_usage_percentage < 100;
  const messageLimitExceeded = stats.message_usage_percentage >= 100;

  return (
    <main className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Básico
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visão geral simples das suas conexões e uso de mensagens.
        </p>
      </div>

      {/* Layout principal do Dashboard */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Coluna da esquerda para o SubscriptionStatusCard */}
        <div className="lg:w-1/4">
          <SubscriptionStatusCard />
        </div>

        {/* Coluna da direita para o restante do conteúdo */}
        <div className="flex-1 space-y-8">
          {/* Aviso de uso de mensagens */}
          {(messageUsageWarning || messageLimitExceeded) && (
            <div className={`rounded-xl p-4 ${messageLimitExceeded ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'}`}>
              <p className={`font-semibold ${messageLimitExceeded ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                {messageLimitExceeded ? 'Limite de Mensagens Atingido!' : 'Aviso: Uso de Mensagens Elevado!'}
              </p>
              <p className={`text-sm mt-1 ${messageLimitExceeded ? 'text-red-600 dark:text-red-300' : 'text-yellow-600 dark:text-yellow-300'}`}>
                Você usou {stats.message_usage_percentage}% ({stats.total_messages} de {stats.message_limit}) das suas mensagens.
                {messageLimitExceeded ? ' Faça upgrade para continuar usando o serviço.' : ' Considere fazer upgrade para um plano com mais mensagens.'}
              </p>
              <Progress value={stats.message_usage_percentage} className={`mt-3 h-2 ${messageLimitExceeded ? "bg-red-500" : "bg-yellow-500"}`} />
            </div>
          )}

          {/* Estatísticas principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <StatCard
              title="Conexões WhatsApp"
              value={`${stats.total_companies} / ${stats.company_limit}`}
              icon={Building2}
              color="blue"
            />
            <StatCard
              title="Mensagens Usadas"
              value={`${stats.total_messages} / ${stats.message_limit}`}
              icon={MessageSquare}
              color="green"
            />
            <StatCard
              title="Uso de Mensagens"
              value={`${stats.message_usage_percentage}%`}
              icon={TrendingUp}
              color="purple"
            />
          </div>

          {/* Banner de Upgrade */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h3 className="text-xl lg:text-2xl font-bold mb-2">
                  🚀 Desbloqueie todo o potencial do seu negócio
                </h3>
                <p className="text-blue-100 text-sm lg:text-base">
                  Upgrade para Pro ou Business e tenha acesso a mais mensagens, relatórios avançados e suporte prioritário.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/billing?plan=pro')}
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Fazer Upgrade</span>
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="border-2 border-white/30 text-white hover:bg-white/10 font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Ver Planos</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status da Conexão (Simples) */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status da Conexão WhatsApp
            </h3>
            {companiesStats.length > 0 ? (
              <div className="space-y-3">
                {companiesStats.map((company) => (
                  <div key={company.company_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <p className="text-gray-700 dark:text-gray-300">{company.company_name}</p>
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Conectado</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Nenhuma empresa conectada. Adicione uma empresa para ver o status.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
