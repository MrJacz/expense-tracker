import { BaseDataService } from './BaseDataService';
import { prisma } from './index';
import { BudgetCategoryType } from '@prisma/client';

export interface CategoryFilters {
  includeDefault?: boolean;
  budgetClassification?: BudgetCategoryType;
  parentCategoryId?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryCreateData {
  name: string;
  parentCategoryId?: string;
  budgetClassification?: BudgetCategoryType;
}

export interface CategoryUpdateData {
  name?: string;
  parentCategoryId?: string;
  budgetClassification?: BudgetCategoryType;
}

export class CategoryDataService extends BaseDataService {
  /**
   * Get all categories for a user (including default categories)
   */
  static async getCategories(userId: string, filters: CategoryFilters = {}) {
    try {
      const {
        includeDefault = true,
        budgetClassification,
        parentCategoryId,
        sortBy = 'name',
        sortOrder = 'asc'
      } = filters;

      const where: any = {
        OR: [
          { userId }
        ]
      };

      if (includeDefault) {
        where.OR.push({ isDefault: true });
      }

      if (budgetClassification) {
        where.budgetClassification = budgetClassification;
      }

      if (parentCategoryId !== undefined) {
        where.parentCategoryId = parentCategoryId;
      }

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      return await prisma.category.findMany({
        where,
        include: {
          parentCategory: true,
          subcategories: true,
          _count: {
            select: {
              transactionSplits: true
            }
          }
        },
        orderBy: [
          { isDefault: 'desc' }, // Default categories first
          orderBy
        ]
      });
    } catch (error) {
      this.handleError(error, 'getCategories');
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(userId: string, categoryId: string) {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [
            { userId },
            { isDefault: true }
          ]
        },
        include: {
          parentCategory: true,
          subcategories: true,
          transactionSplits: {
            take: 10,
            orderBy: { transaction: { date: 'desc' } },
            include: {
              transaction: {
                select: {
                  id: true,
                  description: true,
                  date: true,
                  type: true
                }
              }
            }
          }
        }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    } catch (error) {
      this.handleError(error, 'getCategoryById');
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(userId: string, data: CategoryCreateData) {
    try {
      // Validate parent category if provided
      if (data.parentCategoryId) {
        const parentCategory = await prisma.category.findFirst({
          where: {
            id: data.parentCategoryId,
            OR: [
              { userId },
              { isDefault: true }
            ]
          }
        });

        if (!parentCategory) {
          throw new Error('Parent category not found');
        }
      }

      return await prisma.category.create({
        data: {
          userId,
          name: data.name,
          parentCategoryId: data.parentCategoryId,
          budgetClassification: data.budgetClassification
        }
      });
    } catch (error) {
      this.handleError(error, 'createCategory');
    }
  }

  /**
   * Update a category
   */
  static async updateCategory(userId: string, categoryId: string, data: CategoryUpdateData) {
    try {
      // Verify ownership (can't update default categories)
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId, isDefault: false }
      });

      if (!category) {
        throw new Error('Category not found or cannot be updated');
      }

      return await prisma.category.update({
        where: { id: categoryId },
        data
      });
    } catch (error) {
      this.handleError(error, 'updateCategory');
    }
  }

  /**
   * Delete a category
   */
  static async deleteCategory(userId: string, categoryId: string) {
    try {
      // Verify ownership (can't delete default categories)
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId, isDefault: false }
      });

      if (!category) {
        throw new Error('Category not found or cannot be deleted');
      }

      // Check if category has any transaction splits
      const hasTransactions = await prisma.transactionSplit.findFirst({
        where: { categoryId }
      });

      if (hasTransactions) {
        throw new Error('Cannot delete category with existing transactions');
      }

      await prisma.category.delete({
        where: { id: categoryId }
      });

      return { success: true };
    } catch (error) {
      this.handleError(error, 'deleteCategory');
    }
  }

  /**
   * Get category spending analytics
   */
  static async getCategoryAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    try {
      const dateFilter: any = {};
      if (startDate || endDate) {
        dateFilter.transaction = {};
        if (startDate) dateFilter.transaction.date = { gte: startDate };
        if (endDate) {
          if (dateFilter.transaction.date) {
            dateFilter.transaction.date.lte = endDate;
          } else {
            dateFilter.transaction.date = { lte: endDate };
          }
        }
      }

      const categories = await prisma.category.findMany({
        where: {
          OR: [
            { userId },
            { isDefault: true }
          ]
        },
        include: {
          transactionSplits: {
            where: {
              transaction: {
                userId,
                type: 'expense',
                ...dateFilter.transaction
              }
            },
            select: {
              amount: true
            }
          }
        }
      });

      return categories.map(category => {
        const totalAmount = category.transactionSplits.reduce(
          (sum, split) => sum + split.amount.toNumber(), 
          0
        );
        const transactionCount = category.transactionSplits.length;

        return {
          id: category.id,
          name: category.name,
          budgetClassification: category.budgetClassification,
          totalAmount,
          transactionCount,
          averageAmount: transactionCount > 0 ? totalAmount / transactionCount : 0
        };
      }).filter(category => category.transactionCount > 0);
    } catch (error) {
      this.handleError(error, 'getCategoryAnalytics');
    }
  }
}