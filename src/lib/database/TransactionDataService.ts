import { BaseDataService } from './BaseDataService';
import { prisma } from './index';
import { Prisma, TransactionType } from '@prisma/client';

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'description' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionCreateData {
  accountId: string;
  description: string;
  date: Date;
  type: TransactionType;
  splits: {
    amount: number;
    categoryId?: string;
    notes?: string;
  }[];
}

export class TransactionDataService extends BaseDataService {
  /**
   * Get transactions for a user with filtering and pagination
   */
  static async getTransactions(userId: string, filters: TransactionFilters = {}) {
    try {
      const {
        accountId,
        categoryId,
        type,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 50,
        sortBy = 'date',
        sortOrder = 'desc'
      } = filters;

      const pagination = this.getPagination(page, limit);

      // Build where clause
      const where: Prisma.TransactionWhereInput = {
        userId
      };

      if (accountId) {
        where.accountId = accountId;
      }

      if (type) {
        where.type = type;
      }

      if (startDate || endDate) {
        const dateFilter = this.getDateFilter(startDate, endDate);
        if (dateFilter) {
          where.date = dateFilter;
        }
      }

      if (search) {
        where.description = {
          contains: search,
          mode: 'insensitive'
        };
      }

      if (categoryId) {
        where.splits = {
          some: {
            categoryId
          }
        };
      }

      // Build order by clause
      const orderBy: Prisma.TransactionOrderByWithRelationInput = {};
      switch (sortBy) {
        case 'description':
          orderBy.description = sortOrder;
          break;
        case 'date':
        default:
          orderBy.date = sortOrder;
      }

      const [transactions, totalCount] = await Promise.all([
        prisma.transaction.findMany({
          where,
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
          },
          orderBy,
          ...pagination
        }),
        prisma.transaction.count({ where })
      ]);

      return {
        transactions,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      };

    } catch (error) {
      this.handleError(error, 'getTransactions');
    }
  }

  /**
   * Create a new transaction with splits
   */
  static async createTransaction(userId: string, data: TransactionCreateData) {
    try {
      return await this.withTransaction(async (tx) => {
        // Validate user owns the account
        const account = await tx.financialAccount.findFirst({
          where: { id: data.accountId, userId }
        });

        if (!account) {
          throw new Error('Account not found or not owned by user');
        }

        // Create transaction
        const transaction = await tx.transaction.create({
          data: {
            userId,
            accountId: data.accountId,
            description: data.description,
            date: data.date,
            type: data.type
          }
        });

        // Create splits
        if (data.splits.length > 0) {
          await tx.transactionSplit.createMany({
            data: data.splits.map(split => ({
              transactionId: transaction.id,
              amount: split.amount,
              categoryId: split.categoryId,
              notes: split.notes
            }))
          });
        }

        return transaction;
      });

    } catch (error) {
      this.handleError(error, 'createTransaction');
    }
  }

  /**
   * Get transaction by ID with full details
   */
  static async getTransactionById(userId: string, transactionId: string) {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: { id: transactionId, userId },
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
          attachments: true,
          transactionTags: {
            include: {
              tag: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;

    } catch (error) {
      this.handleError(error, 'getTransactionById');
    }
  }

  /**
   * Update a transaction
   */
  static async updateTransaction(userId: string, transactionId: string, data: Partial<TransactionCreateData> & { notes?: string }) {
    try {
      return await this.withTransaction(async (tx) => {
        // Verify ownership
        const transaction = await tx.transaction.findFirst({
          where: { id: transactionId, userId }
        });

        if (!transaction) {
          throw new Error('Transaction not found or not owned by user');
        }

        // Update transaction
        const updateData: Partial<{
          accountId: string;
          description: string;
          date: Date;
          type: TransactionType;
        }> = {};
        if (data.accountId !== undefined) updateData.accountId = data.accountId;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.date !== undefined) updateData.date = data.date;
        if (data.type !== undefined) updateData.type = data.type;

        const updatedTransaction = await tx.transaction.update({
          where: { id: transactionId },
          data: updateData
        });

        // Update splits if provided
        if (data.splits) {
          // Delete existing splits
          await tx.transactionSplit.deleteMany({
            where: { transactionId }
          });

          // Create new splits
          if (data.splits.length > 0) {
            await tx.transactionSplit.createMany({
              data: data.splits.map(split => ({
                transactionId,
                amount: split.amount,
                categoryId: split.categoryId,
                notes: split.notes
              }))
            });
          }
        }

        return updatedTransaction;
      });

    } catch (error) {
      this.handleError(error, 'updateTransaction');
    }
  }

  /**
   * Delete a transaction
   */
  static async deleteTransaction(userId: string, transactionId: string) {
    try {
      // Verify ownership
      const transaction = await prisma.transaction.findFirst({
        where: { id: transactionId, userId }
      });

      if (!transaction) {
        return false;
      }

      await prisma.transaction.delete({
        where: { id: transactionId }
      });

      return true;

    } catch (error) {
      this.handleError(error, 'deleteTransaction');
    }
  }
}