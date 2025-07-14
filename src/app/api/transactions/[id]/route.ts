import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TransactionDataService } from '@/lib/database/TransactionDataService';
import { TransactionType } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await TransactionDataService.getTransactionById(
      session.user.id,
      params.id
    );

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('GET /api/transactions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, description, date, type, splits, notes } = body;

    // Validate transaction type if provided
    if (type && !Object.values(TransactionType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Validate splits if provided
    if (splits) {
      if (!Array.isArray(splits) || splits.length === 0) {
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
    }

    const updateData: any = {};
    if (accountId !== undefined) updateData.accountId = accountId;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (type !== undefined) updateData.type = type;
    if (notes !== undefined) updateData.notes = notes;
    if (splits !== undefined) {
      updateData.splits = splits.map((split: any) => ({
        amount: split.amount,
        categoryId: split.categoryId || null,
        notes: split.notes || null,
      }));
    }

    const transaction = await TransactionDataService.updateTransaction(
      session.user.id,
      params.id,
      updateData
    );

    return NextResponse.json({ 
      transaction,
      message: 'Transaction updated successfully' 
    });
  } catch (error) {
    console.error('PUT /api/transactions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await TransactionDataService.deleteTransaction(
      session.user.id,
      params.id
    );

    if (!success) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Transaction deleted successfully' 
    });
  } catch (error) {
    console.error('DELETE /api/transactions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}