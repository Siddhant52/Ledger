'use client';
import { useEffect, useMemo } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getCategoryMeta, CATEGORY_COLORS } from '@/lib/constants';
import { Category } from '@/lib/types';

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: React.ElementType;
  color: 'green' | 'red' | 'gold'; sub?: string;
}) {
  const colorMap = {
    green: 'bg-sage-50 text-sage-700 border-sage-200',
    red: 'bg-coral-50 text-coral-700 border-coral-200',
    gold: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-ink-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
          <Icon size={15} />
        </div>
      </div>
      <div className="font-display text-2xl font-bold text-ink-800">{value}</div>
      {sub && <div className="text-xs text-ink-400 mt-1">{sub}</div>}
    </div>
  );
}

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Dashboard() {
  const { transactions, fetchTransactions } = useTransactions();
  const { user } = useAuth();

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  const thisMonth = useMemo(() =>
    transactions.filter(t => t.date >= monthStart && t.date <= monthEnd),
    [transactions, monthStart, monthEnd]);

  const totalIncome = useMemo(() =>
    thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [thisMonth]);

  const totalExpense = useMemo(() =>
    thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [thisMonth]);

  const balance = totalIncome - totalExpense;

  // Expense by category for pie
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonth.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([cat, value]) => ({
      name: getCategoryMeta(cat as Category).label,
      value,
      color: CATEGORY_COLORS[cat as Category],
    })).sort((a, b) => b.value - a.value);
  }, [thisMonth]);

  // Last 7 transactions
  const recent = useMemo(() => transactions.slice(0, 7), [transactions]);

  // Monthly bar chart: last 6 months
  const monthlyData = useMemo(() => {
    const months: { label: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = format(startOfMonth(d), 'yyyy-MM-dd');
      const end = format(endOfMonth(d), 'yyyy-MM-dd');
      const inRange = transactions.filter(t => t.date >= start && t.date <= end);
      months.push({
        label: format(d, 'MMM'),
        income: inRange.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: inRange.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  }, [transactions, now]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">
          Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
        </h2>
        <p className="text-ink-400 text-sm mt-0.5">{format(now, 'EEEE, MMMM d, yyyy')} · {format(now, 'MMMM yyyy')} overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Balance" value={fmt(balance)} icon={Wallet} color="gold"
          sub={balance >= 0 ? 'You\'re doing great' : 'Spending more than earning'} />
        <StatCard label="Income" value={fmt(totalIncome)} icon={TrendingUp} color="green"
          sub={`${thisMonth.filter(t => t.type === 'income').length} transactions`} />
        <StatCard label="Expenses" value={fmt(totalExpense)} icon={TrendingDown} color="red"
          sub={`${thisMonth.filter(t => t.type === 'expense').length} transactions`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart */}
        <div className="card p-5 lg:col-span-3">
          <h3 className="font-display text-base font-semibold text-ink-800 mb-4">6-Month Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={14} barGap={4}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9c8865' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#faf8f4', border: '1px solid #e8e3d9', borderRadius: 12, fontSize: 12 }}
                formatter={(v: unknown) => [fmt(v as number), '']}
              />
              <Bar dataKey="income" fill="#427d35" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#d93b1f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            {[{ color: '#427d35', label: 'Income' }, { color: '#d93b1f', label: 'Expense' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-ink-500">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-ink-800 mb-4">Expenses by Category</h3>
          {expenseByCategory.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-ink-300 text-sm">No expenses this month</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={expenseByCategory} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {expenseByCategory.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#faf8f4', border: '1px solid #e8e3d9', borderRadius: 10, fontSize: 11 }}
                    formatter={(v: unknown) => [fmt(v as number), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {expenseByCategory.slice(0, 4).map(e => (
                  <div key={e.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                      <span className="text-ink-600">{e.name}</span>
                    </div>
                    <span className="font-mono text-ink-500">{fmt(e.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-display text-base font-semibold text-ink-800">Recent Transactions</h3>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-ink-300 text-sm">No transactions yet. Add your first one!</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {recent.map(t => {
              const meta = getCategoryMeta(t.category);
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-ink-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-ink-800">{t.description}</p>
                      <p className="text-xs text-ink-400">{meta.label} · {format(new Date(t.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 font-mono text-sm font-medium
                    ${t.type === 'income' ? 'text-sage-600' : 'text-coral-600'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {fmt(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
