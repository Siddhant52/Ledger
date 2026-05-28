import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const transaction = await prisma.transaction.updateMany({
      where: { id, userId: user.id },
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
    return NextResponse.json({ transaction: updated });
  } catch (e) {
    console.error('PUT transaction error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await prisma.transaction.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE transaction error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
