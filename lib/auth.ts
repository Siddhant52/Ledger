import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerified: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || 'finance-tracker-secret-key-change-in-production';
const ISSUER = 'finance-tracker';
const AUDIENCE = 'finance-tracker-app';
export const ACCESS_TOKEN_COOKIE = 'access-token';
export const REFRESH_TOKEN_COOKIE = 'refresh-token';
export const ACCESS_TOKEN_MAX_AGE = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  };
}

export function createAccessToken(user: AuthUser) {
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email, username: user.username, type: 'access' },
    JWT_SECRET,
    {
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: ACCESS_TOKEN_MAX_AGE,
    },
  );
}

export function createRefreshToken(user: AuthUser) {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    JWT_SECRET,
    {
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: REFRESH_TOKEN_MAX_AGE,
    },
  );
}

export function verifyAccessToken(token: string) {
  const payload = jwt.verify(token, JWT_SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as JwtPayload;
  if (!payload || payload.type !== 'access' || typeof payload.sub !== 'string') {
    throw new Error('Invalid access token');
  }
  return {
    id: payload.sub,
    name: payload.name as string,
    email: payload.email as string,
    username: payload.username as string,
    emailVerified: true,
  } as AuthUser;
}

export function verifyRefreshToken(token: string) {
  const payload = jwt.verify(token, JWT_SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as JwtPayload;
  if (!payload || payload.type !== 'refresh' || typeof payload.sub !== 'string') {
    throw new Error('Invalid refresh token');
  }
  return payload.sub;
}

export function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function hashString(value: string) {
  return bcrypt.hash(value, 10);
}

export async function compareHash(value: string, hash: string | null | undefined) {
  if (!hash) return false;
  return bcrypt.compare(value, hash);
}

export function createOpaqueToken(userId: string) {
  return `${userId}.${crypto.randomBytes(32).toString('hex')}`;
}

export function splitOpaqueToken(token: string) {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  return { userId: parts[0], secret: parts[1] };
}

export async function clearAuthCookies(res: any) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...authCookieOptions(0), maxAge: 0 });
  res.cookies.set(REFRESH_TOKEN_COOKIE, '', { ...authCookieOptions(0), maxAge: 0 });
}

export async function setAuthCookies(res: any, user: AuthUser, refreshToken: string) {
  const accessToken = createAccessToken(user);
  const refreshCookie = refreshToken;
  res.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, authCookieOptions(ACCESS_TOKEN_MAX_AGE));
  res.cookies.set(REFRESH_TOKEN_COOKIE, refreshCookie, authCookieOptions(REFRESH_TOKEN_MAX_AGE));
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    try {
      return { user: verifyAccessToken(accessToken) };
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name !== 'TokenExpiredError') return { user: null };
    }
  }

  if (!refreshToken) return { user: null };

  try {
    const userId = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) return { user: null };
    const refreshMatches = await compareHash(refreshToken, user.refreshToken);
    if (!refreshMatches) return { user: null };

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
    };

    const newAccessToken = createAccessToken(authUser);
    return { user: authUser, accessToken: newAccessToken };
  } catch {
    return { user: null };
  }
}
