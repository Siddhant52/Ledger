'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import TransactionList from '@/components/TransactionList';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [page, setPage] = useState<'dashboard' | 'transactions'>('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-ink-400" size={28} />
    </div>
  );

  if (!user) return null;

  return (
    <Layout page={page} setPage={setPage}>
      {page === 'dashboard' ? <Dashboard /> : <TransactionList />}
    </Layout>
  );
}
