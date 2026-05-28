import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'finance-tracker-secret-key-change-in-production'
);

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ id: user.id, name: user.name, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
