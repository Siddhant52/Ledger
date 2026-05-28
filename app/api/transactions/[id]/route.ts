import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_MAX_AGE, authCookieOptions, getSessionFromCookies } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromCookies();
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const transaction = await prisma.transaction.updateMany({
      where: { id, userId: session.user.id },
      data: {
        type: body.type,
        amount: body.amount ? parseFloat(body.amount) : undefined,
        category: body.category,
        description: body.description,
        date: body.date,
      },
    });

    if (transaction.count === 0)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.transaction.findUnique({ where: { id } });
    const res = NextResponse.json({ transaction: updated });
    if (session.accessToken) {
      res.cookies.set(ACCESS_TOKEN_COOKIE, session.accessToken, authCookieOptions(ACCESS_TOKEN_MAX_AGE));
    }
    return res;
  } catch (e) {
    console.error('PUT transaction error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromCookies();
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await prisma.transaction.deleteMany({ where: { id, userId: session.user.id } });
    const res = NextResponse.json({ ok: true });
    if (session.accessToken) {
      res.cookies.set(ACCESS_TOKEN_COOKIE, session.accessToken, authCookieOptions(ACCESS_TOKEN_MAX_AGE));
    }
    return res;
  } catch (e) {
    console.error('DELETE transaction error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
