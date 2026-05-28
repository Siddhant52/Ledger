'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { Transaction, FilterOptions, Category, TransactionType } from '@/lib/types';
import { getCategoryMeta, INCOME_CATEGORIES, EXPENSE_CATEGORIES, ALL_CATEGORIES } from '@/lib/constants';
import { format } from 'date-fns';
import { Search, Filter, Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, X, Loader2 } from 'lucide-react';
import TransactionModal from './TransactionModal';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TransactionList() {
  const { transactions, fetchTransactions, deleteTransaction, loading } = useTransactions();
  const [showModal, setShowModal] = useState(false);
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ type: 'all', category: 'all' });
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => fetchTransactions(filters), [fetchTransactions, filters]);
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try { await deleteTransaction(id); setDeleteId(null); }
    finally { setDeleting(false); }
  };

  const clearFilters = () => setFilters({ type: 'all', category: 'all', dateFrom: '', dateTo: '', search: '' });
  const hasFilters = filters.type !== 'all' || filters.category !== 'all' ||
    filters.dateFrom || filters.dateTo || filters.search;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Transactions</h2>
          <p className="text-ink-400 text-sm mt-0.5">{transactions.length} records found</p>
        </div>
        <button onClick={() => { setEditTxn(null); setShowModal(true); }} className="btn-primary">
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" placeholder="Search transactions..."
              value={filters.search || ''} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className={`btn-ghost border border-[var(--border)] ${showFilters ? 'bg-ink-100' : ''}`}>
            <Filter size={15} /> Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-coral-500" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-coral-600 border border-coral-200">
              <X size={15} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-[var(--border)] animate-slide-up">
            <div>
              <label className="label">Type</label>
              <select className="input" value={filters.type}
                onChange={e => setFilters(f => ({ ...f, type: e.target.value as TransactionType | 'all', category: 'all' }))}>
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={filters.category}
                onChange={e => setFilters(f => ({ ...f, category: e.target.value as Category | 'all' }))}>
                <option value="all">All Categories</option>
                {(filters.type === 'income' ? INCOME_CATEGORIES : filters.type === 'expense' ? EXPENSE_CATEGORIES : ALL_CATEGORIES)
                  .map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">From</label>
              <input className="input" type="date" value={filters.dateFrom || ''}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
            </div>
            <div>
              <label className="label">To</label>
              <input className="input" type="date" value={filters.dateTo || ''}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-ink-400" size={24} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-ink-300 text-sm">No transactions found</p>
            <button onClick={() => { setEditTxn(null); setShowModal(true); }}
              className="btn-primary mt-4 mx-auto">
              <Plus size={15} /> Add First Transaction
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {transactions.map((t, i) => {
              const meta = getCategoryMeta(t.category);
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-4 hover:bg-ink-50/50 transition-colors group"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0
                      ${t.type === 'income' ? 'bg-sage-100' : 'bg-coral-100'}`}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`badge ${t.type === 'income' ? 'bg-sage-100 text-sage-700' : 'bg-ink-100 text-ink-500'}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-ink-400">{format(new Date(t.date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <div className={`flex items-center gap-1 font-mono text-sm font-semibold
                      ${t.type === 'income' ? 'text-sage-600' : 'text-coral-600'}`}>
                      {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {fmt(t.amount)}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditTxn(t); setShowModal(true); }}
                        className="p-1.5 hover:bg-ink-100 rounded-lg text-ink-400 hover:text-ink-700 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteId(t.id)}
                        className="p-1.5 hover:bg-coral-100 rounded-lg text-ink-400 hover:text-coral-600 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <TransactionModal transaction={editTxn} onClose={() => { setShowModal(false); setEditTxn(null); }} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm animate-fade-in">
          <div className="card p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h3 className="font-display text-lg font-semibold text-ink-800 mb-2">Delete Transaction?</h3>
            <p className="text-ink-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting}
                className="flex-1 justify-center bg-coral-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium
                  hover:bg-coral-700 active:scale-95 transition-all inline-flex items-center gap-2">
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
