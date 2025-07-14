import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FinancialAccountDataService } from '@/lib/database/FinancialAccountDataService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const netWorthData = await FinancialAccountDataService.getNetWorth(session.user.id);

    return NextResponse.json(netWorthData);
  } catch (error) {
    console.error('GET /api/accounts/net-worth error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate net worth' },
      { status: 500 }
    );
  }
}