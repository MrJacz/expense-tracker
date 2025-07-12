"use client";

import { useState, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, RefreshCw, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
	CategoryPieChart,
	SpendingTrendChart,
	MonthlyComparisonChart,
	DayPatternsChart,
	TopSpendingDaysChart,
	CategoryLegend
} from "@/components/charts";

// Prevent static generation to avoid pre-render issues with client components
// ...existing code...
import { useAnalytics } from "@/hooks/use-analytics";
import { getQuickAnalyticsFilters, formatCurrency, calculateGrowth } from "@/utils/analytics";

function AnalyticsContent() {
	const [startDate, setStartDate] = useState<Date | undefined>();
	const [endDate, setEndDate] = useState<Date | undefined>();

	const { data, isLoading, error, filters, setDateRange, clearFilters, refetch } = useAnalytics();

	const quickFilters = getQuickAnalyticsFilters();

	const handleQuickFilter = (filter: { startDate?: string; endDate?: string; label: string }) => {
		if (filter.startDate && filter.endDate) {
			setStartDate(new Date(filter.startDate));
			setEndDate(new Date(filter.endDate));
			setDateRange(filter.startDate, filter.endDate);
		} else {
			setStartDate(undefined);
			setEndDate(undefined);
			setDateRange(undefined, undefined);
		}
	};

	const handleCustomDateRange = () => {
		const startStr = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
		const endStr = endDate ? format(endDate, "yyyy-MM-dd") : undefined;
		setDateRange(startStr, endStr);
	};

	const clearDateRange = () => {
		setStartDate(undefined);
		setEndDate(undefined);
		clearFilters();
	};

	// Calculate comparison metrics
	const summary = data?.summary;
	const categoryData = data?.categoryBreakdown || [];
	const dailyTrend = data?.dailyTrend || [];
	const monthlyTrend = data?.monthlyTrend || [];
	const dayPatterns = data?.dayPatterns || [];
	const topSpendingDays = data?.topSpendingDays || [];

	// Calculate period comparisons

	// Get previous period data for comparison (simplified)
	const midpoint = Math.floor(dailyTrend.length / 2);
	const firstHalf = dailyTrend.slice(0, midpoint);
	const secondHalf = dailyTrend.slice(midpoint);

	const firstHalfTotal = firstHalf.reduce((sum: number, day: { amount: number }) => sum + day.amount, 0);
	const secondHalfTotal = secondHalf.reduce((sum: number, day: { amount: number }) => sum + day.amount, 0);
	const trendDirection = secondHalfTotal > firstHalfTotal ? "up" : "down";
	const trendPercentage = calculateGrowth(secondHalfTotal, firstHalfTotal);

	// Find highest spending category
	const topCategory = categoryData.length > 0 ? categoryData[0] : null;

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold">Analytics</h1>
						<p className="text-gray-600">Insights into your spending patterns</p>
					</div>
					<Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
						<RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>

				{/* Error Display */}
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Date Range Controls */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Time Period</CardTitle>
						<CardDescription>Select a time period to analyze your spending</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2 mb-4">
							{quickFilters.map((filter, index) => (
								<Button
									key={`filter-${index}`}
									variant="outline"
									size="sm"
									onClick={() => handleQuickFilter(filter)}
									className={cn(
										filters.startDate === filter.startDate &&
											filters.endDate === filter.endDate &&
											"bg-primary text-primary-foreground"
									)}
								>
									{filter.label}
								</Button>
							))}
						</div>

						<div className="flex flex-wrap gap-2 items-center">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{startDate ? format(startDate, "MMM dd, yyyy") : "Start date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar mode="single" selected={startDate} onSelect={setStartDate} autoFocus />
								</PopoverContent>
							</Popover>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{endDate ? format(endDate, "MMM dd, yyyy") : "End date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar mode="single" selected={endDate} onSelect={setEndDate} autoFocus />
								</PopoverContent>
							</Popover>

							<Button size="sm" onClick={handleCustomDateRange}>
								Apply Range
							</Button>

							{(filters.startDate || filters.endDate) && (
								<Button variant="ghost" size="sm" onClick={clearDateRange}>
									Clear
								</Button>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Summary Cards */}
				{summary && (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Spending</CardTitle>
								<span className="text-2xl">💰</span>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
								<p className="text-xs text-muted-foreground">{summary.totalTransactions} transactions</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
								<BarChart3 className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatCurrency(summary.avgTransaction)}</div>
								<p className="text-xs text-muted-foreground">
									Range: {formatCurrency(summary.minTransaction)} - {formatCurrency(summary.maxTransaction)}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Spending Trend</CardTitle>
								{trendDirection === "up" ? (
									<TrendingUp className="h-4 w-4 text-red-500" />
								) : (
									<TrendingDown className="h-4 w-4 text-green-500" />
								)}
							</CardHeader>
							<CardContent>
								<div className={`text-2xl font-bold ${trendDirection === "up" ? "text-red-600" : "text-green-600"}`}>
									{trendDirection === "up" ? "+" : ""}
									{trendPercentage.toFixed(1)}%
								</div>
								<p className="text-xs text-muted-foreground">vs previous period</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Top Category</CardTitle>
								<PieChart className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								{topCategory ? (
									<>
										<div className="flex items-center gap-2 mb-1">
											<span>{topCategory.icon}</span>
											<span className="font-bold">{topCategory.name}</span>
										</div>
										<div className="text-lg font-bold">{formatCurrency(topCategory.value)}</div>
										<p className="text-xs text-muted-foreground">{topCategory.percentage.toFixed(1)}% of total spending</p>
									</>
								) : (
									<div className="text-sm text-gray-500">No data</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{/* Charts Grid */}
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Category Breakdown */}
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle>Spending by Category</CardTitle>
							<CardDescription>See how your money is distributed across different categories</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-6 lg:grid-cols-2">
								<div>
									<CategoryPieChart data={categoryData} />
								</div>
								<div>
									<CategoryLegend data={categoryData} />
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Daily Trend */}
					<Card>
						<CardHeader>
							<CardTitle>Daily Spending Trend</CardTitle>
							<CardDescription>Track your spending over time</CardDescription>
						</CardHeader>
						<CardContent>
							<SpendingTrendChart data={dailyTrend} />
						</CardContent>
					</Card>

					{/* Day of Week Patterns */}
					<Card>
						<CardHeader>
							<CardTitle>Spending by Day of Week</CardTitle>
							<CardDescription>Discover which days you spend the most</CardDescription>
						</CardHeader>
						<CardContent>
							<DayPatternsChart data={dayPatterns} />
						</CardContent>
					</Card>

					{/* Monthly Comparison */}
					{monthlyTrend.length > 1 && (
						<Card>
							<CardHeader>
								<CardTitle>Monthly Comparison</CardTitle>
								<CardDescription>Compare spending across different months</CardDescription>
							</CardHeader>
							<CardContent>
								<MonthlyComparisonChart data={monthlyTrend} />
							</CardContent>
						</Card>
					)}

					{/* Top Spending Days */}
					<Card>
						<CardHeader>
							<CardTitle>Highest Spending Days</CardTitle>
							<CardDescription>Your biggest spending days in this period</CardDescription>
						</CardHeader>
						<CardContent>
							<TopSpendingDaysChart data={topSpendingDays} />
						</CardContent>
					</Card>
				</div>

				{/* No Data State */}
				{!isLoading && (!data || !summary || summary.totalTransactions === 0) && (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No data for this period</h3>
							<p className="text-gray-500 text-center max-w-md">
								There are no expenses in the selected time period. Try selecting a different date range or add some expenses to see
								analytics.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</DashboardLayout>
	);
}

export default function AnalyticsPage() {
	return (
		<Suspense
			fallback={
				<DashboardLayout>
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
					</div>
				</DashboardLayout>
			}
		>
			<AnalyticsContent />
		</Suspense>
	);
}
