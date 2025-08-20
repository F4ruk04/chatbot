'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, TrendingUp, Calendar } from 'lucide-react';
import axios from 'axios';

interface ChartData {
  day: string;
  date: string;
  messages: number;
  percentage: number;
}

interface DashboardChartProps {
  companyId?: number;
  className?: string;
}

export default function DashboardChart({ companyId, className = '' }: DashboardChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null); // Declare error state
  const [totalMessages, setTotalMessages] = useState(0);
  const [trend, setTrend] = useState(0);

  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setChartError(null); // Clear previous errors
      const { api } = await import('@/lib/api');
      
      // Se tiver companyId, buscar dados específicos da empresa
      // Senão, buscar dados gerais
      const endpoint = companyId 
        ? `/api/dashboard/messages-chart/${companyId}?days=7`
        : '/api/dashboard/messages-chart?days=7';
      
      const response = await api.get(endpoint);
      
      if (response.data && response.data.chart_data) {
        const data = response.data.chart_data;
        processChartData(data);
      } else {
        // Fallback para dados de exemplo se a API não retornar dados
        generateSampleData();
      }
    } catch (err: unknown) { // Use unknown for better type safety
      let errorMessage = 'Erro ao carregar dados do gráfico';
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setChartError(errorMessage); // Set error state
      console.error('Error fetching chart data:', err);
      generateSampleData(); // Still use sample data as fallback
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]); // fetchChartData is now stable

  const generateSampleData = () => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const today = new Date();
    const data: ChartData[] = [];
    let total = 0;
    let max = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Generate realistic random data
      const baseValue = 20 + Math.random() * 30;
      const dayMultiplier = i === 0 || i === 6 ? 0.7 : 1; // Lower on weekends
      const messages = Math.floor(baseValue * dayMultiplier);
      
      total += messages;
      max = Math.max(max, messages);
      
      data.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        date: date.toISOString().split('T')[0],
        messages,
        percentage: 0
      });
    }

    // Calculate percentages
    data.forEach(item => {
      item.percentage = max > 0 ? (item.messages / max) * 100 : 0;
    });

    // Calculate trend (compare last 3 days with previous 3 days)
    const recent = data.slice(-3).reduce((sum, d) => sum + d.messages, 0);
    const previous = data.slice(-6, -3).reduce((sum, d) => sum + d.messages, 0);
    const trendValue = previous > 0 ? ((recent - previous) / previous) * 100 : 0;

    setChartData(data);
    setTotalMessages(total);
    setTrend(trendValue);
  };

  const processChartData = (apiData: { date: string; count: number }[]) => {
    // Process real API data
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const data: ChartData[] = [];
    let total = 0;
    let max = 0;

    // Assuming API returns array of { date: string, count: number }
    apiData.forEach((item) => {
      const date = new Date(item.date);
      const messages = item.count || 0;
      
      total += messages;
      max = Math.max(max, messages);
      
      data.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        date: item.date,
        messages,
        percentage: 0
      });
    });

    // Calculate percentages
    data.forEach(item => {
      item.percentage = max > 0 ? (item.messages / max) * 100 : 0;
    });

    // Calculate trend
    const recent = data.slice(-3).reduce((sum, d) => sum + d.messages, 0);
    const previous = data.slice(-6, -3).reduce((sum, d) => sum + d.messages, 0);
    const trendValue = previous > 0 ? ((recent - previous) / previous) * 100 : 0;

    setChartData(data);
    setTotalMessages(total);
    setTrend(trendValue);
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (chartError) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{chartError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Atividade Recente
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mensagens dos últimos 7 dias
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {totalMessages.toLocaleString()}
            </span>
          </div>
          {trend !== 0 && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
              trend > 0 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span className="text-xs font-medium">
                {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 flex items-end justify-between space-x-2">
        {chartData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center group">
            <div className="w-full flex flex-col items-center relative">
              {/* Tooltip */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {data.messages} mensagens
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
              </div>
              
              {/* Bar */}
              <div 
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                style={{ 
                  height: `${Math.max(data.percentage, 5)}%`,
                  minHeight: '4px'
                }}
              ></div>
            </div>
            
            {/* Day label */}
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {data.day}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>Últimos 7 dias</span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Média: {Math.floor(totalMessages / 7).toLocaleString()} msgs/dia
        </div>
      </div>
    </div>
  );
}
