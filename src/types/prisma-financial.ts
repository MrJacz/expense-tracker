// Types that match the actual Prisma schema
import { Prisma } from '@prisma/client';

// Transaction with all its relations (as returned by API)
export type TransactionWithDetails = Omit<Prisma.TransactionGetPayload<{
  include: {
    account: {
      select: { id: true, name: true, type: true }
    },
    splits: {
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    },
    attachments: {
      select: { id: true, fileName: true, fileUrl: true, fileType: true }
    }
  }
}>, 'date' | 'createdAt' | 'updatedAt'> & {
  date: string | Date; // Can be string from API or Date from Prisma
  createdAt: string | Date;
  updatedAt: string | Date;
};

// Financial Account with debt details (as returned by API)
export type FinancialAccountWithDebt = Omit<Prisma.FinancialAccountGetPayload<{
  include: {
    debtDetails: true
  }
}>, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
  debtDetails?: Omit<NonNullable<Prisma.FinancialAccountGetPayload<{
    include: { debtDetails: true }
  }>['debtDetails']>, 'createdAt' | 'updatedAt' | 'promoEndDate' | 'nextPaymentDue' | 'lastPaymentDate' | 'originalPayoffDate' | 'openedAt'> & {
    createdAt: string | Date;
    updatedAt: string | Date;
    promoEndDate?: string | Date | null;
    nextPaymentDue?: string | Date | null;
    lastPaymentDate?: string | Date | null;
    originalPayoffDate?: string | Date | null;
    openedAt?: string | Date | null;
  } | null;
};

// Recurring transaction with category (as returned by API)
export type RecurringTransactionWithCategory = Omit<Prisma.RecurringTransactionGetPayload<{
  include: {
    category: {
      select: { id: true, name: true }
    }
  }
}>, 'startDate' | 'endDate' | 'nextDueDate' | 'createdAt'> & {
  startDate: string | Date;
  endDate?: string | Date | null;
  nextDueDate: string | Date;
  createdAt: string | Date;
};

// Financial summary calculated from actual data
export interface RealFinancialSummary {
  // Transaction totals (last 30 days)
  totalExpenses: number;
  totalIncome: number;
  netIncome: number;
  
  // Monthly summaries (current month)
  monthlyExpenses: number;
  monthlyIncome: number;
  monthlyNet: number;
  
  // Debt summary (from financial accounts)
  totalDebt: number;
  monthlyDebtPayments: number;
  debtToIncomeRatio: number;
  
  // Recurring payments summary
  monthlyRecurringExpenses: number;
  monthlyRecurringIncome: number;
  activeSubscriptions: number;
  
  // Trends (percentage change from last month)
  expenseTrend: number;
  incomeTrend: number;
  debtTrend: number;
  
  // Upcoming events
  upcomingBills: RecurringTransactionWithCategory[];
  overdueBills: RecurringTransactionWithCategory[];
  lowBalanceDebts: FinancialAccountWithDebt[];
}

// API response types
export interface TransactionApiResponse {
  transactions: TransactionWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DebtsApiResponse {
  debts: FinancialAccountWithDebt[];
  summary: {
    totalDebt: number;
    totalMonthlyPayments: number;
    averageInterestRate: number;
    debtCount: number;
    byStatus: Record<string, number>;
  };
}

export interface RecurringPaymentsApiResponse {
  recurringPayments: RecurringTransactionWithCategory[];
  summary: {
    totalMonthlyExpenses: number;
    totalMonthlyIncome: number;
    activeCount: number;
    upcomingCount: number;
  };
}

// Helper functions for calculations
export const calculateTransactionTotal = (transaction: TransactionWithDetails): number => {
  return transaction.splits.reduce((sum, split) => sum + Number(split.amount), 0);
};

export const ensureDate = (date: string | Date): Date => {
  return date instanceof Date ? date : new Date(date);
};

export const getMonthlyMultiplier = (frequency: string): number => {
  switch (frequency) {
    case 'daily': return 30;
    case 'weekly': return 4.33;
    case 'fortnightly': return 2.17;
    case 'monthly': return 1;
    case 'quarterly': return 0.33;
    case 'yearly': return 0.083;
    default: return 1;
  }
};

export const calculateRecurringMonthlyAmount = (recurring: RecurringTransactionWithCategory): number => {
  const multiplier = getMonthlyMultiplier(recurring.frequency);
  return Number(recurring.amount) * multiplier;
};