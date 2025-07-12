"use client";

import { useState, useEffect, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { FilterPanel } from "@/components/expenses/filter-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, RefreshCw, TrendingUp, TrendingDown, Calendar, Target } from "lucide-react";
import { useExpenseFilters } from "@/hooks/use-expense-filters";
import { Expense, Category, CreateExpenseData } from "@/types/expense";

// Prevent static generation to avoid pre-render issues with client components
// ...existing code...

function DashboardContent() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
	const [categoriesLoading, setCategoriesLoading] = useState(true);

	const { filters, updateFilters, clearAllFilters, data, isLoading, error, refreshData } = useExpenseFilters();

	// Fetch categories
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await fetch("/api/categories");
				const result = await response.json();
				setCategories(result.categories || []);
			} catch (error) {
				console.error("Error fetching categories:", error);
			} finally {
				setCategoriesLoading(false);
			}
		};

		fetchCategories();
	}, []);

	const handleAddExpense = async (expenseData: CreateExpenseData) => {
		try {
			const response = await fetch("/api/expenses", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(expenseData)
			});

			if (response.ok) {
				// Refresh the data to get updated list
				refreshData();
			} else {
				const error = await response.json();
				throw new Error(error.error || "Failed to create expense");
			}
		} catch (error) {
			console.error("Error creating expense:", error);
			throw error;
		}
	};

	const handleUpdateExpense = async (expenseData: CreateExpenseData) => {
		if (!editingExpense) return;

		try {
			const response = await fetch(`/api/expenses/${editingExpense.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(expenseData)
			});

			if (response.ok) {
				refreshData();
				setEditingExpense(null);
			} else {
				const error = await response.json();
				throw new Error(error.error || "Failed to update expense");
			}
		} catch (error) {
			console.error("Error updating expense:", error);
			throw error;
		}
	};

	const handleDeleteExpense = async (expenseId: number) => {
		try {
			const response = await fetch(`/api/expenses/${expenseId}`, {
				method: "DELETE"
			});

			if (response.ok) {
				refreshData();
			} else {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete expense");
			}
		} catch (error) {
			console.error("Error deleting expense:", error);
			throw error;
		}
	};

	const handleFormSubmit = (expenseData: CreateExpenseData) => {
		if (editingExpense) {
			return handleUpdateExpense(expenseData);
		} else {
			return handleAddExpense(expenseData);
		}
	};

	const handleEditExpense = (expense: Expense) => {
		setEditingExpense(expense);
		setIsFormOpen(true);
	};

	const handleFormClose = () => {
		setIsFormOpen(false);
		setEditingExpense(null);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD"
		}).format(amount);
	};

	// Calculate additional stats
	const expenses = data?.expenses || [];
	const summary = data?.summary;

	// Calculate this week vs last week comparison
	const now = new Date();
	const thisWeekStart = new Date(now);
	thisWeekStart.setDate(now.getDate() - now.getDay());

	const lastWeekStart = new Date(thisWeekStart);
	lastWeekStart.setDate(thisWeekStart.getDate() - 7);
	const lastWeekEnd = new Date(thisWeekStart);
	lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

	const thisWeekExpenses = expenses
		.filter((exp) => {
			const expDate = new Date(exp.date);
			return expDate >= thisWeekStart;
		})
		.reduce((sum, exp) => sum + exp.amount, 0);

	const lastWeekExpenses = expenses
		.filter((exp) => {
			const expDate = new Date(exp.date);
			return expDate >= lastWeekStart && expDate <= lastWeekEnd;
		})
		.reduce((sum, exp) => sum + exp.amount, 0);

	const weeklyChange = lastWeekExpenses > 0 ? ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100 : thisWeekExpenses > 0 ? 100 : 0;

	if (categoriesLoading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold">Dashboard</h1>
						<p className="text-gray-600">Track and manage your expenses</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
							<RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
							Refresh
						</Button>
						<Button onClick={() => setIsFormOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Expense
						</Button>
					</div>
				</div>

				{/* Error Display */}
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Filter Panel */}
				<FilterPanel filters={filters} onFiltersChangeAction={updateFilters} categories={categories} />

				{/* Summary Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
							<span className="text-2xl">💰</span>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(summary?.totalAmount || 0)}</div>
							<p className="text-xs text-muted-foreground">{summary?.totalExpenses || 0} transactions</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">This Week</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(thisWeekExpenses)}</div>
							<div className="flex items-center text-xs text-muted-foreground">
								{weeklyChange !== 0 && (
									<>
										{weeklyChange > 0 ? (
											<TrendingUp className="mr-1 h-3 w-3 text-red-500" />
										) : (
											<TrendingDown className="mr-1 h-3 w-3 text-green-500" />
										)}
										<span className={weeklyChange > 0 ? "text-red-500" : "text-green-500"}>
											{Math.abs(weeklyChange).toFixed(1)}% vs last week
										</span>
									</>
								)}
								{weeklyChange === 0 && "No change from last week"}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Categories Used</CardTitle>
							<Target className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{summary?.uniqueCategories || 0}</div>
							<p className="text-xs text-muted-foreground">of {categories.length} available</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Avg per Transaction</CardTitle>
							<span className="text-2xl">📊</span>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(summary?.avgAmount || 0)}</div>
							<p className="text-xs text-muted-foreground">Average expense amount</p>
						</CardContent>
					</Card>
				</div>

				{/* Results Summary */}
				{data && (
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>
										{expenses.length === data.pagination.total
											? `All Expenses (${expenses.length})`
											: `Filtered Expenses (${expenses.length} of ${data.pagination.total})`}
									</CardTitle>
									<CardDescription>
										{expenses.length === 0
											? "No expenses found matching your filters"
											: `Total: ${formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}`}
									</CardDescription>
								</div>
								{expenses.length !== data.pagination.total && (
									<Button variant="outline" size="sm" onClick={clearAllFilters}>
										Clear Filters
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent>
							<ExpenseList
								expenses={expenses}
								onEditAction={handleEditExpense}
								onDeleteAction={async (expenseId) => await handleDeleteExpense(Number(expenseId))}
								loading={isLoading}
							/>

							{/* Pagination info */}
							{data.pagination.hasMore && (
								<div className="mt-4 text-center text-sm text-gray-500">
									Showing {expenses.length} of {data.pagination.total} expenses
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>

			{/* Expense Form Dialog */}
			<ExpenseForm
				isOpen={isFormOpen}
				onCloseAction={handleFormClose}
				onSubmitAction={handleFormSubmit}
				editingExpense={editingExpense}
				categories={categories}
			/>
		</DashboardLayout>
	);
}

export default function DashboardPage() {
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
			<DashboardContent />
		</Suspense>
	);
}
