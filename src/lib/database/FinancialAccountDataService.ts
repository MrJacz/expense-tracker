import { BaseDataService } from './BaseDataService';
import { prisma } from './index';
import { AccountType, AssetType } from '@prisma/client';

export interface FinancialAccountFilters {
  type?: AccountType;
  isAsset?: boolean;
  sortBy?: 'name' | 'balance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface FinancialAccountCreateData {
  name: string;
  type: AccountType;
  balance?: number;
  isAsset?: boolean;
  assetType?: AssetType;
  apiSource?: string;
  apiIdentifier?: string;
}

export interface FinancialAccountUpdateData {
  name?: string;
  balance?: number;
  isAsset?: boolean;
  assetType?: AssetType;
}

export class FinancialAccountDataService extends BaseDataService {
  /**
   * Get all financial accounts for a user
   */
  static async getAccounts(userId: string, filters: FinancialAccountFilters = {}) {
    try {
      const {
        type,
        isAsset,
        sortBy = 'name',
        sortOrder = 'asc'
      } = filters;

      const where: any = { userId };
      
      if (type) where.type = type;
      if (isAsset !== undefined) where.isAsset = isAsset;

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      return await prisma.financialAccount.findMany({
        where,
        include: {
          debtDetails: true,
          holdings: {
            include: {
              security: true
            }
          }
        },
        orderBy
      });
    } catch (error) {
      this.handleError(error, 'getAccounts');
    }
  }

  /**
   * Get account by ID
   */
  static async getAccountById(userId: string, accountId: string) {
    try {
      const account = await prisma.financialAccount.findFirst({
        where: { id: accountId, userId },
        include: {
          debtDetails: true,
          holdings: {
            include: {
              security: true
            }
          },
          transactions: {
            take: 10,
            orderBy: { date: 'desc' },
            include: {
              splits: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      if (!account) {
        throw new Error('Account not found');
      }

      return account;
    } catch (error) {
      this.handleError(error, 'getAccountById');
    }
  }

  /**
   * Create a new financial account
   */
  static async createAccount(userId: string, data: FinancialAccountCreateData) {
    try {
      return await prisma.financialAccount.create({
        data: {
          userId,
          name: data.name,
          type: data.type,
          balance: data.balance || 0,
          isAsset: data.isAsset || false,
          assetType: data.assetType,
          apiSource: data.apiSource,
          apiIdentifier: data.apiIdentifier
        }
      });
    } catch (error) {
      this.handleError(error, 'createAccount');
    }
  }

  /**
   * Update an account
   */
  static async updateAccount(userId: string, accountId: string, data: FinancialAccountUpdateData) {
    try {
      // Verify ownership
      const account = await prisma.financialAccount.findFirst({
        where: { id: accountId, userId }
      });

      if (!account) {
        throw new Error('Account not found');
      }

      return await prisma.financialAccount.update({
        where: { id: accountId },
        data
      });
    } catch (error) {
      this.handleError(error, 'updateAccount');
    }
  }

  /**
   * Delete an account
   */
  static async deleteAccount(userId: string, accountId: string) {
    try {
      // Verify ownership
      const account = await prisma.financialAccount.findFirst({
        where: { id: accountId, userId }
      });

      if (!account) {
        throw new Error('Account not found');
      }

      await prisma.financialAccount.delete({
        where: { id: accountId }
      });

      return { success: true };
    } catch (error) {
      this.handleError(error, 'deleteAccount');
    }
  }

  /**
   * Get net worth calculation
   */
  static async getNetWorth(userId: string) {
    try {
      const accounts = await prisma.financialAccount.findMany({
        where: { userId },
        select: { balance: true, isAsset: true }
      });

      const assets = accounts
        .filter(account => account.isAsset)
        .reduce((sum, account) => sum + account.balance.toNumber(), 0);

      const liabilities = accounts
        .filter(account => !account.isAsset)
        .reduce((sum, account) => sum + account.balance.toNumber(), 0);

      return {
        assets,
        liabilities,
        netWorth: assets - liabilities
      };
    } catch (error) {
      this.handleError(error, 'getNetWorth');
    }
  }
}