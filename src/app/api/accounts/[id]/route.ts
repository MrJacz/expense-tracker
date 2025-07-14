import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FinancialAccountDataService } from '@/lib/database/FinancialAccountDataService';
import { AssetType } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await FinancialAccountDataService.getAccountById(
      session.user.id,
      params.id
    );

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('GET /api/accounts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
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
    const { name, balance, isAsset, assetType } = body;

    // Validate asset type if provided
    if (assetType && !Object.values(AssetType).includes(assetType)) {
      return NextResponse.json(
        { error: 'Invalid asset type' },
        { status: 400 }
      );
    }

    const updateData = {
      ...(name && { name }),
      ...(balance !== undefined && { balance: parseFloat(balance) }),
      ...(isAsset !== undefined && { isAsset }),
      ...(assetType && { assetType })
    };

    const account = await FinancialAccountDataService.updateAccount(
      session.user.id,
      params.id,
      updateData
    );

    return NextResponse.json({ 
      account,
      message: 'Account updated successfully' 
    });
  } catch (error) {
    console.error('PUT /api/accounts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
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

    await FinancialAccountDataService.deleteAccount(
      session.user.id,
      params.id
    );

    return NextResponse.json({ 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('DELETE /api/accounts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}