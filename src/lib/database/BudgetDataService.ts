import { BaseDataService } from './BaseDataService';
import { prisma } from './index';

export interface BudgetFilters {
  categoryId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  sortBy?: 'amount' | 'periodStart' | 'categoryName';
  sortOrder?: 'asc' | 'desc';
}

export interface BudgetCreateData {
  categoryId: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface BudgetUpdateData {
  amount?: number;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface BudgetPeriod {
  start: Date;
  end: Date;
}

export class BudgetDataService extends BaseDataService {
  /**
   * Get all budgets for a user
   */
  static async getBudgets(userId: string, filters: BudgetFilters = {}) {
    try {
      const {
        categoryId,
        periodStart,
        periodEnd,
        sortBy = 'periodStart',
        sortOrder = 'desc'
      } = filters;

      const where: any = { userId };
      
      if (categoryId) where.categoryId = categoryId;
      if (periodStart) where.periodStart = { gte: periodStart };
      if (periodEnd) where.periodEnd = { lte: periodEnd };

      let orderBy: any = {};
      switch (sortBy) {
        case 'amount':
          orderBy.amount = sortOrder;
          break;
        case 'categoryName':
          orderBy = { category: { name: sortOrder } };
          break;
        default:
          orderBy.periodStart = sortOrder;
      }

      const budgets = await prisma.budget.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              budgetClassification: true
            }
          }
        },
        orderBy
      });

      // Calculate spending for each budget
      const budgetsWithSpending = await Promise.all(
        budgets.map(async (budget) => {
          const spending = await this.getCategorySpending(
            userId, 
            budget.categoryId, 
            budget.periodStart, 
            budget.periodEnd
          );

          return {
            ...budget,
            spent: spending,
            remaining: budget.amount.toNumber() - spending,
            progressPercentage: budget.amount.toNumber() > 0 
              ? (spending / budget.amount.toNumber()) * 100 
              : 0,
            isOverBudget: spending > budget.amount.toNumber()
          };
        })
      );

      return budgetsWithSpending;
    } catch (error) {
      this.handleError(error, 'getBudgets');
    }
  }

  /**
   * Get budget by ID
   */
  static async getBudgetById(userId: string, budgetId: string) {
    try {
      const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              budgetClassification: true
            }
          }
        }
      });

      if (!budget) {
        throw new Error('Budget not found');
      }

      const spending = await this.getCategorySpending(
        userId, 
        budget.categoryId, 
        budget.periodStart, 
        budget.periodEnd
      );

      return {
        ...budget,
        spent: spending,
        remaining: budget.amount.toNumber() - spending,
        progressPercentage: budget.amount.toNumber() > 0 
          ? (spending / budget.amount.toNumber()) * 100 
          : 0,
        isOverBudget: spending > budget.amount.toNumber()
      };
    } catch (error) {
      this.handleError(error, 'getBudgetById');
    }
  }

  /**
   * Create a new budget
   */
  static async createBudget(userId: string, data: BudgetCreateData) {
    try {
      // Validate category ownership
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [
            { userId },
            { isDefault: true }
          ]
        }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      // Check for existing budget in the same period
      const existingBudget = await prisma.budget.findFirst({
        where: {
          userId,
          categoryId: data.categoryId,
          periodStart: data.periodStart
        }
      });

      if (existingBudget) {
        throw new Error('Budget already exists for this category and period');
      }

      return await prisma.budget.create({
        data: {
          userId,
          categoryId: data.categoryId,
          amount: data.amount,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              budgetClassification: true
            }
          }
        }
      });
    } catch (error) {
      this.handleError(error, 'createBudget');
    }
  }

  /**
   * Update a budget
   */
  static async updateBudget(userId: string, budgetId: string, data: BudgetUpdateData) {
    try {
      // Verify ownership
      const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId }
      });

      if (!budget) {
        throw new Error('Budget not found');
      }

      return await prisma.budget.update({
        where: { id: budgetId },
        data,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              budgetClassification: true
            }
          }
        }
      });
    } catch (error) {
      this.handleError(error, 'updateBudget');
    }
  }

  /**
   * Delete a budget
   */
  static async deleteBudget(userId: string, budgetId: string) {
    try {
      // Verify ownership
      const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId }
      });

      if (!budget) {
        throw new Error('Budget not found');
      }

      await prisma.budget.delete({
        where: { id: budgetId }
      });

      return { success: true };
    } catch (error) {
      this.handleError(error, 'deleteBudget');
    }
  }

  /**
   * Get budget summary for a period
   */
  static async getBudgetSummary(userId: string, periodStart: Date, periodEnd: Date) {
    try {
      const budgets = await prisma.budget.findMany({
        where: {
          userId,
          periodStart: { gte: periodStart },
          periodEnd: { lte: periodEnd }
        },
        include: {
          category: {
            select: {
              budgetClassification: true
            }
          }
        }
      });

      const totalBudgeted = budgets.reduce(
        (sum, budget) => sum + budget.amount.toNumber(), 
        0
      );

      let totalSpent = 0;
      let overBudgetCount = 0;

      for (const budget of budgets) {
        const spending = await this.getCategorySpending(
          userId, 
          budget.categoryId, 
          budget.periodStart, 
          budget.periodEnd
        );
        totalSpent += spending;
        if (spending > budget.amount.toNumber()) {
          overBudgetCount++;
        }
      }

      // Group by budget classification
      const byClassification = budgets.reduce((acc: any, budget) => {
        const classification = budget.category.budgetClassification || 'unclassified';
        if (!acc[classification]) {
          acc[classification] = {
            budgeted: 0,
            spent: 0,
            count: 0
          };
        }
        acc[classification].budgeted += budget.amount.toNumber();
        acc[classification].count += 1;
        return acc;
      }, {});

      return {
        totalBudgets: budgets.length,
        totalBudgeted,
        totalSpent,
        totalRemaining: totalBudgeted - totalSpent,
        overBudgetCount,
        overBudgetPercentage: budgets.length > 0 ? (overBudgetCount / budgets.length) * 100 : 0,
        byClassification
      };
    } catch (error) {
      this.handleError(error, 'getBudgetSummary');
    }
  }

  /**
   * Get spending for a category in a period
   */
  private static async getCategorySpending(
    userId: string, 
    categoryId: string, 
    periodStart: Date, 
    periodEnd: Date
  ): Promise<number> {
    const result = await prisma.transactionSplit.aggregate({
      where: {
        categoryId,
        transaction: {
          userId,
          type: 'expense',
          date: {
            gte: periodStart,
            lte: periodEnd
          }
        }
      },
      _sum: {
        amount: true
      }
    });

    return result._sum.amount?.toNumber() || 0;
  }

  /**
   * Create monthly budgets for multiple categories
   */
  static async createMonthlyBudgets(
    userId: string, 
    month: Date, 
    categoryBudgets: { categoryId: string; amount: number }[]
  ) {
    try {
      const periodStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const periodEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      return await this.withTransaction(async (tx) => {
        const createdBudgets = [];

        for (const categoryBudget of categoryBudgets) {
          // Check if budget already exists
          const existing = await tx.budget.findFirst({
            where: {
              userId,
              categoryId: categoryBudget.categoryId,
              periodStart
            }
          });

          if (!existing) {
            const budget = await tx.budget.create({
              data: {
                userId,
                categoryId: categoryBudget.categoryId,
                amount: categoryBudget.amount,
                periodStart,
                periodEnd
              },
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    budgetClassification: true
                  }
                }
              }
            });
            createdBudgets.push(budget);
          }
        }

        return createdBudgets;
      });
    } catch (error) {
      this.handleError(error, 'createMonthlyBudgets');
    }
  }
}