import { PrismaClient } from '@prisma/client';
import { BaseIntegration } from './base';
import { 
  BankAccount, 
  BankTransaction, 
  BankCategory, 
  SyncOptions, 
  IntegrationRecord
} from '@/types/integrations';
import { mapUpBankCategory } from '@/lib/upbank-category-map';
import {
  TransactionResource,
  UpBankAccountsResponse,
  UpBankTransactionsResponse,
  UpBankPingResponse
} from '@/types/upbank';

/**
 * Up Bank integration implementation
 */
export class UPBankIntegration extends BaseIntegration {
  readonly name = 'UP Bank';
  readonly type = 'upbank';
  readonly apiSource = 'up_bank';
  
  private accessToken: string;
  private baseURL = 'https://api.up.com.au/api/v1';

  constructor(prisma: PrismaClient, integrationRecord: IntegrationRecord) {
    super(prisma, integrationRecord);
    
    // Extract access token from config
    this.accessToken = integrationRecord.config.accessToken!;
    if (!this.accessToken) {
      throw new Error('UP Bank access token is required');
    }
  }

  /**
   * Validate configuration
   */
  async validateConfig(config: Record<string, any>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!config.accessToken) {
      errors.push('Access token is required');
    }

    if (!config.accessToken?.startsWith('up:yeah:')) {
      errors.push('Access token must start with "up:yeah:"');
    }

