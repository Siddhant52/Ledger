'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, LayoutDashboard, List, LogOut, Menu, X } from 'lucide-react';

interface Props {
  page: 'dashboard' | 'transactions';
  setPage: (p: 'dashboard' | 'transactions') => void;
  children: React.ReactNode;
}

export default function Layout({ page, setPage, children }: Props) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as const, label: 'Transactions', icon: List },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={`${mobile ? '' : 'hidden lg:flex'} flex-col h-full`}>
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-ink-800 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-ink-100" />
          </div>
          <span className="font-display font-bold text-ink-900 text-lg">Ledger</span>
        </div>

        <div className="space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setPage(id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${page === id
                  ? 'bg-ink-800 text-ink-50 shadow-sm'
                  : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800'}`}>
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto px-5 py-5 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center text-xs font-bold text-ink-100">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-800 truncate">{user?.name}</p>
            <p className="text-xs text-ink-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full btn-ghost text-coral-600 hover:bg-coral-50 justify-start">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 bg-[var(--surface)] border-r border-[var(--border)] fixed top-0 bottom-0 left-0">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-[var(--surface)] shadow-2xl flex flex-col animate-slide-up">
            <div className="flex justify-end p-4">
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-ink-100 rounded-lg">
                <X size={18} className="text-ink-500" />
              </button>
            </div>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-56 xl:ml-60">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[var(--surface)]/90 backdrop-blur border-b border-[var(--border)]">
          <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-ink-100 rounded-lg">
            <Menu size={18} className="text-ink-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-ink-800 rounded-md flex items-center justify-center">
              <TrendingUp size={12} className="text-ink-100" />
            </div>
            <span className="font-display font-bold text-ink-900">Ledger</span>
          </div>
          <div className="w-8" />
        </header>
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
