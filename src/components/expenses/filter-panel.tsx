"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, CalendarIcon, X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ExpenseFilters, getQuickDateFilters, countActiveFilters, getDefaultFilters } from "@/types/filters";
import { Category } from "@/types/expense";

interface FilterPanelProps {
	filters: ExpenseFilters;
	onFiltersChangeAction: (filters: ExpenseFilters) => void;
	categories: Category[];
	className?: string;
}

export function FilterPanel({ filters, onFiltersChangeAction, categories, className }: FilterPanelProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [startDate, setStartDate] = useState<Date | undefined>(filters.startDate ? new Date(filters.startDate) : undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(filters.endDate ? new Date(filters.endDate) : undefined);
	const [searchInput, setSearchInput] = useState(filters.search || "");

	const quickDateFilters = getQuickDateFilters();
	const activeFiltersCount = countActiveFilters(filters);

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			const searchValue = searchInput.trim();
			if (searchValue !== (filters.search || "")) {
				onFiltersChangeAction({ ...filters, search: searchValue || undefined });
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [searchInput, filters, onFiltersChangeAction]);

	const handleCategoryToggle = (categoryId: number, checked: boolean) => {
		const newCategories = checked ? [...filters.categories, categoryId] : filters.categories.filter((id) => id !== categoryId);

		onFiltersChangeAction({ ...filters, categories: newCategories });
	};

	const handleQuickDateFilter = (quickFilter: string) => {
		const filter = quickDateFilters.find((f) => f.value === quickFilter);
		if (filter) {
			setStartDate(new Date(filter.startDate));
			setEndDate(new Date(filter.endDate));
			onFiltersChangeAction({
				...filters,
				startDate: filter.startDate,
				endDate: filter.endDate
			});
		}
	};

	const handleDateChange = (type: "start" | "end", date: Date | undefined) => {
		if (type === "start") {
			setStartDate(date);
			onFiltersChangeAction({
				...filters,
				startDate: date ? format(date, "yyyy-MM-dd") : undefined
			});
		} else {
			setEndDate(date);
			onFiltersChangeAction({
				...filters,
				endDate: date ? format(date, "yyyy-MM-dd") : undefined
			});
		}
	};

	const handleAmountChange = (type: "min" | "max", value: string) => {
		const amount = value ? parseFloat(value) : undefined;
		if (type === "min") {
			onFiltersChangeAction({ ...filters, minAmount: amount });
		} else {
			onFiltersChangeAction({ ...filters, maxAmount: amount });
		}
	};

	const clearAllFilters = () => {
		const defaultFilters = getDefaultFilters();
		setStartDate(undefined);
		setEndDate(undefined);
		setSearchInput("");
		onFiltersChangeAction(defaultFilters);
	};

	const clearDateFilter = () => {
		setStartDate(undefined);
		setEndDate(undefined);
		onFiltersChangeAction({
			...filters,
			startDate: undefined,
			endDate: undefined
		});
	};

	return (
		<div className={cn("space-y-4", className)}>
			{/* Search Bar - Always Visible */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
				<Input placeholder="Search expenses..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-10" />
			</div>

			{/* Quick Actions & Filter Toggle */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{/* Quick Date Filters */}
					{quickDateFilters.slice(0, 3).map((filter) => (
						<Button
							key={filter.value}
							variant="outline"
							size="sm"
							onClick={() => handleQuickDateFilter(filter.value)}
							className={cn(
								"text-xs",
								filters.startDate === filter.startDate && filters.endDate === filter.endDate && "bg-primary text-primary-foreground"
							)}
						>
							{filter.label}
						</Button>
					))}
				</div>

				<div className="flex items-center gap-2">
					{activeFiltersCount > 0 && (
						<Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs text-red-600 hover:text-red-700">
							Clear All ({activeFiltersCount})
						</Button>
					)}

					<Collapsible open={isOpen} onOpenChange={setIsOpen}>
						<CollapsibleTrigger asChild>
							<Button variant="outline" size="sm" className="gap-2">
								<SlidersHorizontal className="h-4 w-4" />
								Filters
								{activeFiltersCount > 0 && (
									<Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
										{activeFiltersCount}
									</Badge>
								)}
								{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
							</Button>
						</CollapsibleTrigger>

						<CollapsibleContent className="space-y-4 mt-4 p-4 border rounded-lg bg-gray-50">
							{/* Categories Filter */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label className="text-sm font-medium">Categories</Label>
									{filters.categories.length > 0 && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onFiltersChangeAction({ ...filters, categories: [] })}
											className="h-auto p-0 text-xs text-red-600"
										>
											Clear
										</Button>
									)}
								</div>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
									{categories.map((category) => (
										<div key={category.id} className="flex items-center space-x-2">
											<Checkbox
												id={`category-${category.id}`}
												checked={filters.categories.includes(Number(category.id))}
												onCheckedChange={(checked) => handleCategoryToggle(Number(category.id), checked === true)}
											/>
											<Label htmlFor={`category-${category.id}`} className="text-sm flex items-center gap-1 cursor-pointer">
												<span>{category.icon}</span>
												<span>{category.name}</span>
											</Label>
										</div>
									))}
								</div>
							</div>

							{/* Date Range Filter */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label className="text-sm font-medium">Date Range</Label>
									{(filters.startDate || filters.endDate) && (
										<Button variant="ghost" size="sm" onClick={clearDateFilter} className="h-auto p-0 text-xs text-red-600">
											Clear
										</Button>
									)}
								</div>

								{/* Quick Date Options */}
								<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
									{quickDateFilters.map((filter) => (
										<Button
											key={filter.value}
											variant="outline"
											size="sm"
											onClick={() => handleQuickDateFilter(filter.value)}
											className={cn(
												"text-xs",
												filters.startDate === filter.startDate &&
													filters.endDate === filter.endDate &&
													"bg-primary text-primary-foreground"
											)}
										>
											{filter.label}
										</Button>
									))}
								</div>

								{/* Custom Date Range */}
								<div className="grid grid-cols-2 gap-2">
									<div>
										<Label className="text-xs text-gray-600">From</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													className={cn(
														"w-full justify-start text-left font-normal",
														!startDate && "text-muted-foreground"
													)}
												>
													<CalendarIcon className="mr-2 h-3 w-3" />
													{startDate ? format(startDate, "MMM dd") : "Start date"}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={startDate}
													onSelect={(date) => handleDateChange("start", date)}
													autoFocus
												/>
											</PopoverContent>
										</Popover>
									</div>

									<div>
										<Label className="text-xs text-gray-600">To</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
												>
													<CalendarIcon className="mr-2 h-3 w-3" />
													{endDate ? format(endDate, "MMM dd") : "End date"}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={endDate}
													onSelect={(date) => handleDateChange("end", date)}
													autoFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
								</div>
							</div>

							{/* Amount Range Filter */}
							<div className="space-y-3">
								<Label className="text-sm font-medium">Amount Range</Label>
								<div className="grid grid-cols-2 gap-2">
									<div>
										<Label className="text-xs text-gray-600">Min ($)</Label>
										<Input
											type="number"
											placeholder="0.00"
											step="0.01"
											value={filters.minAmount || ""}
											onChange={(e) => handleAmountChange("min", e.target.value)}
											className="text-sm"
										/>
									</div>
									<div>
										<Label className="text-xs text-gray-600">Max ($)</Label>
										<Input
											type="number"
											placeholder="No limit"
											step="0.01"
											value={filters.maxAmount || ""}
											onChange={(e) => handleAmountChange("max", e.target.value)}
											className="text-sm"
										/>
									</div>
								</div>
							</div>

							{/* Sort Options */}
							<div className="space-y-3">
								<Label className="text-sm font-medium">Sort By</Label>
								<div className="grid grid-cols-2 gap-2">
									<Select
										value={filters.sortBy}
										onValueChange={(value: ExpenseFilters["sortBy"]) => onFiltersChangeAction({ ...filters, sortBy: value })}
									>
										<SelectTrigger className="text-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="date">Date</SelectItem>
											<SelectItem value="amount">Amount</SelectItem>
											<SelectItem value="description">Description</SelectItem>
											<SelectItem value="category">Category</SelectItem>
										</SelectContent>
									</Select>

									<Select
										value={filters.sortOrder}
										onValueChange={(value: ExpenseFilters["sortOrder"]) =>
											onFiltersChangeAction({ ...filters, sortOrder: value })
										}
									>
										<SelectTrigger className="text-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="desc">Newest First</SelectItem>
											<SelectItem value="asc">Oldest First</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CollapsibleContent>
					</Collapsible>
				</div>
			</div>

			{/* Active Filters Display */}
			{activeFiltersCount > 0 && (
				<div className="flex flex-wrap gap-2">
					{filters.categories.length > 0 && (
						<Badge variant="secondary" className="gap-1">
							Categories: {filters.categories.length}
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onFiltersChangeAction({ ...filters, categories: [] })}
								className="h-auto p-0 ml-1"
							>
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					)}

					{(filters.startDate || filters.endDate) && (
						<Badge variant="secondary" className="gap-1">
							{filters.startDate && filters.endDate
								? `${format(new Date(filters.startDate), "MMM dd")} - ${format(new Date(filters.endDate), "MMM dd")}`
								: filters.startDate
									? `From ${format(new Date(filters.startDate), "MMM dd")}`
									: `Until ${format(new Date(filters.endDate!), "MMM dd")}`}
							<Button variant="ghost" size="sm" onClick={clearDateFilter} className="h-auto p-0 ml-1">
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					)}

					{filters.search && (
						<Badge variant="secondary" className="gap-1">
							Search: &quot;{filters.search}&quot;
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setSearchInput("");
									onFiltersChangeAction({ ...filters, search: undefined });
								}}
								className="h-auto p-0 ml-1"
							>
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					)}

					{(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
						<Badge variant="secondary" className="gap-1">
							Amount: {filters.minAmount !== undefined ? `$${filters.minAmount}` : "$0"} -{" "}
							{filters.maxAmount !== undefined ? `$${filters.maxAmount}` : "∞"}
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									onFiltersChangeAction({
										...filters,
										minAmount: undefined,
										maxAmount: undefined
									})
								}
								className="h-auto p-0 ml-1"
							>
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					)}
				</div>
			)}
		</div>
	);
}
