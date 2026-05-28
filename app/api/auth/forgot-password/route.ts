import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOpaqueToken, hashString, splitOpaqueToken } from '@/lib/auth';
import { sendResetPasswordEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();
    if (!identifier) {
      return NextResponse.json({ error: 'Email or username is required.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
      },
    });

    if (!user || !user.emailVerified) {
      return NextResponse.json({ message: 'If an account exists, a reset email has been sent.' });
    }

    const resetToken = createOpaqueToken(user.id);
    const parsed = splitOpaqueToken(resetToken);
    if (!parsed) {
      return NextResponse.json({ message: 'If an account exists, a reset email has been sent.' });
    }

    const resetHash = await hashString(parsed.secret);
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetHash,
        passwordResetTokenExpires: expires,
      },
    });

    await sendResetPasswordEmail(user.email, user.name, resetToken);
    return NextResponse.json({ message: 'If an account exists, a reset email has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Unable to send reset email.' }, { status: 500 });
  }
}
