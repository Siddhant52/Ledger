import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compareHash, createRefreshToken, hashString, setAuthCookies, splitOpaqueToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 });
    }

    const parsed = splitOpaqueToken(token);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid verification token.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
    if (!user || !user.emailVerificationToken || !user.emailVerificationTokenExpires) {
      return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified.' });
    }

    if (user.emailVerificationTokenExpires < new Date()) {
      return NextResponse.json({ error: 'Verification link has expired.' }, { status: 400 });
    }

    const valid = await compareHash(parsed.secret, user.emailVerificationToken);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });
    }

    const authUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      emailVerified: true,
    };

    const refreshToken = createRefreshToken(authUser);
    const refreshHash = await hashString(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
        refreshToken: refreshHash,
      },
    });

    const res = NextResponse.json({ user: authUser, message: 'Email verified successfully.' });
    await setAuthCookies(res, authUser, refreshToken);
    return res;
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Unable to verify email.' }, { status: 500 });
  }
}
