import { BaseDataService } from './BaseDataService';
import { prisma } from './index';

export interface GoalFilters {
  linkedAccountId?: string;
  isAchieved?: boolean;
  sortBy?: 'name' | 'targetAmount' | 'currentAmount' | 'targetDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GoalCreateData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: Date;
  linkedAccountId?: string;
}

export interface GoalUpdateData {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: Date;
  linkedAccountId?: string;
}

export interface GoalProgressUpdate {
  amount: number;
  notes?: string;
}

export class GoalDataService extends BaseDataService {
  /**
   * Get all goals for a user
   */
  static async getGoals(userId: string, filters: GoalFilters = {}) {
    try {
      const {
        linkedAccountId,
        isAchieved,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 50
      } = filters;

      const pagination = this.getPagination(page, limit);

      const where: any = { userId };
      
      if (linkedAccountId) where.linkedAccountId = linkedAccountId;
      if (isAchieved !== undefined) {
        if (isAchieved) {
          where.currentAmount = { gte: prisma.goal.fields.targetAmount };
        } else {
          where.currentAmount = { lt: prisma.goal.fields.targetAmount };
        }
      }

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const [goals, totalCount] = await Promise.all([
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

      // Calculate progress for each goal
      const goalsWithProgress = goals.map(goal => ({
        ...goal,
        progressPercentage: goal.targetAmount.toNumber() > 0 
          ? (goal.currentAmount.toNumber() / goal.targetAmount.toNumber()) * 100 
          : 0,
        remainingAmount: goal.targetAmount.toNumber() - goal.currentAmount.toNumber(),
        isAchieved: goal.currentAmount.gte(goal.targetAmount)
      }));

      return {
        goals: goalsWithProgress,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'getGoals');
    }
  }

  /**
   * Get goal by ID
   */
  static async getGoalById(userId: string, goalId: string) {
    try {
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId },
        include: {
          linkedAccount: {
            select: { id: true, name: true }
          }
        }
      });

      if (!goal) {
        throw new Error('Goal not found');
      }

      return {
        ...goal,
        progressPercentage: goal.targetAmount.toNumber() > 0 
          ? (goal.currentAmount.toNumber() / goal.targetAmount.toNumber()) * 100 
          : 0,
        remainingAmount: goal.targetAmount.toNumber() - goal.currentAmount.toNumber(),
        isAchieved: goal.currentAmount.gte(goal.targetAmount)
      };
    } catch (error) {
      this.handleError(error, 'getGoalById');
    }
  }

  /**
   * Create a new goal
   */
  static async createGoal(userId: string, data: GoalCreateData) {
    try {
      // Validate linked account if provided
      if (data.linkedAccountId) {
        const account = await prisma.financialAccount.findFirst({
          where: { id: data.linkedAccountId, userId }
        });

        if (!account) {
          throw new Error('Linked account not found');
        }
      }

      return await prisma.goal.create({
        data: {
          userId,
          name: data.name,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount || 0,
          targetDate: data.targetDate,
          linkedAccountId: data.linkedAccountId
        },
        include: {
          linkedAccount: {
            select: { id: true, name: true }
          }
        }
      });
    } catch (error) {
      this.handleError(error, 'createGoal');
    }
  }

  /**
   * Update a goal
   */
  static async updateGoal(userId: string, goalId: string, data: GoalUpdateData) {
    try {
      // Verify ownership
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        throw new Error('Goal not found');
      }

      // Validate linked account if provided
      if (data.linkedAccountId) {
        const account = await prisma.financialAccount.findFirst({
          where: { id: data.linkedAccountId, userId }
        });

        if (!account) {
          throw new Error('Linked account not found');
        }
      }

      return await prisma.goal.update({
        where: { id: goalId },
        data,
        include: {
          linkedAccount: {
            select: { id: true, name: true }
          }
        }
      });
    } catch (error) {
      this.handleError(error, 'updateGoal');
    }
  }

  /**
   * Update goal progress
   */
  static async updateGoalProgress(userId: string, goalId: string, progressUpdate: GoalProgressUpdate) {
    try {
      // Verify ownership
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        throw new Error('Goal not found');
      }

      const newCurrentAmount = goal.currentAmount.toNumber() + progressUpdate.amount;

      return await prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: newCurrentAmount
        },
        include: {
          linkedAccount: {
            select: { id: true, name: true }
          }
        }
      });
    } catch (error) {
      this.handleError(error, 'updateGoalProgress');
    }
  }

  /**
   * Delete a goal
   */
  static async deleteGoal(userId: string, goalId: string) {
    try {
      // Verify ownership
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        throw new Error('Goal not found');
      }

      await prisma.goal.delete({
        where: { id: goalId }
      });

      return { success: true };
    } catch (error) {
      this.handleError(error, 'deleteGoal');
    }
  }

  /**
   * Get goal summary statistics
   */
  static async getGoalSummary(userId: string) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId },
        select: {
          targetAmount: true,
          currentAmount: true
        }
      });

      const totalTargetAmount = goals.reduce(
        (sum, goal) => sum + goal.targetAmount.toNumber(), 
        0
      );

      const totalCurrentAmount = goals.reduce(
        (sum, goal) => sum + goal.currentAmount.toNumber(), 
        0
      );

      const achievedGoals = goals.filter(
        goal => goal.currentAmount.gte(goal.targetAmount)
      ).length;

      const averageProgress = goals.length > 0 
        ? goals.reduce((sum, goal) => {
            const progress = goal.targetAmount.toNumber() > 0 
              ? (goal.currentAmount.toNumber() / goal.targetAmount.toNumber()) * 100 
              : 0;
            return sum + progress;
          }, 0) / goals.length
        : 0;

      return {
        totalGoals: goals.length,
        achievedGoals,
        totalTargetAmount,
        totalCurrentAmount,
        totalRemainingAmount: totalTargetAmount - totalCurrentAmount,
        averageProgress,
        completionRate: goals.length > 0 ? (achievedGoals / goals.length) * 100 : 0
      };
    } catch (error) {
      this.handleError(error, 'getGoalSummary');
    }
  }
}