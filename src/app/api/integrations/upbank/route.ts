import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { createUPBankIntegration } from '@/lib/integrations';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 });
    }

    const integration = createUPBankIntegration(accessToken, prisma);
    const isConnected = await integration.testConnection();
    
    if (!isConnected) {
      return NextResponse.json({ error: 'Failed to connect to UP Bank' }, { status: 400 });
    }

    const accounts = await integration.getAccounts();
    
    return NextResponse.json({
      connected: true,
      accounts: accounts.length,
      accountsList: accounts
    });
  } catch (error) {
    console.error('UP Bank connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to UP Bank' },
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

    const { accessToken, syncOptions } = await request.json();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 });
    }

    const integration = createUPBankIntegration(accessToken, prisma);
    const result = await integration.syncData(session.user.id, syncOptions);
    
    return NextResponse.json({
      success: true,
      result: {
        accounts: result.accounts.length,
        transactions: result.transactions.length,
        newTransactions: result.newTransactions,
        updatedTransactions: result.updatedTransactions,
        errors: result.errors
      }
    });
  } catch (error) {
    console.error('UP Bank sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync UP Bank data' },
      { status: 500 }
    );
  }
}