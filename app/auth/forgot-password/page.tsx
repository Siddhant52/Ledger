'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send reset email.');
      setMessage(data.message || 'If an account exists, a reset email has been sent.');
      setIdentifier('');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unable to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at top, rgba(255,255,255,0.92), transparent 35%), linear-gradient(180deg, #f5f3ef 0%, #efe8dc 100%)',
      }}
    >
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-xl shadow-ink-100/40 animate-slide-up">
          <p className="text-xs uppercase tracking-[0.25em] text-ink-500 mb-3">Password recovery</p>
          <h1 className="text-3xl font-display font-semibold text-ink-900">Forgot your password?</h1>
          <p className="mt-3 text-sm text-ink-500">Enter your email or username and we'll send a reset link if your account exists.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label">Email or Username</label>
              <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="input" placeholder="you@example.com or john_doe" />
            </div>

            {error ? <div className="rounded-3xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-700">{error}</div> : null}
            {message ? <div className="rounded-3xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">{message}</div> : null}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Loader2 className="animate-spin" size={16} /> : null}
              Send reset link
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Remembered your password?{' '}
            <Link href="/auth/login" className="font-semibold text-ink-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
