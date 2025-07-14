import { PrismaClient } from '@prisma/client';
import { 
  BankIntegration, 
  BankAccount, 
  BankTransaction, 
  BankCategory, 
  SyncOptions, 
  SyncResult, 
  ImportLog, 
  IntegrationConfig,
  IntegrationRecord
} from '@/types/integrations';
import { CATEGORIES } from '@/lib/constants';

/**
 * Abstract base class for all bank integrations
 * Provides common functionality for account and transaction management
 */
export abstract class BaseIntegration implements BankIntegration {
  protected prisma: PrismaClient;
  protected integrationRecord: IntegrationRecord;
  protected logs: ImportLog[] = [];

  abstract readonly name: string;
  abstract readonly type: string;
  abstract readonly apiSource: string;

  constructor(prisma: PrismaClient, integrationRecord: IntegrationRecord) {
    this.prisma = prisma;
    this.integrationRecord = integrationRecord;
  }

  // Abstract methods that must be implemented by subclasses
  abstract testConnection(): Promise<boolean>;
  abstract getAccounts(): Promise<BankAccount[]>;
  abstract getTransactions(options?: SyncOptions): Promise<BankTransaction[]>;
  abstract mapCategory(externalCategoryId: string): string;
  abstract validateConfig(config: Record<string, any>): Promise<{ isValid: boolean; errors: string[] }>;

