'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      router.push('/');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at top, rgba(255,255,255,0.9), transparent 40%), linear-gradient(180deg, #f5f3ef 0%, #efe8dc 100%)',
      }}
    >
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-4xl bg-ink-900 text-ink-50 shadow-xl shadow-ink-900/20 mb-4">
            FT
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-ink-500 mb-2">Secure finance tracker</p>
          <h1 className="text-4xl font-display font-semibold text-ink-900">Welcome back</h1>
          <p className="mt-3 text-sm text-ink-500">Sign in with your email or username to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 shadow-2xl shadow-ink-100/70 animate-slide-up">
          <div className="grid gap-4">
            <div>
              <label className="label">Email or Username</label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@example.com or john_doe"
                className="input"
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((state) => !state)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-3xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-700">{error}</div>
            ) : null}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Loader2 className="animate-spin" size={16} /> : null}
              Sign in
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm text-ink-500">
            <Link href="/auth/forgot-password" className="text-ink-700 hover:underline">Forgot password?</Link>
            <p className="text-center">
              New here?{' '}
              <Link href="/auth/register" className="font-semibold text-ink-900 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
