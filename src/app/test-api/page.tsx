"use client";

import { Category, Expense } from "@/types/expense";
import { useEffect, useState } from "react";

export default function TestApiPage() {
	const [expenses, setExpenses] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Test categories API
				const categoriesRes = await fetch("/api/categories");
				const categoriesData = await categoriesRes.json();
				setCategories(categoriesData.categories || []);

				// Test expenses API
				const expensesRes = await fetch("/api/expenses");
				const expensesData = await expensesRes.json();
				setExpenses(expensesData.expenses || []);
			} catch (error) {
				console.error("API test error:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) return <div className="p-4">Loading API test...</div>;

	return (
		<div className="p-4 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">API Test Page</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h2 className="text-xl font-semibold mb-4">Categories ({categories.length})</h2>
					<div className="space-y-2">
						{categories.map((cat: Category) => (
							<div key={cat.id} className="flex items-center gap-2 p-2 border rounded" style={{ borderColor: cat.color }}>
								<span>{cat.icon}</span>
								<span>{cat.name}</span>
								{cat.is_default && <span className="text-xs bg-gray-200 px-1 rounded">default</span>}
							</div>
						))}
					</div>
				</div>

				<div>
					<h2 className="text-xl font-semibold mb-4">Expenses ({expenses.length})</h2>
					<div className="space-y-2">
						{expenses.map((expense: Expense) => (
							<div key={expense.id} className="p-2 border rounded">
								<div className="flex justify-between items-start">
									<div>
										<p className="font-medium">${expense.amount}</p>
										<p className="text-sm text-gray-600">{expense.description}</p>
										<p className="text-xs text-gray-500">{expense.date}</p>
									</div>
									<div className="flex items-center gap-1 text-sm">
										<span>{expense.category.icon}</span>
										<span>{expense.category.name}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
