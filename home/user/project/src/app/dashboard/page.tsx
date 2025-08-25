'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import AuthGuard from '@/components/AuthGuard';
import SubscriptionStatusCard from '@/components/SubscriptionStatusCard';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import DashboardChart from '@/components/DashboardChart';
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
import { useFeatures } from '@/hooks/useFeatures';
import axios from 'axios';
import { dashboardAPI, DashboardStats, CompanyStats } from '@/lib/api';

export default function DashboardPage() {
  console.log('DashboardPage rendered'); // Log component render
  const router = useRouter();
  const { checkFeature, loading: featuresLoading } = useFeatures();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [companiesStats, setCompaniesStats] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => { // Wrap with useCallback
    try {
      setLoading(true);
      setError('');
      console.log('Dashboard: Loading dashboard data...');
      
      const [dashboardStats, compStats] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getCompaniesStats(),
      ]);
      
      console.log('Dashboard: Data loaded successfully:', { dashboardStats, compStats });
      setStats(dashboardStats);
      setCompaniesStats(compStats);
    } catch (err: unknown) {
      console.error('Dashboard: Error loading data:', err);
      let errorMessage = 'Erro ao carregar dados do dashboard';
      
      if (axios.isAxiosError(err)) {
        // Handle network errors first (when there's no response)
        if (!err.response) {
          if (err.code === 'NETWORK_ERROR') {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          } else {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          }
        }
        // Handle HTTP errors
        else {
          const response = err.response; // This helps TypeScript narrow the type
          if (response.data?.detail) {
            errorMessage = response.data.detail;
          } else if (response.status === 400) {
            errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
          } else if (response.status === 401) {
            errorMessage = 'Sessão expirada. Faça login novamente.';
          } else if (response.status >= 500) {
            errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
          }
          // Default fallback for other HTTP errors
          else {
            errorMessage = 'Erro ao carregar dados do dashboard. Tente novamente.';
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setStats, setCompaniesStats]); // Dependencies for useCallback

  useEffect(() => {
    console.log('DashboardPage useEffect [featuresLoading] triggered. featuresLoading:', featuresLoading);
    if (!featuresLoading) {
      loadDashboardData();
    }
  }, [featuresLoading, loadDashboardData]); // Add loadDashboardData to dependencies

  useEffect(() => {
    console.log('Dashboard: checkFeature("advanced_dashboard"):', checkFeature('advanced_dashboard'));
    console.log('Dashboard: checkFeature("reports"):', checkFeature('reports'));
  }, [checkFeature]); // Log feature flags when checkFeature changes

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = "blue" 
  }: {
    title: string;
    value: number;
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

  if (loading || featuresLoading) { // Show full page loading until all data is fetched
    return (
      <Layout>
        <AuthGuard>
          <div className="flex items-center justify-center h-screen"> {/* Use h-screen for full page loader */}
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando dados do dashboard...</p>
            </div>
          </div>
        </AuthGuard>
      </Layout>
    );
  }

  if (error) { // Show full page error if there's an error
    return (
      <Layout>
        <AuthGuard>
          <div className="flex items-center justify-center h-screen">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
              <div className="text-red-700 dark:text-red-400 text-lg font-medium mb-2">{error}</div>
              <button
                onClick={loadDashboardData} // Allow retrying data load
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </AuthGuard>
      </Layout>
    );
  }

  return (
    <Layout>
      <AuthGuard>
        <main className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Visão geral das suas empresas e estatísticas de mensagens
            </p>
          </div>

          {/* Status da Assinatura */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-1">
              <SubscriptionStatusCard />
            </div>
            
            {/* Dashboard Content based on plan */}
            {null /* console.log('Dashboard: checkFeature("advanced_dashboard"):', checkFeature('advanced_dashboard')) */}
            {checkFeature('advanced_dashboard') ? (
              <>
                {/* Estatísticas principais */}
                <div className="xl:col-span-3">
                  {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                      <StatCard
                        title="Total de Empresas"
                        value={stats.total_companies}
                        icon={Building2}
                        color="blue"
                        trend="up"
                        trendValue="+12% este mês"
                      />
                      <StatCard
                        title="Total de Mensagens"
                        value={stats.total_messages}
                        icon={MessageSquare}
                        color="green"
                        trend="up"
                        trendValue="+8% esta semana"
                      />
                      <StatCard
                        title="Conversas Ativas"
                        value={stats.active_conversations}
                        icon={Users}
                        color="purple"
                        trend="up"
                        trendValue="+15% hoje"
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
                  )}
                </div>

                {/* Gráfico de atividade recente - Usando componente real */}
                <DashboardChart />

                {/* Cards de ação rápida (Relatórios) */}
                {null /* console.log('Dashboard: checkFeature("reports"):', checkFeature('reports')) */}
                {checkFeature('reports') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <Zap className="h-8 w-8" />
                        <ArrowUpRight className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Performance</h3>
                      <p className="text-blue-100 text-sm">
                        Monitore o desempenho dos seus chatbots em tempo real
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <Target className="h-8 w-8" />
                        <ArrowUpRight className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Objetivos</h3>
                      <p className="text-green-100 text-sm">
                        Defina e acompanhe metas para suas campanhas
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <BarChart3 className="h-8 w-8" />
                        <ArrowUpRight className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Relatórios</h3>
                      <p className="text-purple-100 text-sm">
                        Gere relatórios detalhados de suas atividades
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Basic Dashboard for Free Plan
              <div className="xl:col-span-3">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Dashboard Básico
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Seu plano Gratuito oferece uma visão geral simplificada.
                    Faça upgrade para acessar estatísticas avançadas, relatórios e muito mais!
                  </p>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Ver Planos de Upgrade
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lista de empresas (sempre visível) */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Suas Empresas
                  </h3>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Mensagens
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Conversas
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {companiesStats.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {company.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {company.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {company.messages_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {company.conversations_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Ativa
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </AuthGuard>
    </Layout>
  );
}