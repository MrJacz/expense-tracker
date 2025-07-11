"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Expense } from "@/types/expense";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface ExpenseListProps {
	expenses: Expense[];
	onEditAction: (expense: Expense) => void;
	onDeleteAction: (expenseId: string) => Promise<void>;
	loading?: boolean;
}

export function ExpenseList({ expenses, onEditAction, onDeleteAction, loading }: ExpenseListProps) {
	const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!deleteExpenseId) return;

		setDeleting(true);
		try {
			await onDeleteAction(deleteExpenseId);
			setDeleteExpenseId(null);
		} catch (error) {
			console.error("Delete error:", error);
		} finally {
			setDeleting(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD"
		}).format(amount);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (expenses.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">No expenses found. Add your first expense to get started!</p>
			</div>
		);
	}

	return (
		<>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Category</TableHead>
							<TableHead className="text-right">Amount</TableHead>
							<TableHead className="w-[70px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{expenses.map((expense) => (
							<TableRow key={expense.id}>
								<TableCell>
									<div className="font-medium">{format(new Date(expense.date), "MMM dd, yyyy")}</div>
									<div className="text-sm text-gray-500">{expense.time.slice(0, 5)}</div>
								</TableCell>

								<TableCell>
									<div className="font-medium">{expense.description}</div>
									{expense.notes && <div className="text-sm text-gray-500 mt-1">{expense.notes}</div>}
								</TableCell>

								<TableCell>
									<Badge
										variant="outline"
										className="flex items-center gap-1 w-fit"
										style={{ borderColor: expense.category.color }}
									>
										<span>{expense.category.icon}</span>
										<span>{expense.category.name}</span>
									</Badge>
								</TableCell>

								<TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>

								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => onEditAction(expense)}>
												<Edit className="mr-2 h-4 w-4" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setDeleteExpenseId(expense.id)} className="text-red-600">
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteExpenseId} onOpenChange={() => setDeleteExpenseId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>This action cannot be undone. This will permanently delete the expense.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete} disabled={deleting}>
							{deleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
