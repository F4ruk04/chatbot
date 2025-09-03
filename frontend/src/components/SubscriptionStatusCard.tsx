'use client';

import { useState, useEffect } from 'react';
import { subscriptionsAPI, dashboardAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, DollarSign, Calendar, AlertTriangle, Info, LucideIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Subscription {
  plan: string;
  status: string;
  messages_used: number;
  messages_quota: number;
  usage_percent: number;
  days_remaining: number;
  renewal_date: string;
  warning_level: 'LOW' | 'MEDIUM' | 'HIGH';
  // Adicionar campos para sincronização com dashboard
  total_messages?: number;
  message_usage_percentage?: number;
}

// Define plan details with colors and icons
const planDetails: { [key: string]: { color: string; icon: LucideIcon; gradient: string } } = {
  Básico: { color: 'bg-gray-500', icon: MessageCircle, gradient: 'from-gray-500 to-gray-600' },
  Profissional: { color: 'bg-blue-500', icon: DollarSign, gradient: 'from-blue-500 to-blue-600' },
  Business: { color: 'bg-purple-500', icon: Calendar, gradient: 'from-purple-500 to-purple-600' }, // Alterado de "Enterprise" para "Business"
  // Add other plans if necessary
};

export default function SubscriptionStatusCard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar dados da subscription e do dashboard simultaneamente
        const [subscriptionData, dashboardData] = await Promise.all([
          subscriptionsAPI.getStatus(),
          dashboardAPI.getStats()
        ]);

        if (subscriptionData) {
          // Combinar dados: usar métricas reais do dashboard mas manter dados da subscription
          const combinedData = {
            ...subscriptionData,
            messages_used: dashboardData?.total_messages || subscriptionData.messages_used,
            usage_percent: dashboardData?.message_usage_percentage || subscriptionData.usage_percent
          };
          setSubscription(combinedData);
        } else {
          setSubscription(null);
        }

        setDashboardStats(dashboardData);
        setError(null);
      } catch (err) {
        setError('Failed to load subscription details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // O array de dependências vazio garante que isso rode apenas uma vez.

  const currentPlanDetail = subscription ? planDetails[subscription.plan] : null;
  const PlanIcon = currentPlanDetail?.icon || Info; // Default icon if plan not found

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-lg p-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-5 w-full bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="bg-red-100 dark:bg-red-900/20 rounded-t-lg p-4">
          <CardTitle className="text-lg font-semibold text-red-700 dark:text-red-400">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      <CardHeader
        className={`relative p-4 text-white ${currentPlanDetail?.gradient || 'from-gray-700 to-gray-800'} bg-gradient-to-br`}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/images/pattern.svg)', backgroundSize: 'cover' }}></div>
        <div className="relative z-10 flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Subscription Status
          </CardTitle>
          <PlanIcon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                {subscription.plan} Plan
              </h3>
              <Badge
                variant={subscription.status === 'active' ? 'default' : 'secondary'}
                className={`capitalize px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active'
                    ? 'bg-green-500 text-white dark:bg-green-600'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {subscription.status}
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Messages Used */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Messages Used
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {subscription.messages_used} / {subscription.messages_quota}
                  </p>
                </div>
                <Progress value={subscription.usage_percent} className="w-full h-2.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  {subscription.usage_percent.toFixed(1)}% used
                </p>
              </div>

              {/* Days Remaining */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Days Remaining
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {subscription.days_remaining} days
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  Renews on: {new Date(subscription.renewal_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {subscription.warning_level === 'HIGH' && (
              <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-3 rounded-md" role="alert">
                <p className="font-bold flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" /> Warning!
                </p>
                <p>You are almost out of messages. Consider upgrading your plan.</p>
              </div>
            )}
            {subscription.warning_level === 'MEDIUM' && (
              <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-400 p-3 rounded-md" role="alert">
                <p className="font-bold flex items-center">
                  <Info className="h-5 w-5 mr-2" /> Heads up!
                </p>
                <p>You've used a significant portion of your messages. Keep an eye on your usage.</p>
              </div>
            )}

            <Link
              href="/billing"
              className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Manage Subscription <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400 space-y-4">
            <p>No active subscription found. Please choose a plan to get started!</p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800"
            >
              View Plans <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
