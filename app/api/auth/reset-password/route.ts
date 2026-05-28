import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { compareHash, hashString, splitOpaqueToken, createRefreshToken, setAuthCookies } from '@/lib/auth';
import { validatePassword } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const { token, password, confirmPassword } = await req.json();
    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
    }

    const parsed = splitOpaqueToken(token);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid reset token.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
    if (!user || !user.passwordResetToken || !user.passwordResetTokenExpires) {
      return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
    }

    if (user.passwordResetTokenExpires < new Date()) {
      return NextResponse.json({ error: 'Reset token has expired.' }, { status: 400 });
    }

    const valid = await compareHash(parsed.secret, user.passwordResetToken);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
    }

    const samePassword = await bcrypt.compare(password, user.password);
    if (samePassword) {
      return NextResponse.json({ error: 'New password cannot match the old password.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const refreshedUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
    };

    const refreshToken = createRefreshToken(refreshedUser);
    const refreshHash = await hashString(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpires: null,
        refreshToken: refreshHash,
      },
    });

    const res = NextResponse.json({ message: 'Password reset successfully.', user: refreshedUser });
    await setAuthCookies(res, refreshedUser, refreshToken);
    return res;
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Unable to reset password.' }, { status: 500 });
  }
}
