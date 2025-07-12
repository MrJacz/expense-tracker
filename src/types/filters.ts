// src/types/filters.ts
import { Expense } from "./expense";

export interface ExpenseFilters {
	categories: number[];
	startDate?: string;
	endDate?: string;
	search?: string;
	minAmount?: number;
	maxAmount?: number;
	sortBy: "date" | "amount" | "description" | "category" | "created";
	sortOrder: "asc" | "desc";
}

export interface QuickDateFilter {
	label: string;
	value: string;
	startDate: string;
	endDate: string;
}

export interface ExpenseApiResponse {
	expenses: Expense[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
	summary: {
		totalExpenses: number;
		totalAmount: number;
		avgAmount: number;
		uniqueCategories: number;
	};
	filters: unknown;
}

export interface FilterState {
	filters: ExpenseFilters;
	isLoading: boolean;
	activeFiltersCount: number;
}

// Utility functions for filters
export const getDefaultFilters = (): ExpenseFilters => ({
	categories: [],
	sortBy: "date",
	sortOrder: "desc"
});

export const getQuickDateFilters = (): QuickDateFilter[] => {
	const now = new Date();
	const today = now.toISOString().split("T")[0];

	// This week (Monday to Sunday)
	const monday = new Date(now);
	const dayOfWeek = now.getDay();
	const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0
	monday.setDate(now.getDate() - daysToMonday);
	const weekStart = monday.toISOString().split("T")[0];

	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	const weekEnd = sunday.toISOString().split("T")[0];

	// This month
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
	const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

	// Last month
	const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
	const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];

	// Last 7 days
	const sevenDaysAgo = new Date(now);
	sevenDaysAgo.setDate(now.getDate() - 7);
	const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

	// Last 30 days
	const thirtyDaysAgo = new Date(now);
	thirtyDaysAgo.setDate(now.getDate() - 30);
	const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

	return [
		{ label: "Today", value: "today", startDate: today, endDate: today },
		{ label: "This Week", value: "this_week", startDate: weekStart, endDate: weekEnd },
		{ label: "Last 7 Days", value: "last_7_days", startDate: sevenDaysAgoStr, endDate: today },
		{ label: "This Month", value: "this_month", startDate: monthStart, endDate: monthEnd },
		{ label: "Last Month", value: "last_month", startDate: lastMonthStart, endDate: lastMonthEnd },
		{ label: "Last 30 Days", value: "last_30_days", startDate: thirtyDaysAgoStr, endDate: today }
	];
};

export const countActiveFilters = (filters: ExpenseFilters): number => {
	let count = 0;

	if (filters.categories.length > 0) count++;
	if (filters.startDate || filters.endDate) count++;
	if (filters.search && filters.search.trim()) count++;
	if (filters.minAmount !== undefined && filters.minAmount > 0) count++;
	if (filters.maxAmount !== undefined && filters.maxAmount > 0) count++;

	return count;
};

export const buildQueryString = (filters: ExpenseFilters): string => {
	const params = new URLSearchParams();

	if (filters.categories.length > 0) {
		params.set("categories", filters.categories.join(","));
	}
	if (filters.startDate) params.set("startDate", filters.startDate);
	if (filters.endDate) params.set("endDate", filters.endDate);
	if (filters.search) params.set("search", filters.search);
	if (filters.minAmount !== undefined && filters.minAmount > 0) {
		params.set("minAmount", filters.minAmount.toString());
	}
	if (filters.maxAmount !== undefined && filters.maxAmount > 0) {
		params.set("maxAmount", filters.maxAmount.toString());
	}
	// Only set sort params if they differ from defaults
	if (filters.sortBy !== "date") {
		params.set("sortBy", filters.sortBy);
	}
	if (filters.sortOrder !== "desc") {
		params.set("sortOrder", filters.sortOrder);
	}

	return params.toString();
};

export const parseFiltersFromUrl = (searchParams: URLSearchParams): ExpenseFilters => {
	return {
		categories:
			searchParams
				.get("categories")
				?.split(",")
				.map(Number)
				.filter((n) => !isNaN(n)) || [],
		startDate: searchParams.get("startDate") || undefined,
		endDate: searchParams.get("endDate") || undefined,
		search: searchParams.get("search") || undefined,
		minAmount: searchParams.get("minAmount") ? parseFloat(searchParams.get("minAmount")!) : undefined,
		maxAmount: searchParams.get("maxAmount") ? parseFloat(searchParams.get("maxAmount")!) : undefined,
		sortBy: (searchParams.get("sortBy") as ExpenseFilters["sortBy"]) || "date",
		sortOrder: (searchParams.get("sortOrder") as ExpenseFilters["sortOrder"]) || "desc"
	};
};
