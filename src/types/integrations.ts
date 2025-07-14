/**
 * Base integration types for all bank/financial integrations
 */

export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';
  balance: number;
  currency: string;
  externalId: string;
  apiSource: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  date: Date;
  type: 'expense' | 'income' | 'transfer';
  categoryId?: string;
  externalId: string;
  externalSource: string;
  metadata?: Record<string, any>;
}

export interface BankCategory {
  id: string;
  name: string;
  externalId: string;
  mappedCategoryId?: string;
}

export interface SyncOptions {
  since?: string;
  until?: string;
  accountId?: string;
  pageSize?: number;
  specificAccounts?: string[];
}

export interface SyncResult {
  accounts: BankAccount[];
  transactions: BankTransaction[];
  newTransactions: number;
  updatedTransactions: number;
  errors: string[];
  warnings: string[];
  sessionId?: string;
  importLogs?: ImportLog[];
}

export interface ImportLog {
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface ImportSession {
  id: string;
  integrationId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
  accountsImported: number;
  transactionsImported: number;
  transactionsUpdated: number;
  errorsCount: number;
  logs: ImportLog[];
  errors: string[];
  metadata?: Record<string, any>;
}

/**
 * Base interface that all bank integrations must implement
 */
export interface BankIntegration {
  readonly name: string;
  readonly type: string;
  readonly apiSource: string;
  
  // Connection management
  testConnection(): Promise<boolean>;
  
  // Data fetching
  getAccounts(): Promise<BankAccount[]>;
  getTransactions(options?: SyncOptions): Promise<BankTransaction[]>;
  getCategories?(): Promise<BankCategory[]>;
  
  // Synchronization
  syncData(userId: string, options?: SyncOptions): Promise<SyncResult>;
  
  // Category mapping
  mapCategory(externalCategoryId: string): string;
  
  // Validation
  validateConfig(config: Record<string, any>): Promise<{ isValid: boolean; errors: string[] }>;
}

/**
 * Integration configuration types
 */
export interface IntegrationConfig {
  // Common fields
  name: string;
  type: string;
  
  // API-specific fields
  apiSource?: string;
  accessToken?: string;
  apiUrl?: string;
  
  // CSV-specific fields
  csvConfig?: CsvImportConfig;
  
  // Additional settings
  autoSync?: boolean;
  syncFrequency?: 'manual' | 'daily' | 'weekly';
  accountMapping?: Record<string, string>;
  categoryMapping?: Record<string, string>;
  
  // Metadata
  metadata?: Record<string, any>;
}

/**
 * CSV import specific types
 */
export interface CsvImportConfig {
  accountId: string;
  columnMapping: {
    date: string;
    description: string;
    amount: string;
    category?: string;
    account?: string;
  };
  dateFormat: string;
  hasHeader: boolean;
  delimiter: string;
  encoding?: string;
}

export interface CsvImportResult {
  transactions: BankTransaction[];
  imported: number;
  errors: string[];
  warnings: string[];
  previewData?: any[];
}

/**
 * Integration management types
 */
export interface IntegrationRecord {
  id: string;
  userId: string;
  name: string;
  type: string;
  apiSource?: string;
  config: IntegrationConfig;
  isActive: boolean;
  isVerified: boolean;
  lastSyncAt?: Date;
  lastSyncStatus?: 'success' | 'error' | 'pending';
  lastErrorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIntegrationRequest {
  name: string;
  type: string;
  config: IntegrationConfig;
}

export interface UpdateIntegrationRequest {
  name?: string;
  config?: Partial<IntegrationConfig>;
  isActive?: boolean;
}

export interface SyncIntegrationRequest {
  integrationId: string;
  options?: SyncOptions;
}