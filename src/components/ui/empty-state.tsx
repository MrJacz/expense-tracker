"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
	return (
		<div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
			<div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
				<Icon className="h-8 w-8 text-slate-400" />
			</div>
			<h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
			<p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">{description}</p>
			{action && <Button onClick={action.onClick}>{action.label}</Button>}
		</div>
	);
}
