import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FinancialAccountDataService } from '@/lib/database/FinancialAccountDataService';
import { AccountType, AssetType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as AccountType | null;
    const isAsset = searchParams.get('isAsset') === 'true' ? true : 
                    searchParams.get('isAsset') === 'false' ? false : undefined;
    const sortBy = searchParams.get('sortBy') as 'name' | 'balance' | 'createdAt' | null;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

    const filters = {
      ...(type && { type }),
      ...(isAsset !== undefined && { isAsset }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    };

    const accounts = await FinancialAccountDataService.getAccounts(session.user.id, filters);

    return NextResponse.json({ 
      accounts,
      count: accounts?.length || 0 
    });
  } catch (error) {
    console.error('GET /api/accounts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
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
    const { name, type, balance, isAsset, assetType, apiSource, apiIdentifier } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Validate account type
    if (!Object.values(AccountType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      );
    }

    // Validate asset type if provided
    if (assetType && !Object.values(AssetType).includes(assetType)) {
      return NextResponse.json(
        { error: 'Invalid asset type' },
        { status: 400 }
      );
    }

    const accountData = {
      name,
      type,
      balance: balance ? parseFloat(balance) : 0,
      isAsset: isAsset || false,
      assetType,
      apiSource,
      apiIdentifier
    };

    const account = await FinancialAccountDataService.createAccount(session.user.id, accountData);

    return NextResponse.json({ 
      account,
      message: 'Account created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/accounts error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}