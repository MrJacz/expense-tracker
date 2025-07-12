// src/types/analytics.ts
export interface CategoryAnalytics {
	id: number;
	name: string;
	color: string;
	icon: string;
	value: number;
	count: number;
	average: number;
	percentage: number;
}

export interface TrendAnalytics {
	date: string;
	amount: number;
	count: number;
	average: number;
	formattedDate: string;
}

export interface WeeklyAnalytics {
	week: string;
	amount: number;
	count: number;
	average: number;
	formattedWeek: string;
}

export interface MonthlyAnalytics {
	month: string;
	year: number;
	monthNumber: number;
	amount: number;
	count: number;
	average: number;
	formattedMonth: string;
}

export interface DayPatternAnalytics {
	dayOfWeek: number;
	dayName: string;
	amount: number;
	count: number;
	average: number;
}

export interface TopSpendingDay {
	date: string;
	amount: number;
	count: number;
	categories: string[];
	formattedDate: string;
}

export interface AnalyticsSummary {
	totalTransactions: number;
	totalAmount: number;
	avgTransaction: number;
	minTransaction: number;
	maxTransaction: number;
	uniqueCategories: number;
	uniqueDays: number;
}

export interface AnalyticsData {
	categoryBreakdown: CategoryAnalytics[];
	dailyTrend: TrendAnalytics[];
	weeklyTrend: WeeklyAnalytics[];
	monthlyTrend: MonthlyAnalytics[];
	dayPatterns: DayPatternAnalytics[];
	topSpendingDays: TopSpendingDay[];
	summary: AnalyticsSummary;
}

export interface AnalyticsFilters {
	startDate?: string;
	endDate?: string;
	type?: string;
}