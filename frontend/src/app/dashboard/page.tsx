/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import { dashboardAPI, DashboardStats, CompanyStats } from '@/lib/api';
import DashboardBasic from '@/components/dashboards/DashboardBasic';
import DashboardProfessional from '@/components/dashboards/DashboardProfessional';
import DashboardBusiness from '@/components/dashboards/DashboardBusiness';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [companiesStats, setCompaniesStats] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, compStats] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getCompaniesStats(),
      ]);
      
      setStats(dashboardStats);
      setCompaniesStats(compStats);
    } catch (err: Error | unknown) {
      setError('Erro ao carregar dados do dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <AuthGuard>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </AuthGuard>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <AuthGuard>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="text-red-700 dark:text-red-400">{error}</div>
          </div>
        </AuthGuard>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <AuthGuard>
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            Nenhum dado de dashboard disponível.
          </div>
        </AuthGuard>
      </Layout>
    );
  }

  const renderDashboard = () => {
    switch (stats.user_plan) {
      case 'Básico':
        return <DashboardBasic stats={stats} companiesStats={companiesStats} />;
      case 'Profissional':
        return <DashboardProfessional stats={stats} companiesStats={companiesStats} />;
      case 'Business':
        return <DashboardBusiness stats={stats} companiesStats={companiesStats} />;
      default:
        return (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            Plano desconhecido: {stats.user_plan}. Não é possível renderizar o dashboard.
          </div>
        );
    }
  };

  return (
    <Layout>
      <AuthGuard>
        {renderDashboard()}
      </AuthGuard>
    </Layout>
  );
}
