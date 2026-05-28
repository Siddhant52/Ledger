import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { userId: user.id };
    if (type && type !== 'all') where.type = type;
    if (category && category !== 'all') where.category = category;
    if (search) where.description = { contains: search, mode: 'insensitive' };
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, string>).gte = dateFrom;
      if (dateTo) (where.date as Record<string, string>).lte = dateTo;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ transactions });
  } catch (e) {
    console.error('GET transactions error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, amount, category, description, date } = await req.json();
    if (!type || !amount || !category || !description || !date)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type,
        amount: parseFloat(amount),
        category,
        description,
        date,
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (e) {
    console.error('POST transaction error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
