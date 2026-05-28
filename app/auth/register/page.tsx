'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { validateEmail, validateName, validatePassword, validateUsername } from '@/lib/validators';

const criteria = [
  { label: 'At least 8 characters', key: 'length' },
  { label: 'Uppercase letter', key: 'upper' },
  { label: 'Lowercase letter', key: 'lower' },
  { label: 'Number', key: 'number' },
  { label: 'Special character', key: 'special' },
  { label: 'No spaces', key: 'spaces' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordState = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    spaces: !/\s/.test(password),
  }), [password]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const cleaned = username.trim().toLowerCase();
      const validation = validateUsername(cleaned);
      if (!cleaned) {
        setUsernameAvailable(null);
        setUsernameMessage('Choose a username.');
        return;
      }
      if (!validation.valid) {
        setUsernameAvailable(false);
        setUsernameMessage(validation.message);
        return;
      }

      try {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(cleaned)}`);
        const data = await response.json();
        setUsernameAvailable(data.available);
        setUsernameMessage(data.message);
      } catch {
        setUsernameAvailable(false);
        setUsernameMessage('Unable to validate username.');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          confirmPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed.');
      setSuccess(data.message || 'Registration successful. Check your email.');
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(circle at top, rgba(255,255,255,0.92), transparent 35%), linear-gradient(180deg, #f5f3ef 0%, #efe8dc 100%)',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-3xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-4">
            <div className="rounded-4xl bg-ink-900/95 p-8 text-ink-50 shadow-2xl shadow-ink-900/20 animate-slide-up">
              <p className="text-xs uppercase tracking-[0.3em] text-ink-300 mb-3">New account</p>
              <h1 className="text-4xl font-display font-semibold">Create your account</h1>
              <p className="mt-3 text-sm leading-7 text-ink-300">Secure signup, email verification, and protection for your financial data. Start with a strong password and a unique username.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-8 shadow-xl shadow-ink-100/50 animate-fade-in">
            <div className="grid gap-4">
              <div>
                <label className="label">Full Name</label>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" className="input" />
              </div>
              <div>
                <label className="label">Username</label>
                <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="john_doe123" className="input" />
                <p className={`mt-2 text-sm ${usernameAvailable ? 'text-sage-700' : 'text-coral-700'}`}>{usernameMessage}</p>
              </div>
              <div>
                <label className="label">Email</label>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" className="input" />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Create a password" className="input pr-12" />
                  <button type="button" onClick={() => setShowPassword((state) => !state)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" className="input pr-12" />
                  <button type="button" onClick={() => setShowConfirm((state) => !state)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-ink-50 p-4 border border-ink-100">
                <p className="text-sm font-medium text-ink-700 mb-3">Password requirements</p>
                <ul className="space-y-2 text-sm text-ink-500">
                  {criteria.map((item) => (
                    <li key={item.key} className={`${passwordState[item.key as keyof typeof passwordState] ? 'text-sage-700' : 'text-ink-400'}`}>
                      {passwordState[item.key as keyof typeof passwordState] ? '✓' : '•'} {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              {error ? <div className="rounded-3xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-700">{error}</div> : null}
              {success ? <div className="rounded-3xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">{success}</div> : null}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                Create account
              </button>

              <p className="text-center text-sm text-ink-500">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-ink-800 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
