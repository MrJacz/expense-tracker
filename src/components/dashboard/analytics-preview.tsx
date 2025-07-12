"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryPieChart } from "@/components/charts";
import { BarChart3, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { CategoryAnalytics } from "@/types/analytics";

interface AnalyticsPreviewProps {
	expenses: any[];
}

export function AnalyticsPreview({ expenses }: AnalyticsPreviewProps) {
	const [categoryData, setCategoryData] = useState<CategoryAnalytics[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchQuickAnalytics = async () => {
			try {
				// Get last 30 days of data
				const thirtyDaysAgo = new Date();
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
				const startDate = thirtyDaysAgo.toISOString().split("T")[0];

				const response = await fetch(`/api/analytics?type=category&startDate=${startDate}`);
				const data = await response.json();

				setCategoryData(data.analytics?.categoryBreakdown?.slice(0, 4) || []);
			} catch (error) {
				console.error("Error fetching analytics preview:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchQuickAnalytics();
	}, []);

	// Calculate basic stats from recent expenses
	const last7Days = expenses.filter((exp) => {
		const expenseDate = new Date(exp.date);
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		return expenseDate >= sevenDaysAgo;
	});

	const prev7Days = expenses.filter((exp) => {
		const expenseDate = new Date(exp.date);
		const fourteenDaysAgo = new Date();
		fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		return expenseDate >= fourteenDaysAgo && expenseDate < sevenDaysAgo;
	});

	const thisWeekTotal = last7Days.reduce((sum, exp) => sum + exp.amount, 0);
	const lastWeekTotal = prev7Days.reduce((sum, exp) => sum + exp.amount, 0);

	const weeklyChange = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : thisWeekTotal > 0 ? 100 : 0;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0
		}).format(amount);
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Analytics Preview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-32">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<div>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Analytics Preview
					</CardTitle>
					<CardDescription>Quick insights from your last 30 days</CardDescription>
				</div>
				<Button asChild variant="ghost" size="sm">
					<Link href="/analytics" className="flex items-center gap-1">
						View All
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					{/* Category Breakdown Mini Chart */}
					<div className="space-y-3">
						<h4 className="text-sm font-medium">Top Categories</h4>
						{categoryData.length > 0 ? (
							<div className="h-40">
								<CategoryPieChart data={categoryData} />
							</div>
						) : (
							<div className="flex items-center justify-center h-40 text-gray-500 text-sm">No category data available</div>
						)}
					</div>

					{/* Quick Stats */}
					<div className="space-y-3">
						<h4 className="text-sm font-medium">Weekly Trend</h4>
						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div>
									<div className="text-sm text-gray-600">This Week</div>
									<div className="font-bold">{formatCurrency(thisWeekTotal)}</div>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-600">vs Last Week</div>
									<div
										className={`flex items-center gap-1 font-medium ${
											weeklyChange > 0 ? "text-red-600" : weeklyChange < 0 ? "text-green-600" : "text-gray-600"
										}`}
									>
										{weeklyChange > 0 ? (
											<TrendingUp className="h-4 w-4" />
										) : weeklyChange < 0 ? (
											<TrendingDown className="h-4 w-4" />
										) : null}
										{weeklyChange !== 0 && <span>{Math.abs(weeklyChange).toFixed(1)}%</span>}
										{weeklyChange === 0 && <span>No change</span>}
									</div>
								</div>
							</div>

							{/* Top Category */}
							{categoryData.length > 0 && (
								<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
									<div className="flex items-center gap-2">
										<span>{categoryData[0].icon}</span>
										<div>
											<div className="text-sm text-gray-600">Top Category</div>
											<div className="font-medium">{categoryData[0].name}</div>
										</div>
									</div>
									<div className="text-right">
										<div className="font-bold">{formatCurrency(categoryData[0].value)}</div>
										<div className="text-sm text-gray-600">{categoryData[0].percentage.toFixed(1)}%</div>
									</div>
								</div>
							)}

							{/* Transaction Count */}
							<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
								<div>
									<div className="text-sm text-gray-600">Recent Activity</div>
									<div className="font-medium">{last7Days.length} transactions</div>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-600">Avg per transaction</div>
									<div className="font-bold">{last7Days.length > 0 ? formatCurrency(thisWeekTotal / last7Days.length) : "$0"}</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-4 pt-4 border-t">
					<Button asChild className="w-full" variant="outline">
						<Link href="/analytics" className="flex items-center gap-2">
							<BarChart3 className="h-4 w-4" />
							View Detailed Analytics
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
