"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Category, Expense, CreateExpenseData } from "@/types/expense";

export interface ExpenseFormProps {
	isOpen: boolean;
	onCloseAction: () => void;
	onSubmitAction: (data: CreateExpenseData) => Promise<void>;
	editingExpense: Expense | null;
	categories: Category[];
}

export function ExpenseForm({ isOpen, onCloseAction, onSubmitAction, editingExpense, categories }: ExpenseFormProps) {
	const [formData, setFormData] = useState<CreateExpenseData>({
		amount: 0,
		description: "",
		category_id: 0,
		date: format(new Date(), "yyyy-MM-dd"),
		time: format(new Date(), "HH:mm:ss"),
		notes: ""
	});
	const [date, setDate] = useState<Date>(new Date());
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Reset form when dialog opens/closes or when editing changes
	useEffect(() => {
		if (isOpen) {
			if (editingExpense) {
				setFormData({
					amount: editingExpense.amount,
					description: editingExpense.description,
					category_id: Number(editingExpense.category.id),
					date: editingExpense.date,
					time: editingExpense.time,
					notes: editingExpense.notes || ""
				});
				setDate(new Date(editingExpense.date));
			} else {
				// Reset for new expense
				const now = new Date();
				setFormData({
					amount: 0,
					description: "",
					category_id: 0,
					date: format(now, "yyyy-MM-dd"),
					time: format(now, "HH:mm:ss"),
					notes: ""
				});
				setDate(now);
			}
		}
		setErrors({});
	}, [isOpen, editingExpense]);

	const handleInputChange = (field: keyof CreateExpenseData, value: unknown) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			setDate(selectedDate);
			handleInputChange("date", format(selectedDate, "yyyy-MM-dd"));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.amount || formData.amount <= 0) {
			newErrors.amount = "Amount must be greater than 0";
		}
		if (!formData.description.trim()) {
			newErrors.description = "Description is required";
		}
		if (!formData.category_id) {
			newErrors.category_id = "Category is required";
		}
		if (!formData.date) {
			newErrors.date = "Date is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		try {
			await onSubmitAction(formData);
			onCloseAction();
		} catch (error) {
			console.error("Form submission error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onCloseAction}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
					<DialogDescription>
						{editingExpense ? "Update your expense details below." : "Enter the details for your new expense."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Amount */}
					<div className="space-y-2">
						<Label htmlFor="amount">Amount ($)</Label>
						<Input
							id="amount"
							type="number"
							step="0.01"
							min="0"
							placeholder="0.00"
							value={formData.amount || ""}
							onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
							className={cn(errors.amount && "border-red-500")}
						/>
						{errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Input
							id="description"
							placeholder="What did you spend on?"
							value={formData.description}
							onChange={(e) => handleInputChange("description", e.target.value)}
							className={cn(errors.description && "border-red-500")}
						/>
						{errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
					</div>

					{/* Category */}
					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select
							value={formData.category_id?.toString() || ""}
							onValueChange={(value) => handleInputChange("category_id", parseInt(value))}
						>
							<SelectTrigger className={cn(errors.category_id && "border-red-500")}>
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id.toString()}>
										<div className="flex items-center gap-2">
											<span>{category.icon}</span>
											<span>{category.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
					</div>

					{/* Date */}
					<div className="space-y-2">
						<Label>Date</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-full justify-start text-left font-normal",
										!date && "text-muted-foreground",
										errors.date && "border-red-500"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date ? format(date, "PPP") : <span>Pick a date</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
							</PopoverContent>
						</Popover>
						{errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
					</div>

					{/* Time */}
					<div className="space-y-2">
						<Label htmlFor="time">Time (optional)</Label>
						<Input
							id="time"
							type="time"
							value={formData.time?.slice(0, 5) || ""}
							onChange={(e) => handleInputChange("time", e.target.value + ":00")}
						/>
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<Label htmlFor="notes">Notes (optional)</Label>
						<Textarea
							id="notes"
							placeholder="Additional notes..."
							value={formData.notes || ""}
							onChange={(e) => handleInputChange("notes", e.target.value)}
							rows={3}
						/>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onCloseAction}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : editingExpense ? "Update" : "Add Expense"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
