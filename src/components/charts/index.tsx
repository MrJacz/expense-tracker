"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Area, AreaChart } from "recharts";

interface CategoryData {
	id: number;
	name: string;
	color: string;
	icon: string;
	value: number;
	count: number;
	percentage: number;
}

interface TrendData {
	date: string;
	amount: number;
	count: number;
	formattedDate: string;
}

interface DayPatternData {
	dayName: string;
	amount: number;
	count: number;
	average: number;
}

// Category Breakdown Pie Chart
export function CategoryPieChart({ data }: { data: CategoryData[] }) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0
		}).format(value);
	};

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white p-3 border rounded-lg shadow-lg">
					<div className="flex items-center gap-2 mb-2">
						<span>{data.icon}</span>
						<span className="font-medium">{data.name}</span>
					</div>
					<div className="space-y-1 text-sm">
						<div>Amount: {formatCurrency(data.value)}</div>
						<div>Transactions: {data.count}</div>
						<div>Percentage: {data.percentage.toFixed(1)}%</div>
					</div>
				</div>
			);
		}
		return null;
	};

	const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
		if (percent < 0.05) return null; // Don't show labels for slices < 5%

		const RADIAN = Math.PI / 180;
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		return (
			<text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12} fontWeight="bold">
				{`${(percent * 100).toFixed(0)}%`}
			</text>
		);
	};

	if (!data || data.length === 0) {
		return <div className="flex items-center justify-center h-64 text-gray-500">No category data available</div>;
	}

	return (
		<ResponsiveContainer width="100%" height={300}>
			<PieChart>
				<Pie data={data} cx="50%" cy="50%" labelLine={false} label={CustomLabel} outerRadius={80} fill="#8884d8" dataKey="value">
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.color} />
					))}
				</Pie>
				<Tooltip content={<CustomTooltip />} />
			</PieChart>
		</ResponsiveContainer>
	);
}

// Spending Trend Line Chart
export function SpendingTrendChart({ data, dataKey = "amount", title = "Spending Trend" }: { data: TrendData[]; dataKey?: string; title?: string }) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0
		}).format(value);
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white p-3 border rounded-lg shadow-lg">
					<div className="font-medium mb-2">{data.formattedDate}</div>
					<div className="space-y-1 text-sm">
						<div>Amount: {formatCurrency(data.amount)}</div>
						<div>Transactions: {data.count}</div>
					</div>
				</div>
			);
		}
		return null;
	};

	if (!data || data.length === 0) {
		return <div className="flex items-center justify-center h-64 text-gray-500">No trend data available</div>;
	}

	return (
		<ResponsiveContainer width="100%" height={300}>
			<AreaChart data={data}>
				<defs>
					<linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
						<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
				<XAxis dataKey="formattedDate" fontSize={12} axisLine={false} tickLine={false} />
				<YAxis tickFormatter={formatCurrency} fontSize={12} axisLine={false} tickLine={false} />
				<Tooltip content={<CustomTooltip />} />
				<Area type="monotone" dataKey={dataKey} stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
			</AreaChart>
		</ResponsiveContainer>
	);
}

// Monthly Comparison Bar Chart
export function MonthlyComparisonChart({ data }: { data: any[] }) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0
		}).format(value);
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white p-3 border rounded-lg shadow-lg">
					<div className="font-medium mb-2">{data.formattedMonth}</div>
					<div className="space-y-1 text-sm">
						<div>Amount: {formatCurrency(data.amount)}</div>
						<div>Transactions: {data.count}</div>
						<div>Average: {formatCurrency(data.average)}</div>
					</div>
				</div>
			);
		}
		return null;
	};

	if (!data || data.length === 0) {
		return <div className="flex items-center justify-center h-64 text-gray-500">No monthly data available</div>;
	}

	return (
		<ResponsiveContainer width="100%" height={300}>
			<BarChart data={data}>
				<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
				<XAxis dataKey="formattedMonth" fontSize={12} axisLine={false} tickLine={false} />
				<YAxis tickFormatter={formatCurrency} fontSize={12} axisLine={false} tickLine={false} />
				<Tooltip content={<CustomTooltip />} />
				<Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}

// Day of Week Patterns
export function DayPatternsChart({ data }: { data: DayPatternData[] }) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0
		}).format(value);
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white p-3 border rounded-lg shadow-lg">
					<div className="font-medium mb-2">{data.dayName}</div>
					<div className="space-y-1 text-sm">
						<div>Total: {formatCurrency(data.amount)}</div>
						<div>Transactions: {data.count}</div>
						<div>Average: {formatCurrency(data.average)}</div>
					</div>
				</div>
			);
		}
		return null;
	};

	if (!data || data.length === 0) {
		return <div className="flex items-center justify-center h-64 text-gray-500">No day pattern data available</div>;
	}

	return (
		<ResponsiveContainer width="100%" height={250}>
			<BarChart data={data} layout="horizontal">
				<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
				<XAxis type="number" tickFormatter={formatCurrency} fontSize={12} axisLine={false} tickLine={false} />
				<YAxis type="category" dataKey="dayName" fontSize={12} axisLine={false} tickLine={false} width={80} />
				<Tooltip content={<CustomTooltip />} />
				<Bar dataKey="amount" fill="#10b981" radius={[0, 4, 4, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}

// Top Spending Days
export function TopSpendingDaysChart({ data }: { data: any[] }) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0
		}).format(value);
	};

	if (!data || data.length === 0) {
		return <div className="flex items-center justify-center h-64 text-gray-500">No top spending days data available</div>;
	}

	return (
		<div className="space-y-3">
			{data.slice(0, 5).map((day, index) => (
				<div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
					<div className="flex items-center gap-3">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
								index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-blue-500"
							}`}
						>
							{index + 1}
						</div>
						<div>
							<div className="font-medium">{day.formattedDate}</div>
							<div className="text-sm text-gray-600">
								{day.count} transaction{day.count !== 1 ? "s" : ""}
								{day.categories && ` • ${day.categories.slice(0, 2).join(", ")}`}
								{day.categories && day.categories.length > 2 && ` +${day.categories.length - 2} more`}
							</div>
						</div>
					</div>
					<div className="text-right">
						<div className="font-bold text-lg">{formatCurrency(day.amount)}</div>
					</div>
				</div>
			))}
		</div>
	);
}

// Category Legend Component
export function CategoryLegend({ data }: { data: CategoryData[] }) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0
		}).format(value);
	};

	if (!data || data.length === 0) return null;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
			{data.map((category) => (
				<div key={category.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
						<span className="text-sm">{category.icon}</span>
						<span className="text-sm font-medium">{category.name}</span>
					</div>
					<div className="text-right text-sm">
						<div className="font-medium">{formatCurrency(category.value)}</div>
						<div className="text-gray-500">{category.percentage.toFixed(1)}%</div>
					</div>
				</div>
			))}
		</div>
	);
}
