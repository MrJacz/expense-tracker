import type { PrismaClient } from "@prisma/client";
import { prisma } from "./index";

/**
 * Base Data Service Class
 *
 * Provides common functionality for all data services including:
 * - Database connection management
 * - Transaction support
 * - Error handling
 * - Common query patterns
 */
export abstract class BaseDataService {
	/**
	 * Execute operations within a database transaction
	 * @param fn - Function to execute within transaction
	 * @returns Promise with transaction result
	 */
	protected static async withTransaction<T>(
		fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>
	): Promise<T> {
		return await prisma.$transaction(fn);
	}

	/**
	 * Common pagination helper
	 * @param page - Page number (1-based)
	 * @param limit - Items per page
	 * @returns Skip and take values for Prisma
	 */
	protected static getPagination(page: number = 1, limit: number = 100) {
		const skip = (page - 1) * limit;
		return { skip, take: limit };
	}

	/**
	 * Common date range filter
	 * @param startDate - Start date string
	 * @param endDate - End date string
	 * @returns Prisma date filter object
	 */
	protected static getDateFilter(startDate?: string, endDate?: string) {
		const filter: { gte?: Date; lte?: Date } = {};

		if (startDate) {
			filter.gte = new Date(startDate);
		}

		if (endDate) {
			filter.lte = new Date(endDate);
		}

		return Object.keys(filter).length > 0 ? filter : undefined;
	}

	/**
	 * Common search filter for text fields
	 * @param search - Search term
	 * @param fields - Fields to search in
	 * @returns Prisma OR filter
	 */
	protected static getSearchFilter(search?: string, fields: string[] = ["name", "description"]) {
		if (!search) return undefined;

		return {
			OR: fields.map((field) => ({
				[field]: {
					contains: search,
					mode: "insensitive" as const
				}
			}))
		};
	}

	/**
	 * Common error handler
	 * @param error - Error object
	 * @param operation - Operation name for logging
	 */
	protected static handleError(error: unknown, operation: string): never {
		console.error(`Data Service Error [${operation}]:`, error);

		// Handle known Prisma errors
		if (error && typeof error === "object" && "code" in error) {
			if (error.code === "P2002") {
				throw new Error("Duplicate entry found");
			}

			if (error.code === "P2025") {
				throw new Error("Record not found");
			}
		}

		// Re-throw with more context
		throw new Error(`Database operation failed: ${operation}`);
	}

	/**
	 * Validate user ownership of a resource
	 * @param resourceUserId - User ID from the resource
	 * @param currentUserId - Current user ID
	 */
	protected static validateUserOwnership(resourceUserId: string, currentUserId: string) {
		if (resourceUserId !== currentUserId) {
			throw new Error("Unauthorized: User does not own this resource");
		}
	}
}
