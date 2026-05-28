'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token missing.');
      return;
    }

    async function verify() {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to verify email.');
        setStatus('success');
        setMessage(data.message || 'Email verified successfully. Redirecting to dashboard...');
        setTimeout(() => router.push('/'), 2600);
      } catch (error: unknown) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Unable to verify email.');
      }
    }

    verify();
  }, [token, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at top, rgba(255,255,255,0.92), transparent 35%), linear-gradient(180deg, #f5f3ef 0%, #efe8dc 100%)',
      }}
    >
      <div className="w-full max-w-lg">
        <div className="card p-8 shadow-xl shadow-ink-100/40 animate-fade-in">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-ink-500">Email verification</p>
              <h1 className="mt-3 text-3xl font-display font-semibold text-ink-900">Verify your account</h1>
            </div>
            <div className="rounded-3xl bg-sage-50 px-3 py-2 text-sm font-semibold text-sage-700">{status === 'loading' ? 'Pending' : status === 'success' ? 'Success' : 'Error'}</div>
          </div>

          <div className="space-y-4">
            <p className="text-sm leading-7 text-ink-600">{message}</p>
            {status === 'loading' ? (
              <div className="flex items-center gap-2 text-ink-500">
                <Loader2 className="animate-spin" size={18} /> Checking token...
              </div>
            ) : null}
            {status === 'error' ? (
              <div className="rounded-3xl border border-coral-200 bg-coral-50 p-4 text-sm text-coral-700">
                The verification link may have expired or already been used.
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/auth/login" className="btn-ghost w-full text-center sm:w-auto">Back to login</Link>
              <Link href="/auth/register" className="btn-primary w-full justify-center py-3 sm:w-auto">Create account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
