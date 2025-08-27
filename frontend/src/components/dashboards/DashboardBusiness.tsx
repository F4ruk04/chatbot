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
  FileText,
  Settings,
  LucideIcon
} from 'lucide-react';
import SubscriptionStatusCard from '@/components/SubscriptionStatusCard';
import { Progress } from '@/components/ui/progress';

interface DashboardBusinessProps {
  stats: DashboardStats;
  companiesStats: CompanyStats[];
}

export default function DashboardBusiness({ stats, companiesStats }: DashboardBusinessProps) {
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
      const data = await dashboardAPI.getMessagesChart(companyId, 30); // Last 30 days for detailed
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
          Dashboard Business
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visão geral avançada e gestão de múltiplas empresas.
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

          {/* Gráfico de atividade detalhado */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Uso de Mensagens Detalhado (Últimos 30 Dias)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Análise diária de mensagens enviadas e recebidas
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
              <div className="h-64 flex items-end justify-between space-x-1 text-xs">
                {messagesChartData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                      style={{ height: `${(data.message_count / maxChartValue) * 100}%` }}
                    ></div>
                    <span className="text-gray-500 dark:text-gray-400 mt-2 hidden md:block">
                      {new Date(data.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                    </span>
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {data.message_count} mensagens em {new Date(data.date).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                Nenhum dado de mensagem disponível para o gráfico detalhado.
              </div>
            )}
          </div>

          {/* Relatórios Exportáveis (Placeholder) */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Relatórios Exportáveis
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gere e exporte relatórios detalhados sobre o uso de mensagens, atendimentos e performance das suas empresas.
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200">
              <FileText className="mr-2 h-5 w-5" />
              Gerar Relatório
            </button>
          </div>

          {/* Gestão de Múltiplas Empresas/Conexões */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Gestão de Empresas
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gerencie todas as suas {stats.total_companies} conexões WhatsApp.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/companies')}
                      className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base"
                    >
                      <Settings className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Gerenciar Empresas
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
