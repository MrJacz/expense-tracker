"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon?: LucideIcon;
	trend?: {
		value: number;
		isPositive: boolean;
		label: string;
	};
	className?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
	return (
		<Card className={cn("relative overflow-hidden", className)}>
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
						<p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
						{description && <p className="text-xs text-slate-500 dark:text-slate-500">{description}</p>}
					</div>
					{Icon && (
						<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
							<Icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
						</div>
					)}
				</div>

				{trend && (
					<div className="mt-4 flex items-center gap-2">
						<div className={cn("flex items-center gap-1 text-xs font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}>
							<span>{trend.isPositive ? "↗" : "↘"}</span>
							<span>{Math.abs(trend.value)}%</span>
						</div>
						<span className="text-xs text-slate-500">{trend.label}</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
