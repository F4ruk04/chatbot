'use client';

import { useEffect, useState } from 'react';
import { companiesAPI, Company } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Phone, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await companiesAPI.getAll();
        setCompanies(data);
        setError(null);
      } catch (err) {
        setError('Failed to load companies.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Companies</CardTitle>
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
        <CardTitle>Your Companies</CardTitle>
      </CardHeader>
      <CardContent>
        {companies.length > 0 ? (
          <ul className="space-y-4">
            {companies.map((company) => (
              <li key={company.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Building2 className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/companies/${company.id}`}>
                      <span className="font-semibold text-lg hover:underline cursor-pointer">{company.nome}</span>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{company.cnpj}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{company.telefone}</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{company.email}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No companies found.</p>
        )}
      </CardContent>
    </Card>
  );
}
