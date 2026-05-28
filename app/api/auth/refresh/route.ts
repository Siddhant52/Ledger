import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { compareHash, createRefreshToken, hashString, setAuthCookies, verifyRefreshToken } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh-token')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided.' }, { status: 401 });
    }

    const userId = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const valid = await compareHash(refreshToken, user.refreshToken);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
    };

    const newRefreshToken = createRefreshToken(authUser);
    const newRefreshHash = await hashString(newRefreshToken);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshHash } });

    const res = NextResponse.json({ user: authUser });
    await setAuthCookies(res, authUser, newRefreshToken);
    return res;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Unable to refresh session.' }, { status: 401 });
  }
}