    // Test connection if token is provided
    if (config.accessToken && errors.length === 0) {
      try {
        const tempIntegration = new UPBankIntegration(this.prisma, {
          ...this.integrationRecord,
          config: { ...this.integrationRecord.config, accessToken: config.accessToken }
        });
        const isConnected = await tempIntegration.testConnection();
        if (!isConnected) {
          errors.push('Unable to connect to UP Bank with provided token');
        }
      } catch (error) {
        errors.push(`Connection test failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Test connection to UP Bank API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest<UpBankPingResponse>('/util/ping');
      return true;
    } catch (error) {
      this.addLog('error', 'UP Bank connection test failed', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Get accounts from UP Bank API
   */
  async getAccounts(): Promise<BankAccount[]> {
    try {
      const response = await this.makeRequest<UpBankAccountsResponse>('/accounts');
      
      return response.data.map(account => ({
        id: account.id,
        name: account.attributes.displayName,
        type: this.mapAccountType(account.attributes.accountType),
        balance: parseFloat(account.attributes.balance.value),
        currency: account.attributes.balance.currencyCode,
        externalId: account.id,
        apiSource: this.apiSource
      }));
    } catch (error) {
      this.addLog('error', 'Failed to fetch UP Bank accounts', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get transactions from UP Bank API
   */
  async getTransactions(options: SyncOptions = {}): Promise<BankTransaction[]> {
    try {
      const allTransactions: TransactionResource[] = [];
      let nextPageAfter: string | undefined;
      let hasMore = true;
      let pageCount = 0;

      this.addLog('info', `Starting UP Bank transaction sync${options.since ? ` since ${options.since}` : ' (ALL TRANSACTIONS)'}`);

      while (hasMore) {
        pageCount++;
        this.addLog('info', `Fetching UP Bank page ${pageCount}...`);

        const params = new URLSearchParams();
        if (options.accountId) params.append('filter[account]', options.accountId);
        if (options.since) params.append('filter[since]', options.since);
        if (options.until) params.append('filter[until]', options.until);
        if (options.pageSize) params.append('page[size]', options.pageSize.toString());
        if (nextPageAfter) params.append('page[after]', nextPageAfter);

        const queryString = params.toString();
        const endpoint = `/transactions${queryString ? `?${queryString}` : ''}`;

        const response = await this.makeRequest<UpBankTransactionsResponse>(endpoint);
        const pageTransactions = response.data || [];
        allTransactions.push(...pageTransactions);

        this.addLog('info', `UP Bank page ${pageCount} returned ${pageTransactions.length} transactions`);

        // Check if there's a next page
        if (response.links?.next) {
          const nextUrl = new URL(response.links.next);
          nextPageAfter = nextUrl.searchParams.get('page[after]') || undefined;
        } else {
          hasMore = false;
        }

        // Safety breaks
        if (allTransactions.length > 10000 || pageCount > 100) {
          this.addLog('warning', `Breaking pagination loop at ${allTransactions.length} transactions`);
          break;
        }
      }

      this.addLog('info', `UP Bank sync completed - ${pageCount} pages, ${allTransactions.length} total transactions`);

      return allTransactions.map(transaction => this.convertTransaction(transaction));
    } catch (error) {
      this.addLog('error', 'Failed to fetch UP Bank transactions', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get categories from UP Bank API (optional)
   */
  async getCategories(): Promise<BankCategory[]> {
    // UP Bank doesn't have a categories endpoint, return empty array
    return [];
  }

  /**
   * Map UP Bank category to internal category
   */
  mapCategory(externalCategoryId: string): string {
    return mapUpBankCategory(externalCategoryId);
  }

  /**
   * Convert UP Bank transaction to internal format
   */
  private convertTransaction(transaction: TransactionResource): BankTransaction {
    const amount = parseFloat(transaction.attributes.amount.value);
    const isExpense = amount < 0;
    
    return {
      id: transaction.id,
      accountId: transaction.relationships.account.data.id,
      amount: Math.abs(amount),
      description: transaction.attributes.description || transaction.attributes.rawText || 'UP Bank Transaction',
      date: new Date(transaction.attributes.createdAt),
      type: isExpense ? 'expense' : 'income',
      categoryId: this.mapCategory(transaction.relationships.category?.data?.id || ''),
      externalId: transaction.id,
      externalSource: this.apiSource,
      metadata: {
        up_transaction_id: transaction.id,
        up_raw_text: transaction.attributes.rawText,
        up_status: transaction.attributes.status,
        up_category_id: transaction.relationships.category?.data?.id,
        original_amount: transaction.attributes.amount.value,
        currency: transaction.attributes.amount.currencyCode,
        up_account_id: transaction.relationships.account.data.id
      }
    };
  }

  /**
   * Make authenticated request to UP Bank API
   */
  private async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`UP Bank API error (${response.status}): ${errorData.errors?.[0]?.detail || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Map UP Bank account type to internal type
   */
  protected mapAccountType(type: string): 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' {
    const mapping: Record<string, 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan'> = {
      'TRANSACTIONAL': 'checking',
      'SAVER': 'savings'
    };
    return mapping[type] || 'checking';
  }
}

// Legacy API class for backward compatibility
export class UPBankAPI {
  private integration: UPBankIntegration;

  constructor(accessToken: string, prisma: PrismaClient) {
    this.integration = new UPBankIntegration(accessToken, prisma);
  }

  async ping(): Promise<UpBankPingResponse> {
    const isConnected = await this.integration.testConnection();
    return { meta: { id: 'ping', statusEmoji: isConnected ? '⚡' : '❌' } };
  }

  async getAccounts(): Promise<UpBankAccountsResponse> {
    const accounts = await this.integration.getAccounts();
    return {
      data: accounts.map(account => ({
        id: account.id,
        type: 'accounts' as const,
        attributes: {
          displayName: account.name,
          accountType: account.type === 'checking' ? 'TRANSACTIONAL' as const : 'SAVER' as const,
          ownershipType: 'INDIVIDUAL' as const,
          balance: {
            currencyCode: account.currency,
            value: account.balance.toString(),
            valueInBaseUnits: Math.round(account.balance * 100)
          },
          createdAt: new Date().toISOString()
        },
        relationships: {
          transactions: {
            links: {
              related: `https://api.up.com.au/api/v1/accounts/${account.id}/transactions`
            }
          }
        },
        links: {
          self: `https://api.up.com.au/api/v1/accounts/${account.id}`
        }
      }))
    };
  }

  async getAllTransactionsSince(since?: string, accountId?: string): Promise<TransactionResource[]> {
    const transactions = await this.integration.getTransactions({ since, accountId });
    
    return transactions.map(transaction => ({
      id: transaction.id,
      type: 'transactions' as const,
      attributes: {
        status: 'SETTLED' as const,
        rawText: transaction.description,
        description: transaction.description,
        message: null,
        isCategorizable: true,
        holdInfo: null,
        roundUp: null,
        cashback: null,
        amount: {
          currencyCode: transaction.metadata?.currency || 'AUD',
          value: transaction.type === 'expense' ? `-${transaction.amount}` : transaction.amount.toString(),
          valueInBaseUnits: Math.round(transaction.amount * 100) * (transaction.type === 'expense' ? -1 : 1)
        },
        foreignAmount: null,
        cardPurchaseMethod: null,
        settledAt: transaction.date.toISOString(),
        createdAt: transaction.date.toISOString(),
        transactionType: null,
        note: null,
        performingCustomer: null
      },
      relationships: {
        account: {
          data: {
            id: transaction.accountId,
            type: 'accounts' as const
          },
          links: {
            related: `https://api.up.com.au/api/v1/accounts/${transaction.accountId}`
          }
        },
        transferAccount: {
          data: null
        },
        category: {
          data: transaction.categoryId ? {
            id: transaction.categoryId,
            type: 'categories' as const
          } : null
        },
        parentCategory: {
          data: null
        },
        tags: {
          data: []
        }
      },
      links: {
        self: `https://api.up.com.au/api/v1/transactions/${transaction.id}`
      }
    }));
  }

  // Static utility methods for backward compatibility
  static convertToExpense(transaction: TransactionResource, userId: number) {
    const amount = Math.abs(parseFloat(transaction.attributes.amount.value));
    if (parseFloat(transaction.attributes.amount.value) >= 0) return null;

    const upCategoryId = transaction.relationships.category?.data?.id;
    const mappedCategoryId = mapUpBankCategory(upCategoryId || 'other');

    return {
      user_id: userId,
      amount: amount,
      description: transaction.attributes.description || transaction.attributes.rawText,
      category_id: mappedCategoryId,
      date: new Date(transaction.attributes.createdAt),
      external_id: transaction.id,
      external_source: 'up_bank',
      metadata: {
        up_transaction_id: transaction.id,
        up_raw_text: transaction.attributes.rawText,
        up_status: transaction.attributes.status,
        up_category_id: upCategoryId,
        original_amount: transaction.attributes.amount.value,
        currency: transaction.attributes.amount.currencyCode
      }
    };
  }

  static getMerchantName(transaction: TransactionResource): string {
    const rawText = transaction.attributes.rawText || '';
    const description = transaction.attributes.description || '';
    return description || rawText.replace(/^(EFTPOS|PAYPAL|GOOGLE|APPLE PAY)\s*/i, '').trim();
  }

  static isTransferTransaction(transaction: TransactionResource): boolean {
    const description = transaction.attributes.description?.toLowerCase() || '';
    const rawText = transaction.attributes.rawText?.toLowerCase() || '';
    const transferKeywords = ['transfer', 'round up', 'boost', 'interest', 'fee refund', 'cashback'];
    return transferKeywords.some(keyword => description.includes(keyword) || rawText.includes(keyword));
  }
}

// Factory function to create UP Bank integration
export function createUPBankIntegration(prisma: PrismaClient, integrationRecord: IntegrationRecord): UPBankIntegration {
  return new UPBankIntegration(prisma, integrationRecord);
}

// Legacy factory function for backward compatibility
export function createUPBankIntegrationLegacy(accessToken: string, prisma: PrismaClient): UPBankIntegration {
  // Create a temporary integration record for legacy support
  const tempIntegrationRecord: IntegrationRecord = {
    id: 'legacy',
    userId: 'legacy',
    name: 'UP Bank (Legacy)',
    type: 'upbank',
    apiSource: 'up_bank',
    config: {
      name: 'UP Bank',
      type: 'upbank',
      accessToken
    },
    isActive: true,
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return new UPBankIntegration(prisma, tempIntegrationRecord);
}

export default UPBankAPI;