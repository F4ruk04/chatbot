'use client';

import { useState, useEffect } from 'react';
import { subscriptionsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string;
}

export default function SubscriptionStatusCard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const data = await subscriptionsAPI.getStatus();
        if (data) {
          setSubscription(data);
        } else {
          setSubscription(null);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load subscription details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []); // O array de dependências vazio garante que isso rode apenas uma vez.

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-2">
            <p>Plan: <span className="font-semibold">{subscription.plan}</span></p>
            <p>Status: <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>{subscription.status}</Badge></p>
            <p>Renews on: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
          </div>
        ) : (
          <p>No active subscription found.</p>
        )}
      </CardContent>
    </Card>
  );
}
