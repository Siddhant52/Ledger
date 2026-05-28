import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateUsername } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const username = String(new URL(req.url).searchParams.get('username') || '').trim();
  if (!username) {
    return NextResponse.json({ available: false, message: 'Enter a username.' }, { status: 400 });
  }

  const validation = validateUsername(username);
  if (!validation.valid) {
    return NextResponse.json({ available: false, message: validation.message });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ available: false, message: 'Username is already taken.' });
  }

  return NextResponse.json({ available: true, message: 'Username is available.' });
}
