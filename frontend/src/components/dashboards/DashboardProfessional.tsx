'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardAPI, DashboardStats, CompanyStats, MessageStats } from '@/lib/api';
import { 
  Building2, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Target,
  BarChart3,
  LucideIcon
} from 'lucide-react';
import SubscriptionStatusCard from '@/components/SubscriptionStatusCard';
import { Progress } from '@/components/ui/progress';

interface DashboardProfessionalProps {
  stats: DashboardStats;
  companiesStats: CompanyStats[];
}

export default function DashboardProfessional({ stats, companiesStats }: DashboardProfessionalProps) {
  const router = useRouter();
  const [messagesChartData, setMessagesChartData] = useState<MessageStats[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    if (companiesStats.length > 0) {
      loadMessagesChartData(companiesStats[0].company_id); // Load chart for the first company
    }
  }, [companiesStats]);

  const loadMessagesChartData = async (companyId: number) => {
    try {
      setLoadingChart(true);
      const data = await dashboardAPI.getMessagesChart(companyId, 7); // Last 7 days
      setMessagesChartData(data);
    } catch (err) {
      console.error('Erro ao carregar dados do gráfico de mensagens', err);
    } finally {
      setLoadingChart(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = "blue" 
  }: {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trend?: 'up' | 'down';
    trendValue?: string;
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
            {trend && trendValue && (
              <div className="flex items-center mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {trendValue}
                </span>
              </div>
            )}
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

  // Prepare chart data for display
  const chartValues = messagesChartData.map(data => data.message_count);
  const maxChartValue = Math.max(...chartValues, 1); // Avoid division by zero

  return (
    <main className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Profissional
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visão geral completa das suas empresas e estatísticas de mensagens.
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
              title="Total de Empresas"
              value={`${stats.total_companies} / ${stats.company_limit}`}
              icon={Building2}
              color="blue"
              trend="up"
              trendValue="+12% este mês" // Placeholder
            />
            <StatCard
              title="Total de Mensagens"
              value={`${stats.total_messages} / ${stats.message_limit}`}
              icon={MessageSquare}
              color="green"
              trend="up"
              trendValue="+8% esta semana" // Placeholder
            />
            <StatCard
              title="Conversas Ativas"
              value={stats.active_conversations}
              icon={Users}
              color="purple"
              trend="up"
              trendValue="+15% hoje" // Placeholder
            />
            <StatCard
              title="Mensagens Hoje"
              value={stats.messages_today}
              icon={Activity}
              color="orange"
            />
            <StatCard
              title="Esta Semana"
              value={stats.messages_this_week}
              icon={TrendingUp}
              color="indigo"
            />
            <StatCard
              title="Este Mês"
              value={stats.messages_this_month}
              icon={BarChart3}
              color="red"
            />
          </div>

          {/* Banner de Upgrade - Visível apenas para planos gratuitos */}
          {stats.user_plan === 'Básico' && (
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
          )}

          {/* Gráfico de atividade recente */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Uso de Mensagens (Últimos 7 Dias)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mensagens enviadas e recebidas
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Mensagens</span>
              </div>
            </div>
            {loadingChart ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : messagesChartData.length > 0 ? (
              <div className="h-64 flex items-end justify-between space-x-2">
                {messagesChartData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                      style={{ height: `${(data.message_count / maxChartValue) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(data.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                Nenhum dado de mensagem disponível para o gráfico.
              </div>
            )}
          </div>

          {/* Relatório Básico de Atendimentos (Placeholder) */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Relatório Básico de Atendimentos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aqui você verá um resumo dos atendimentos, como tempo médio de resposta e satisfação do cliente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio de Resposta</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">~5 min</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Satisfação do Cliente</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">85%</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              (Dados de exemplo. Funcionalidade real em desenvolvimento.)
            </p>
          </div>

          {/* Lista de empresas */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Suas Empresas
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Estatísticas das suas empresas registadas
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/companies')}
                      className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base"
                    >
                      <Building2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Ver Todas
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {companiesStats.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Nenhuma empresa registada
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Comece por adicionar a sua primeira empresa.
                      </p>
                      <button
                        onClick={() => router.push('/companies')}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <Building2 className="mr-2 h-5 w-5" />
                        Adicionar Empresa
                      </button>
                    </div>
                  ) : (
                    companiesStats.map((company) => (
                      <div
                        key={company.company_id}
                        className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => router.push('/companies')}
                      >
                        {/* Layout Mobile */}
                        <div className="block sm:hidden">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {company.company_name}
                              </h4>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {company.total_messages} mensagens
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Hoje:</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    {company.messages_today} mensagens
                                  </span>
                                </div>
                                {company.last_message_date && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Última:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {new Date(company.last_message_date).toLocaleDateString('pt-PT')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Layout Desktop */}
                        <div className="hidden sm:block">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {company.company_name}
                                </h4>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    {company.total_messages} mensagens totais
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Hoje: {company.messages_today}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {company.total_messages}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Total
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                  {company.messages_today}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Hoje
                                </div>
                              </div>
                              {company.last_message_date && (
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {new Date(company.last_message_date).toLocaleDateString('pt-PT')}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Última
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
        </div>
      </div>
    </main>
  );
}
