import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_MAX_AGE, authCookieOptions, getSessionFromCookies } from '@/lib/auth';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = NextResponse.json({ user: session.user });
  if (session.accessToken) {
    res.cookies.set(ACCESS_TOKEN_COOKIE, session.accessToken, authCookieOptions(ACCESS_TOKEN_MAX_AGE));
  }

  return res;
}
