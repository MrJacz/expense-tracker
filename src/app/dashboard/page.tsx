"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Expense, Category, CreateExpenseData } from "@/types/expense";

export default function DashboardPage() {
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
	const [loading, setLoading] = useState(true);

	// Fetch initial data
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch categories and expenses in parallel
				const [categoriesRes, expensesRes] = await Promise.all([fetch("/api/categories"), fetch("/api/expenses")]);

				const [categoriesData, expensesData] = await Promise.all([categoriesRes.json(), expensesRes.json()]);

				setCategories(categoriesData.categories || []);
				setExpenses(expensesData.expenses || []);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleAddExpense = async (data: CreateExpenseData) => {
		try {
			const response = await fetch("/api/expenses", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			});

			if (response.ok) {
				const result = await response.json();
				setExpenses((prev) => [result.expense, ...prev]);
			} else {
				const error = await response.json();
				throw new Error(error.error || "Failed to create expense");
			}
		} catch (error) {
			console.error("Error creating expense:", error);
			throw error;
		}
	};

	const handleUpdateExpense = async (data: CreateExpenseData) => {
		if (!editingExpense) return;

		try {
			const response = await fetch(`/api/expenses/${editingExpense.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			});

			if (response.ok) {
				const result = await response.json();
				setExpenses((prev) => prev.map((exp) => (exp.id === editingExpense.id ? result.expense : exp)));
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

	const handleDeleteExpense = async (expenseId: string) => {
		try {
			const response = await fetch(`/api/expenses/${expenseId}`, {
				method: "DELETE"
			});

			if (response.ok) {
				setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
			} else {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete expense");
			}
		} catch (error) {
			console.error("Error deleting expense:", error);
			throw error;
		}
	};

	const handleFormSubmit = (data: CreateExpenseData) => {
		if (editingExpense) {
			return handleUpdateExpense(data);
		} else {
			return handleAddExpense(data);
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

	// Calculate summary stats
	const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
	const thisMonthExpenses = expenses
		.filter((exp) => {
			const expenseDate = new Date(exp.date);
			const now = new Date();
			return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
		})
		.reduce((sum, exp) => sum + exp.amount, 0);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD"
		}).format(amount);
	};

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Dashboard</h1>
						<p className="text-gray-600">Track and manage your expenses</p>
					</div>
					<Button onClick={() => setIsFormOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Add Expense
					</Button>
				</div>

				{/* Summary Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
							<span className="text-2xl">💰</span>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
							<p className="text-xs text-muted-foreground">{expenses.length} transactions</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">This Month</CardTitle>
							<span className="text-2xl">📅</span>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(thisMonthExpenses)}</div>
							<p className="text-xs text-muted-foreground">Current month spending</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Categories</CardTitle>
							<span className="text-2xl">🏷️</span>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{categories.length}</div>
							<p className="text-xs text-muted-foreground">Available categories</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Avg per Day</CardTitle>
							<span className="text-2xl">📊</span>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(expenses.length > 0 ? totalExpenses / expenses.length : 0)}</div>
							<p className="text-xs text-muted-foreground">Average transaction</p>
						</CardContent>
					</Card>
				</div>

				{/* Expenses List */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Expenses</CardTitle>
						<CardDescription>Your latest expense transactions</CardDescription>
					</CardHeader>
					<CardContent>
						<ExpenseList expenses={expenses} onEditAction={handleEditExpense} onDeleteAction={handleDeleteExpense} loading={loading} />
					</CardContent>
				</Card>
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
