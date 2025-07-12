// src/hooks/use-expense-filters.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExpenseFilters, ExpenseApiResponse, getDefaultFilters, buildQueryString, parseFiltersFromUrl } from "@/types/filters";

export function useExpenseFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Initialize filters from URL or defaults
	const [filters, setFilters] = useState<ExpenseFilters>(getDefaultFilters());
	const filtersRef = useRef<ExpenseFilters>(filters);

	const [data, setData] = useState<ExpenseApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Keep ref in sync with filters
	useEffect(() => {
		filtersRef.current = filters;
	}, [filters]);

	// Update URL when filters change
	const updateFilters = useCallback(
		(newFilters: ExpenseFilters) => {
			setFilters(newFilters);

			// Update URL with new filters
			const queryString = buildQueryString(newFilters);
			const newUrl = queryString ? `?${queryString}` : "";

			// Use replace to avoid adding to browser history for every filter change
			router.replace(`/dashboard${newUrl}`, { scroll: false });
		},
		[router]
	);

	// Fetch expenses with current filters
	const fetchExpenses = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const queryString = buildQueryString(filtersRef.current);
			const url = `/api/expenses${queryString ? `?${queryString}` : ""}`;

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Failed to fetch expenses: ${response.statusText}`);
			}

			const result: ExpenseApiResponse = await response.json();
			setData(result);
		} catch (err) {
			console.error("Error fetching expenses:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch expenses");
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Fetch when filters change
	useEffect(() => {
		fetchExpenses();
	}, [filters, fetchExpenses]);

	// Parse filters from URL on mount and URL changes
	useEffect(() => {
		const urlFilters = parseFiltersFromUrl(searchParams);
		// Only update if filters actually changed to prevent infinite loops
		setFilters(prevFilters => {
			// Simple comparison of key filter properties
			const prevQuery = buildQueryString(prevFilters);
			const newQuery = buildQueryString(urlFilters);
			
			if (prevQuery !== newQuery) {
				return urlFilters;
			}
			return prevFilters;
		});
	}, [searchParams]);

	// Helper functions
	const clearAllFilters = useCallback(() => {
		updateFilters(getDefaultFilters());
	}, [updateFilters]);

	const refreshData = useCallback(() => {
		fetchExpenses();
	}, [fetchExpenses]);

	return {
		filters,
		updateFilters,
		clearAllFilters,
		data,
		isLoading,
		error,
		refreshData
	};
}
