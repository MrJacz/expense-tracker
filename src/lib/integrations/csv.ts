import { PrismaClient } from '@prisma/client';
import { BankIntegration, BankAccount, BankTransaction, SyncOptions, SyncResult, CsvImportConfig, CsvImportResult } from '@/types/integrations';
import { CATEGORIES } from '@/lib/constants';
import Papa from 'papaparse';

export class CSVIntegration implements BankIntegration {
  public readonly name = 'CSV Import';
  public readonly apiSource = 'csv_import';
  
  private prisma: PrismaClient;
  private csvData: string;
  private config: CsvImportConfig;

  constructor(csvData: string, config: CsvImportConfig, prisma: PrismaClient) {
    this.csvData = csvData;
    this.config = config;
    this.prisma = prisma;
  }

  async testConnection(): Promise<boolean> {
    try {
      const parsed = Papa.parse(this.csvData, {
        header: this.config.hasHeader,
        delimiter: this.config.delimiter,
        skipEmptyLines: true
      });
      
      return parsed.errors.length === 0 && parsed.data.length > 0;
    } catch (error) {
      console.error('CSV validation error:', error);
      return false;
    }
  }

  async getAccounts(): Promise<BankAccount[]> {
    // CSV imports are tied to a specific account
    const account = await this.prisma.financialAccount.findUnique({
      where: { id: this.config.accountId }
    });
    
    if (!account) {
      throw new Error(`Account ${this.config.accountId} not found`);
    }

    return [{
      id: account.id,
      name: account.name,
      type: account.type as BankAccount['type'],
      balance: parseFloat(account.balance.toString()),
      currency: 'AUD', // Default currency
      externalId: account.id,
      apiSource: this.apiSource
    }];
  }

  async getTransactions(_options: SyncOptions = {}): Promise<BankTransaction[]> {
    const parsed = Papa.parse(this.csvData, {
      header: this.config.hasHeader,
      delimiter: this.config.delimiter,
      skipEmptyLines: true
    });

    if (parsed.errors.length > 0) {
      throw new Error(`CSV parsing errors: ${parsed.errors.map(e => e.message).join(', ')}`);
    }

    const transactions: BankTransaction[] = [];
    
    for (const [index, row] of parsed.data.entries()) {
      try {
        const transaction = this.parseRow(row as Record<string, string>, index);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        console.warn(`Failed to parse row ${index + 1}:`, error);
      }
    }

    return transactions;
  }

