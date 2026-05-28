'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { validatePassword } from '@/lib/validators';

const criteria = [
  { label: 'At least 8 characters', key: 'length' },
  { label: 'Uppercase letter', key: 'upper' },
  { label: 'Lowercase letter', key: 'lower' },
  { label: 'Number', key: 'number' },
  { label: 'Special character', key: 'special' },
  { label: 'No spaces', key: 'spaces' },
];

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) setError('Reset token missing or invalid.');
  }, [token]);

  const passwordState = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    spaces: !/\s/.test(password),
  }), [password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to reset password.');
      setSuccess(data.message || 'Password reset successfully. Redirecting to login...');
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unable to reset password.');
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
        <div className="card p-8 shadow-xl shadow-ink-100/40 animate-fade-in">
          <p className="text-xs uppercase tracking-[0.25em] text-ink-500 mb-3">Reset password</p>
          <h1 className="text-3xl font-display font-semibold text-ink-900">Create a new password</h1>
          <p className="mt-3 text-sm text-ink-500">Enter a secure new password and confirm it below.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label">New password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((state) => !state)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm password</label>
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type={showConfirm ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowConfirm((state) => !state)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-ink-50 p-4 border border-ink-100">
              <ul className="space-y-2 text-sm text-ink-500">
                {criteria.map((item) => (
                  <li key={item.key} className={`${passwordState[item.key as keyof typeof passwordState] ? 'text-sage-700' : 'text-ink-400'}`}>
                    {passwordState[item.key as keyof typeof passwordState] ? '✓' : '•'} {item.label}
                  </li>
                ))}
              </ul>
            </div>

            {password && confirmPassword && password !== confirmPassword ? (
              <div className="rounded-3xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-700">Passwords do not match.</div>
            ) : null}
            {error ? <div className="rounded-3xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-700">{error}</div> : null}
            {success ? <div className="rounded-3xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">{success}</div> : null}

            <button type="submit" disabled={loading || !token} className="btn-primary w-full justify-center py-3">
              {loading ? <Loader2 className="animate-spin" size={16} /> : null}
              Reset password
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            <Link href="/auth/login" className="font-semibold text-ink-900 hover:underline">
              Return to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
