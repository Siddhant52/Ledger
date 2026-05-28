import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createRefreshToken, hashString, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email or username and password are required.' }, { status: 400 });
    }

    const normalized = String(identifier).trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalized }, { username: normalized }],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Email not verified.' }, { status: 403 });
    }

    const authUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
    };

    const refreshToken = createRefreshToken(authUser);
    const refreshHash = await hashString(refreshToken);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refreshHash } });

    const res = NextResponse.json({ user: authUser });
    await setAuthCookies(res, authUser, refreshToken);
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
