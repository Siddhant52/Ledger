'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, username, email, password, confirmPassword);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-ink-800 rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="text-ink-100" size={28} />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Ledger</h1>
          <p className="text-ink-500 mt-1 text-sm">Your personal finance companion</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-xl shadow-ink-200/40 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-ink-800 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-ink-400 text-sm mb-6">
            {mode === 'login' ? 'Sign in to your account' : 'Start tracking your finances'}
          </p>

          {mode === 'register' && (
            <>
              <div className="mb-4">
                <label className="label">Full Name</label>
                <input className="input" placeholder="John Doe" value={name}
                  onChange={e => setName(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="label">Username</label>
                <input className="input" placeholder="siddhant123" value={username}
                  onChange={e => setUsername(e.target.value)} />
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          {mode === 'register' && (
            <div className="mb-6">
              <label className="label">Confirm Password</label>
              <input className="input" type="password" placeholder="••••••••" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 bg-coral-50 border border-coral-200 text-coral-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-ink-500 mt-5">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-ink-800 font-medium hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
