export const getQuickAnalyticsFilters = () => {
	const now = new Date();
	const today = now.toISOString().split("T")[0];

	// This month
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
	const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

	// Last month
	const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
	const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];

	// Last 30 days
	const thirtyDaysAgo = new Date(now);
	thirtyDaysAgo.setDate(now.getDate() - 30);
	const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

	// Last 90 days
	const ninetyDaysAgo = new Date(now);
	ninetyDaysAgo.setDate(now.getDate() - 90);
	const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];

	// This year
	const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];

	return [
		{ label: "Last 30 Days", startDate: thirtyDaysAgoStr, endDate: today },
		{ label: "This Month", startDate: monthStart, endDate: monthEnd },
		{ label: "Last Month", startDate: lastMonthStart, endDate: lastMonthEnd },
		{ label: "Last 90 Days", startDate: ninetyDaysAgoStr, endDate: today },
		{ label: "This Year", startDate: yearStart, endDate: today },
		{ label: "All Time", startDate: undefined, endDate: undefined }
	];
};

export const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
};

export const formatPercentage = (value: number) => {
	return `${value.toFixed(1)}%`;
};

export const calculateGrowth = (current: number, previous: number) => {
	if (previous === 0) return current > 0 ? 100 : 0;
	return ((current - previous) / previous) * 100;
};