  async syncData(userId: string, options: SyncOptions = {}): Promise<SyncResult> {
    const result: SyncResult = {
      accounts: [],
      transactions: [],
      newTransactions: 0,
      updatedTransactions: 0,
      errors: []
    };

    try {
      // Get the account we're importing to
      const accounts = await this.getAccounts();
      result.accounts = accounts;

      if (accounts.length === 0) {
        result.errors.push('No account found for CSV import');
        return result;
      }

      const account = accounts[0];
      const transactions = await this.getTransactions(options);
      result.transactions = transactions;

      // Import transactions
      for (const transaction of transactions) {
        const existingTransaction = await this.prisma.transaction.findFirst({
          where: {
            userId,
            accountId: account.id,
            description: transaction.description,
            date: transaction.date,
            splits: {
              some: {
                amount: transaction.amount
              }
            }
          }
        });

        if (!existingTransaction) {
          await this.createTransaction(userId, account.id, transaction);
          result.newTransactions++;
        } else {
          result.updatedTransactions++;
        }
      }

      console.log(`CSV import completed: ${result.newTransactions} new, ${result.updatedTransactions} existing`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      console.error('CSV import error:', error);
    }

    return result;
  }

  mapCategory(categoryName: string): string {
    // Try to find a matching category by name
    for (const [key, category] of Object.entries(CATEGORIES)) {
      if (category.name.toLowerCase() === categoryName.toLowerCase()) {
        return key;
      }
    }
    
    // Fallback to OTHER
    return 'OTHER';
  }

  private parseRow(row: Record<string, string>, index: number): BankTransaction | null {
    const dateStr = row[this.config.columnMapping.date];
    const description = row[this.config.columnMapping.description];
    const amountStr = row[this.config.columnMapping.amount];
    const categoryStr = this.config.columnMapping.category ? row[this.config.columnMapping.category] : undefined;

    if (!dateStr || !description || !amountStr) {
      console.warn(`Row ${index + 1}: Missing required fields`);
      return null;
    }

    // Parse date
    const date = this.parseDate(dateStr);
    if (!date) {
      console.warn(`Row ${index + 1}: Invalid date format: ${dateStr}`);
      return null;
    }

    // Parse amount
    const amount = this.parseAmount(amountStr);
    if (amount === null) {
      console.warn(`Row ${index + 1}: Invalid amount format: ${amountStr}`);
      return null;
    }

    // Determine transaction type
    const isExpense = amount < 0;
    const type = isExpense ? 'expense' : 'income';

    // Map category
    const categoryId = categoryStr ? this.mapCategory(categoryStr) : 'OTHER';

    return {
      id: `csv_${index}_${Date.now()}`,
      accountId: this.config.accountId,
      amount: Math.abs(amount),
      description: description.trim(),
      date,
      type,
      categoryId,
      externalId: `csv_${index}_${Date.now()}`,
      externalSource: this.apiSource,
      metadata: {
        csv_row_index: index,
        csv_original_amount: amountStr,
        csv_original_date: dateStr,
        csv_original_category: categoryStr
      }
    };
  }

  private parseDate(dateStr: string): Date | null {
    try {
      if (this.config.dateFormat === 'auto') {
        // Try to parse as ISO date first
        const isoDate = new Date(dateStr);
        if (!isNaN(isoDate.getTime())) {
          return isoDate;
        }
      }

      // Try specific format if provided
      if (this.config.dateFormat && this.config.dateFormat !== 'auto') {
        // Simple format parsing - can be extended
        if (this.config.dateFormat === 'DD/MM/YYYY') {
          const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (match) {
            const [, day, month, year] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private parseAmount(amountStr: string): number | null {
    try {
      // Remove currency symbols and spaces
      const cleaned = amountStr.replace(/[$,\s]/g, '');
      
      // Handle negative amounts in parentheses
      if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
        const amount = parseFloat(cleaned.slice(1, -1));
        return isNaN(amount) ? null : -amount;
      }

      const amount = parseFloat(cleaned);
      return isNaN(amount) ? null : amount;
    } catch {
      return null;
    }
  }

  private async createTransaction(userId: string, accountId: string, transaction: BankTransaction): Promise<void> {
    // Get the category ID from the database
    const categoryConstant = transaction.categoryId || 'OTHER';
    const categoryData = CATEGORIES[categoryConstant as keyof typeof CATEGORIES];
    
    if (!categoryData) {
      throw new Error(`Unknown category: ${categoryConstant}`);
    }

    // Find or create the category
    let category = await this.prisma.category.findFirst({
      where: {
        userId,
        name: categoryData.name
      }
    });

    if (!category) {
      // Create the category if it doesn't exist
      category = await this.prisma.category.create({
        data: {
          userId,
          name: categoryData.name,
          isDefault: true
        }
      });
    }

    // Create the transaction with split
    await this.prisma.transaction.create({
      data: {
        userId,
        accountId,
        description: transaction.description,
        date: transaction.date,
        type: transaction.type,
        splits: {
          create: {
            categoryId: category.id,
            amount: transaction.amount,
            notes: `CSV Import: ${transaction.externalId}${transaction.metadata ? `\nMetadata: ${JSON.stringify(transaction.metadata)}` : ''}`
          }
        }
      }
    });

    console.log(`Created CSV transaction: ${transaction.description} - $${transaction.amount}`);
  }
}

// Helper function to create CSV integration
export function createCSVIntegration(csvData: string, config: CsvImportConfig, prisma: PrismaClient): CSVIntegration {
  return new CSVIntegration(csvData, config, prisma);
}

// Helper function to import CSV data
export async function importCSVData(
  csvData: string,
  config: CsvImportConfig,
  userId: string,
  prisma: PrismaClient
): Promise<CsvImportResult> {
  const integration = createCSVIntegration(csvData, config, prisma);
  
  const result: CsvImportResult = {
    transactions: [],
    imported: 0,
    errors: [],
    warnings: []
  };

  try {
    const isValid = await integration.testConnection();
    if (!isValid) {
      result.errors.push('Invalid CSV data');
      return result;
    }

    const syncResult = await integration.syncData(userId);
    
    result.transactions = syncResult.transactions;
    result.imported = syncResult.newTransactions;
    result.errors = syncResult.errors;
    
    if (syncResult.updatedTransactions > 0) {
      result.warnings.push(`${syncResult.updatedTransactions} duplicate transactions were skipped`);
    }
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
}