import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const token = await signToken({ id: user.id, name: user.name, email: user.email });
    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set('auth-token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