  /**
   * Main sync method that orchestrates the entire import process
   */
  async syncData(userId: string, options: SyncOptions = {}): Promise<SyncResult> {
    this.logs = [];
    
    const result: SyncResult = {
      accounts: [],
      transactions: [],
      newTransactions: 0,
      updatedTransactions: 0,
      errors: [],
      warnings: []
    };

    // Create import session
    const importSession = await this.createImportSession(userId);
    result.sessionId = importSession.id;

    try {
      this.addLog('info', `Starting sync for ${this.name}`);
      
      // Step 1: Sync accounts
      const accounts = await this.getAccounts();
      result.accounts = accounts;
      this.addLog('info', `Found ${accounts.length} accounts`);

      for (const account of accounts) {
        await this.syncAccount(userId, account);
        this.addLog('info', `Synced account: ${account.name}`);
      }

      // Step 2: Sync transactions for each account
      const allTransactions: BankTransaction[] = [];
      
      for (const account of accounts) {
        this.addLog('info', `Syncing transactions for account: ${account.name}`);
        
        const transactions = await this.getTransactions({
          ...options,
          accountId: account.externalId
        });
        
        allTransactions.push(...transactions);
        this.addLog('info', `Found ${transactions.length} transactions for ${account.name}`);
      }

      result.transactions = allTransactions;

      // Step 3: Process transactions
      for (const transaction of allTransactions) {
        try {
          const dbAccount = await this.findLocalAccount(userId, transaction.accountId);
          if (!dbAccount) {
            result.errors.push(`Could not find local account for transaction ${transaction.id}`);
            continue;
          }

          const isNew = await this.processTransaction(userId, dbAccount.id, transaction);
          if (isNew) {
            result.newTransactions++;
          } else {
            result.updatedTransactions++;
          }
        } catch (error) {
          const errorMsg = `Error processing transaction ${transaction.id}: ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          this.addLog('error', errorMsg);
        }
      }

      // Update import session
      await this.updateImportSession(importSession.id, {
        status: 'completed',
        completedAt: new Date(),
        accountsImported: accounts.length,
        transactionsImported: result.newTransactions,
        transactionsUpdated: result.updatedTransactions,
        errorsCount: result.errors.length,
        logs: this.logs
      });

      // Update integration record
      await this.updateIntegrationRecord(
        result.errors.length === 0 ? 'success' : 'error',
        result.errors.length > 0 ? result.errors[0] : undefined
      );

      this.addLog('info', `Sync completed. New: ${result.newTransactions}, Updated: ${result.updatedTransactions}, Errors: ${result.errors.length}`);
      
    } catch (error) {
      const errorMsg = `Sync failed: ${error instanceof Error ? error.message : String(error)}`;
      result.errors.push(errorMsg);
      this.addLog('error', errorMsg);

      // Update import session as failed
      await this.updateImportSession(importSession.id, {
        status: 'failed',
        completedAt: new Date(),
        errorsCount: result.errors.length,
        logs: this.logs
      });

      // Update integration record
      await this.updateIntegrationRecord('error', errorMsg);
    }

    result.importLogs = this.logs;
    return result;
  }

  /**
   * Sync a single account to the database
   */
  protected async syncAccount(userId: string, account: BankAccount): Promise<void> {
    const existingAccount = await this.prisma.financialAccount.findFirst({
      where: {
        userId,
        apiSource: this.apiSource,
        apiIdentifier: account.externalId
      }
    });

    if (!existingAccount) {
      await this.prisma.financialAccount.create({
        data: {
          userId,
          name: account.name,
          type: this.mapAccountType(account.type),
          balance: account.balance,
          isAsset: account.type !== 'credit_card',
          apiSource: this.apiSource,
          apiIdentifier: account.externalId
        }
      });
    } else {
      await this.prisma.financialAccount.update({
        where: { id: existingAccount.id },
        data: {
          balance: account.balance,
          name: account.name
        }
      });
    }
  }

  /**
   * Process a single transaction
   */
  protected async processTransaction(userId: string, accountId: string, transaction: BankTransaction): Promise<boolean> {
    // Check if transaction already exists
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        userId,
        accountId,
        splits: {
          some: {
            notes: {
              contains: transaction.externalId
            }
          }
        }
      }
    });

    if (existingTransaction) {
      // Transaction already exists, potentially update it
      return false;
    }

    // Create new transaction
    await this.createTransaction(userId, accountId, transaction);
    return true;
  }

  /**
   * Create a new transaction in the database
   */
  protected async createTransaction(userId: string, accountId: string, transaction: BankTransaction): Promise<void> {
    // Get or create category
    const category = await this.getOrCreateCategory(userId, transaction.categoryId);

    // Create transaction with split
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
            notes: `${this.apiSource} ID: ${transaction.externalId}${transaction.metadata ? `\nMetadata: ${JSON.stringify(transaction.metadata)}` : ''}`
          }
        }
      }
    });
  }

  /**
   * Get or create a category
   */
  protected async getOrCreateCategory(userId: string, categoryId?: string) {
    const categoryConstant = categoryId || 'OTHER';
    const categoryData = CATEGORIES[categoryConstant as keyof typeof CATEGORIES];
    
    if (!categoryData) {
      throw new Error(`Unknown category: ${categoryConstant}`);
    }

    let category = await this.prisma.category.findFirst({
      where: {
        userId,
        name: categoryData.name
      }
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: {
          userId,
          name: categoryData.name,
          isDefault: true
        }
      });
    }

    return category;
  }

  /**
   * Find local account by external ID
   */
  protected async findLocalAccount(userId: string, externalId: string) {
    return await this.prisma.financialAccount.findFirst({
      where: {
        userId,
        apiSource: this.apiSource,
        apiIdentifier: externalId
      }
    });
  }

  /**
   * Map external account type to internal type
   */
  protected mapAccountType(type: string): any {
    const mapping: Record<string, any> = {
      'checking': 'checking',
      'savings': 'savings',
      'credit_card': 'credit_card',
      'investment': 'investment',
      'loan': 'loan',
      'TRANSACTIONAL': 'checking',
      'SAVER': 'savings'
    };
    return mapping[type] || 'checking';
  }

  /**
   * Add log entry
   */
  protected addLog(level: 'info' | 'warning' | 'error', message: string, details?: Record<string, any>): void {
    this.logs.push({
      level,
      message,
      timestamp: new Date(),
      details
    });
  }

  /**
   * Create import session
   */
  protected async createImportSession(userId: string) {
    return await this.prisma.importSession.create({
      data: {
        integrationId: this.integrationRecord.id,
        userId,
        status: 'running',
        logs: [],
        errors: []
      }
    });
  }

  /**
   * Update import session
   */
  protected async updateImportSession(sessionId: string, updates: Partial<any>) {
    return await this.prisma.importSession.update({
      where: { id: sessionId },
      data: updates
    });
  }

  /**
   * Update integration record
   */
  protected async updateIntegrationRecord(status: 'success' | 'error' | 'pending', errorMessage?: string) {
    await this.prisma.integration.update({
      where: { id: this.integrationRecord.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: status,
        lastErrorMessage: errorMessage
      }
    });
  }
}