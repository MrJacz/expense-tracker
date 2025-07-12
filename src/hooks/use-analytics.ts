// src/hooks/use-analytics.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalyticsData, AnalyticsFilters } from "@/types/analytics";

export function useAnalytics(initialFilters: AnalyticsFilters = {}) {
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters);

	const fetchAnalytics = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams();
			if (filters.startDate) params.set("startDate", filters.startDate);
			if (filters.endDate) params.set("endDate", filters.endDate);
			if (filters.type) params.set("type", filters.type);

			const url = `/api/analytics${params.toString() ? `?${params.toString()}` : ""}`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Failed to fetch analytics: ${response.statusText}`);
			}

			const result = await response.json();
			setData(result.analytics);
		} catch (err) {
			console.error("Error fetching analytics:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch analytics");
		} finally {
			setIsLoading(false);
		}
	}, [filters]);

	const updateFilters = useCallback((newFilters: AnalyticsFilters) => {
		setFilters(newFilters);
	}, []);

	const setDateRange = useCallback((startDate?: string, endDate?: string) => {
		setFilters((prev) => ({ ...prev, startDate, endDate }));
	}, []);

	const clearFilters = useCallback(() => {
		setFilters({});
	}, []);

	useEffect(() => {
		fetchAnalytics();
	}, [fetchAnalytics]);

	return {
		data,
		isLoading,
		error,
		filters,
		updateFilters,
		setDateRange,
		clearFilters,
		refetch: fetchAnalytics
	};
}