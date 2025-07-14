import { BaseDataService } from './BaseDataService';
import { prisma } from './index';
import { TransactionType } from '@prisma/client';

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  transactionType?: TransactionType;
  categoryIds?: string[];
  accountIds?: string[];
}

export interface SpendingTrend {
  date: string;
  amount: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  transactionCount: number;
  percentage: number;
}

export class AnalyticsDataService extends BaseDataService {
  /**
   * Get spending trends over time
   */
  static async getSpendingTrends(
    userId: string, 
    groupBy: 'day' | 'week' | 'month' = 'day',
    filters: AnalyticsFilters = {}
  ) {
    try {
      const { startDate, endDate, transactionType = 'expense', categoryIds, accountIds } = filters;

      const where: any = {
        userId,
        type: transactionType
      };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = startDate;
        if (endDate) where.date.lte = endDate;
      }

      if (accountIds?.length) {
        where.accountId = { in: accountIds };
      }

      if (categoryIds?.length) {
        where.splits = {
          some: {
            categoryId: { in: categoryIds }
          }
        };
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          splits: true
        },
        orderBy: { date: 'asc' }
      });

      // Group transactions by time period
      const grouped = new Map<string, { amount: number; count: number }>();

      transactions.forEach(transaction => {
        let dateKey: string;
        const date = new Date(transaction.date);

        switch (groupBy) {
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            dateKey = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default: // day
            dateKey = date.toISOString().split('T')[0];
        }

        const totalAmount = transaction.splits.reduce(
          (sum, split) => sum + split.amount.toNumber(), 
          0
        );

        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, { amount: 0, count: 0 });
        }

        const entry = grouped.get(dateKey)!;
        entry.amount += totalAmount;
        entry.count += 1;
      });

      return Array.from(grouped.entries()).map(([date, data]) => ({
        date,
        amount: data.amount,
        transactionCount: data.count
      }));
    } catch (error) {
      this.handleError(error, 'getSpendingTrends');
    }
  }

  /**
   * Get category breakdown
   */
  static async getCategoryBreakdown(userId: string, filters: AnalyticsFilters = {}) {
    try {
      const { startDate, endDate, transactionType = 'expense', accountIds } = filters;

      const where: any = {
        transaction: {
          userId,
          type: transactionType
        }
      };

      if (startDate || endDate) {
        where.transaction.date = {};
        if (startDate) where.transaction.date.gte = startDate;
        if (endDate) where.transaction.date.lte = endDate;
      }

      if (accountIds?.length) {
        where.transaction.accountId = { in: accountIds };
      }

      const splits = await prisma.transactionSplit.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true }
          }
        }
      });

      // Group by category
      const categoryMap = new Map<string, { name: string; amount: number; count: number }>();

      splits.forEach(split => {
        const categoryId = split.categoryId || 'uncategorized';
        const categoryName = split.category?.name || 'Uncategorized';
        const amount = split.amount.toNumber();

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, { name: categoryName, amount: 0, count: 0 });
        }

        const entry = categoryMap.get(categoryId)!;
        entry.amount += amount;
        entry.count += 1;
      });

      const totalAmount = Array.from(categoryMap.values()).reduce(
        (sum, entry) => sum + entry.amount, 
        0
      );

      return Array.from(categoryMap.entries())
        .map(([categoryId, data]) => ({
          categoryId,
          categoryName: data.name,
          amount: data.amount,
          transactionCount: data.count,
          percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);
    } catch (error) {
      this.handleError(error, 'getCategoryBreakdown');
    }
  }

  /**
   * Get account balances and net worth
   */
  static async getNetWorthAnalytics(userId: string) {
    try {
      const accounts = await prisma.financialAccount.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
          isAsset: true
        }
      });

      const assets = accounts.filter(account => account.isAsset);
      const liabilities = accounts.filter(account => !account.isAsset);

      const totalAssets = assets.reduce(
        (sum, account) => sum + account.balance.toNumber(), 
        0
      );

      const totalLiabilities = liabilities.reduce(
        (sum, account) => sum + account.balance.toNumber(), 
        0
      );

      return {
        netWorth: totalAssets - totalLiabilities,
        totalAssets,
        totalLiabilities,
        accounts: accounts.map(account => ({
          id: account.id,
          name: account.name,
          type: account.type,
          balance: account.balance.toNumber(),
          isAsset: account.isAsset
        }))
      };
    } catch (error) {
      this.handleError(error, 'getNetWorthAnalytics');
    }
  }

  /**
   * Get cash flow analysis (income vs expenses)
   */
  static async getCashFlowAnalysis(userId: string, filters: AnalyticsFilters = {}) {
    try {
      const { startDate, endDate } = filters;

      const where: any = { userId };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = startDate;
        if (endDate) where.date.lte = endDate;
      }

      const [incomeTransactions, expenseTransactions] = await Promise.all([
        prisma.transaction.findMany({
          where: { ...where, type: 'income' },
          include: { splits: true }
        }),
        prisma.transaction.findMany({
          where: { ...where, type: 'expense' },
          include: { splits: true }
        })
      ]);

      const totalIncome = incomeTransactions.reduce((sum, transaction) => {
        return sum + transaction.splits.reduce(
          (splitSum, split) => splitSum + split.amount.toNumber(), 
          0
        );
      }, 0);

      const totalExpenses = expenseTransactions.reduce((sum, transaction) => {
        return sum + transaction.splits.reduce(
          (splitSum, split) => splitSum + split.amount.toNumber(), 
          0
        );
      }, 0);

      return {
        totalIncome,
        totalExpenses,
        netCashFlow: totalIncome - totalExpenses,
        incomeTransactionCount: incomeTransactions.length,
        expenseTransactionCount: expenseTransactions.length
      };
    } catch (error) {
      this.handleError(error, 'getCashFlowAnalysis');
    }
  }

  /**
   * Get spending by day of week pattern
   */
  static async getSpendingPatterns(userId: string, filters: AnalyticsFilters = {}) {
    try {
      const { startDate, endDate } = filters;

      const where: any = {
        userId,
        type: 'expense'
      };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = startDate;
        if (endDate) where.date.lte = endDate;
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: { splits: true }
      });

      const dayOfWeekMap = new Map<number, { amount: number; count: number }>();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      transactions.forEach(transaction => {
        const dayOfWeek = new Date(transaction.date).getDay();
        const totalAmount = transaction.splits.reduce(
          (sum, split) => sum + split.amount.toNumber(), 
          0
        );

        if (!dayOfWeekMap.has(dayOfWeek)) {
          dayOfWeekMap.set(dayOfWeek, { amount: 0, count: 0 });
        }

        const entry = dayOfWeekMap.get(dayOfWeek)!;
        entry.amount += totalAmount;
        entry.count += 1;
      });

      return Array.from({ length: 7 }, (_, index) => {
        const data = dayOfWeekMap.get(index) || { amount: 0, count: 0 };
        return {
          dayOfWeek: index,
          dayName: dayNames[index],
          amount: data.amount,
          transactionCount: data.count,
          averageAmount: data.count > 0 ? data.amount / data.count : 0
        };
      });
    } catch (error) {
      this.handleError(error, 'getSpendingPatterns');
    }
  }

  /**
   * Get financial summary
   */
  static async getFinancialSummary(userId: string, filters: AnalyticsFilters = {}) {
    try {
      const [netWorth, cashFlow, categoryBreakdown] = await Promise.all([
        this.getNetWorthAnalytics(userId),
        this.getCashFlowAnalysis(userId, filters),
        this.getCategoryBreakdown(userId, filters)
      ]);

      const topCategories = categoryBreakdown?.slice(0, 5) || [];

      return {
        netWorth: netWorth?.netWorth || 0,
        totalAssets: netWorth?.totalAssets || 0,
        totalLiabilities: netWorth?.totalLiabilities || 0,
        totalIncome: cashFlow?.totalIncome || 0,
        totalExpenses: cashFlow?.totalExpenses || 0,
        netCashFlow: cashFlow?.netCashFlow || 0,
        topSpendingCategories: topCategories
      };
    } catch (error) {
      this.handleError(error, 'getFinancialSummary');
    }
  }
}