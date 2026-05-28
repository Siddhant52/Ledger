'use client';
import { useState, useEffect } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { Transaction, Category, TransactionType } from '@/lib/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/constants';
import { X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  transaction?: Transaction | null;
  onClose: () => void;
}

export default function TransactionModal({ transaction, onClose }: Props) {
  const { addTransaction, updateTransaction } = useTransactions();
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '');
  const [category, setCategory] = useState<Category>(transaction?.category ?? 'food');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [date, setDate] = useState(transaction?.date ?? format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (!transaction) {
      setCategory(type === 'income' ? 'salary' : 'food');
    }
  }, [type, transaction]);

  const handleSubmit = async () => {
    if (!amount || !description || !date) { setError('All fields required'); return; }
    setLoading(true); setError('');
    try {
      const data = { type, amount: parseFloat(amount), category, description, date };
      if (transaction) await updateTransaction(transaction.id, data);
      else await addTransaction(data);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error saving transaction');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md shadow-2xl shadow-ink-900/20 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="font-display text-lg font-semibold text-ink-800">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-ink-100 rounded-lg transition-colors">
            <X size={18} className="text-ink-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-[var(--border)] bg-ink-50">
            {(['expense', 'income'] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-2.5 text-sm font-medium capitalize transition-all
                  ${type === t
                    ? t === 'income'
                      ? 'bg-sage-600 text-white shadow-sm'
                      : 'bg-ink-800 text-white shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'}`}>
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Amount (₹)</label>
            <input className="input font-mono text-lg" type="number" min="0" step="0.01"
              placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value as Category)}>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="What was this for?" value={description}
              onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {error && <p className="text-coral-600 text-sm bg-coral-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {transaction ? 'Update' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
