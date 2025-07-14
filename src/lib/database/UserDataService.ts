import { BaseDataService } from './BaseDataService';
import { prisma } from './index';
import bcrypt from 'bcryptjs';

export interface UserWithCredentials {
  id: string;
  email: string;
  name: string | null;
  emailVerified: Date | null;
  image: string | null;
  hasPassword: boolean;
}

export interface UserPreferences {
  defaultCurrency?: string;
  theme?: string;
}

export class UserDataService extends BaseDataService {
  /**
   * Get user by email with credential check
   */
  static async getUserByEmail(email: string): Promise<UserWithCredentials | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          credentials: true
        }
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        image: user.image,
        hasPassword: !!user.credentials
      };
    } catch (error) {
      this.handleError(error, 'getUserByEmail');
    }
  }

  /**
   * Verify user password
   */
  static async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      const credentials = await prisma.userCredentials.findUnique({
        where: { userId }
      });

      if (!credentials) return false;

      return await bcrypt.compare(password, credentials.passwordHash);
    } catch (error) {
      this.handleError(error, 'verifyPassword');
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId: string, preferences: UserPreferences) {
    try {
      return await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          ...preferences,
          updatedAt: new Date()
        },
        create: {
          userId,
          defaultCurrency: preferences.defaultCurrency || 'AUD',
          theme: preferences.theme || 'system'
        }
      });
    } catch (error) {
      this.handleError(error, 'updateUserPreferences');
    }
  }

  /**
   * Create user with password
   */
  static async createUserWithPassword(
    email: string,
    password: string,
    name?: string
  ) {
    try {
      return await this.withTransaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email,
            name,
            emailVerified: new Date()
          }
        });

        // Hash password and create credentials
        const passwordHash = await bcrypt.hash(password, 12);
        await tx.userCredentials.create({
          data: {
            userId: user.id,
            passwordHash
          }
        });

        // Create default preferences
        await tx.userPreferences.create({
          data: {
            userId: user.id,
            defaultCurrency: 'AUD',
            theme: 'system'
          }
        });

        return user;
      });
    } catch (error) {
      this.handleError(error, 'createUserWithPassword');
    }
  }
}

// Export as UserRepository for backward compatibility with auth.ts
export const UserRepository = UserDataService;