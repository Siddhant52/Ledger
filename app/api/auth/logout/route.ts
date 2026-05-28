import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookies, verifyRefreshToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh-token')?.value;
  if (refreshToken) {
    try {
      const userId = verifyRefreshToken(refreshToken);
      await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    } catch {
      // ignore invalid refresh token
    }
  }

  const res = NextResponse.json({ ok: true });
  await clearAuthCookies(res);
  return res;
}
