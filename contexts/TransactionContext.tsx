'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Transaction, FilterOptions } from '@/lib/types';

interface TxnCtx {
  transactions: Transaction[]; loading: boolean;
  fetchTransactions: (filters?: FilterOptions) => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const Ctx = createContext<TxnCtx | null>(null);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async (filters?: FilterOptions) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
      if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.set('dateTo', filters.dateTo);
      if (filters?.search) params.set('search', filters.search);
      const res = await fetch(`/api/transactions?${params}`);
      if (res.ok) { const d = await res.json(); setTransactions(d.transactions); }
    } finally { setLoading(false); }
  }, []);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    const res = await fetch('/api/transactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    await fetchTransactions();
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    await fetchTransactions();
  };

  const deleteTransaction = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <Ctx.Provider value={{ transactions, loading, fetchTransactions, addTransaction, updateTransaction, deleteTransaction }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTransactions outside TransactionProvider');
  return ctx;
}
