import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TransactionDataService } from '@/lib/database/TransactionDataService';
import { TransactionType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type') as TransactionType | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') as 'date' | 'description' | 'amount' | null;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

    const filters = {
      ...(accountId && { accountId }),
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(search && { search }),
      page,
      limit,
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    };

    const result = await TransactionDataService.getTransactions(session.user.id, filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, description, date, type, splits } = body;

    // Validate required fields
    if (!accountId || !description || !date || !type) {
      return NextResponse.json(
        { error: 'Account ID, description, date, and type are required' },
        { status: 400 }
      );
    }

    // Validate transaction type
    if (!Object.values(TransactionType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Validate splits
    if (!splits || !Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json(
        { error: 'At least one split is required' },
        { status: 400 }
      );
    }

    // Validate each split
    for (const split of splits) {
      if (!split.amount || typeof split.amount !== 'number') {
        return NextResponse.json(
          { error: 'Each split must have a valid amount' },
          { status: 400 }
        );
      }
    }

    const transactionData = {
      accountId,
      description,
      date: new Date(date),
      type,
      splits: splits.map((split: any) => ({
        amount: split.amount,
        categoryId: split.categoryId || null,
        notes: split.notes || null,
      })),
    };

    const transaction = await TransactionDataService.createTransaction(
      session.user.id,
      transactionData
    );

    return NextResponse.json({ 
      transaction,
      message: 'Transaction created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}