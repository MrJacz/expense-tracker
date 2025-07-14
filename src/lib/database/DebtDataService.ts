import { BaseDataService } from './BaseDataService';
import { prisma } from './index';
import { Prisma } from '@prisma/client';

export interface DebtSummary {
  totalDebt: number;
  totalPaid: number;
  averageProgress: number;
  debtCount: number;
  byStatus: Record<string, number>;
}

export interface DebtFilters {
  sortBy?: 'name' | 'target_amount' | 'current_amount' | 'target_date';
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'paid_off' | 'paused';
  page?: number;
  limit?: number;
}

export interface DebtCreateData {
  name: string;
  description?: string;
  original_amount: number;
  current_balance?: number;
  interest_rate?: number;
  minimum_payment?: number;
  start_date?: string;
  due_date?: string;
  payment_due_day?: number;
  debt_type?: string;
  creditor?: string;
  account_number?: string;
  target_account_id?: string;
}

export interface DebtPaymentData {
  amount: number;
  payment_date?: string;
  notes?: string;
  payment_method?: string;
}

export class DebtDataService extends BaseDataService {
  /**
   * Get all debts for a user with comprehensive filtering and sorting
   */
  static async getDebts(userId: string, filters: DebtFilters = {}) {
    try {
      const {
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        limit = 100
      } = filters;

      const pagination = this.getPagination(page, limit);

      // Build where clause for goals (debt payoff type)
      const where: Prisma.GoalWhereInput = {
        userId
      };

      // Build order by clause
      const orderBy: Prisma.GoalOrderByWithRelationInput = {};
      switch (sortBy) {
        case 'target_amount':
          orderBy.targetAmount = sortOrder;
          break;
        case 'current_amount':
          orderBy.currentAmount = sortOrder;
          break;
        case 'target_date':
          orderBy.targetDate = sortOrder;
          break;
        default:
          orderBy.name = sortOrder;
      }

      const [debts, totalCount] = await Promise.all([
        prisma.goal.findMany({
          where,
          include: {
            linkedAccount: {
              select: { id: true, name: true }
            }
          },
          orderBy,
          ...pagination
        }),
        prisma.goal.count({ where })
      ]);

      // Transform to expected debt format
      const transformedDebts = debts.map(debt => ({
        id: debt.id,
        user_id: debt.userId,
        name: debt.name,
        description: null,
        debt_type: 'debt_payoff',
        original_amount: debt.targetAmount.toNumber(),
        current_balance: debt.targetAmount.toNumber() - debt.currentAmount.toNumber(),
        total_paid: debt.currentAmount.toNumber(),
        remaining_amount: debt.targetAmount.toNumber() - debt.currentAmount.toNumber(),
        progress_percentage: debt.targetAmount.toNumber() > 0 
          ? (debt.currentAmount.toNumber() / debt.targetAmount.toNumber()) * 100 
          : 0,
        start_date: debt.createdAt,
        due_date: debt.targetDate,
        status: 'active',
        account_name: debt.linkedAccount?.name || null,
        created_at: debt.createdAt,
        updated_at: debt.createdAt
      }));

      return {
        debts: transformedDebts,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      };

    } catch (error) {
      this.handleError(error, 'getDebts');
    }
  }

  /**
   * Get debt summary statistics
   */
  static async getDebtSummary(userId: string): Promise<DebtSummary> {
    try {
      const debts = await prisma.goal.findMany({
        where: {
          userId
        }
      });

      const totalDebt = debts.reduce((sum, debt) => 
        sum + (debt.targetAmount.toNumber() - debt.currentAmount.toNumber()), 0
      );

      const totalPaid = debts.reduce((sum, debt) => 
        sum + debt.currentAmount.toNumber(), 0
      );

      const averageProgress = debts.length > 0 
        ? debts.reduce((sum, debt) => {
            const progress = debt.targetAmount.toNumber() > 0 
              ? (debt.currentAmount.toNumber() / debt.targetAmount.toNumber()) * 100 
              : 0;
            return sum + progress;
          }, 0) / debts.length
        : 0;

      const byStatus = debts.reduce((acc: Record<string, number>) => {
        const status = 'active'; // Since Goal model doesn't have isAchieved
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return {
        totalDebt,
        totalPaid,
        averageProgress,
        debtCount: debts.length,
        byStatus
      };

    } catch (error) {
      this.handleError(error, 'getDebtSummary');
    }
  }
}