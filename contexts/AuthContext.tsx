'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthUser { id: string; name: string; username: string; email: string; }
interface AuthCtx {
  user: AuthUser | null; loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string, confirmPassword: string) => Promise<string>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) { const d = await res.json(); setUser(d.user); }
      else setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (identifier: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || 'Login failed');
    setUser(d.user);
  };

  const register = async (name: string, username: string, email: string, password: string, confirmPassword: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password, confirmPassword }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || 'Registration failed');
    return d.message || 'Registration successful.';
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
