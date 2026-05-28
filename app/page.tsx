'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/AuthPage';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import TransactionList from '@/components/TransactionList';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<'dashboard' | 'transactions'>('dashboard');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-ink-400" size={28} />
    </div>
  );

  if (!user) return <AuthPage />;

  return (
    <Layout page={page} setPage={setPage}>
      {page === 'dashboard' ? <Dashboard /> : <TransactionList />}
    </Layout>
  );
}
