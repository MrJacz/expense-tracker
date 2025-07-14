import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { importCSVData } from '@/lib/integrations/csv';
import { CsvImportConfig } from '@/types/integrations';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { csvData, config } = await request.json();
    
    if (!csvData || !config) {
      return NextResponse.json({ error: 'CSV data and configuration required' }, { status: 400 });
    }

    // Validate the configuration
    const csvConfig: CsvImportConfig = {
      accountId: config.accountId,
      columnMapping: {
        date: config.columnMapping.date,
        description: config.columnMapping.description,
        amount: config.columnMapping.amount,
        category: config.columnMapping.category
      },
      dateFormat: config.dateFormat || 'auto',
      hasHeader: config.hasHeader !== false, // Default to true
      delimiter: config.delimiter || ','
    };

    // Check if the account exists and belongs to the user
    const account = await prisma.financialAccount.findFirst({
      where: {
        id: csvConfig.accountId,
        userId: session.user.id
      }
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found or not accessible' }, { status: 404 });
    }

    const result = await importCSVData(csvData, csvConfig, session.user.id, prisma);
    
    return NextResponse.json({
      success: true,
      result: {
        imported: result.imported,
        total: result.transactions.length,
        errors: result.errors,
        warnings: result.warnings
      }
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV data' },
      { status: 500 }
    );
  }
}