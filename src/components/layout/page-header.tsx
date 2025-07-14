"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PageHeaderAction {
	label: string;
	onClick: () => void;
	variant?: "default" | "outline" | "secondary";
	icon?: LucideIcon;
	loading?: boolean;
}

interface PageHeaderProps {
	title: string;
	description?: string;
	icon?: LucideIcon;
	actions?: PageHeaderAction[];
	breadcrumbs?: { label: string; href?: string }[];
	className?: string;
}

export function PageHeader({ title, description, icon: Icon, actions = [], breadcrumbs = [], className }: PageHeaderProps) {
	return (
		<div className={cn("space-y-4 pb-6", className)}>
			{/* Breadcrumbs */}
			{breadcrumbs.length > 0 && (
				<nav className="flex text-sm text-muted-foreground">
					{breadcrumbs.map((crumb, index) => (
						<div key={index} className="flex items-center">
							{index > 0 && <span className="mx-2">/</span>}
							{crumb.href ? (
								<a href={crumb.href} className="hover:text-foreground transition-colors">
									{crumb.label}
								</a>
							) : (
								<span>{crumb.label}</span>
							)}
						</div>
					))}
				</nav>
			)}

			{/* Header Content */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						{Icon && (
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
								<Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
							</div>
						)}
						<h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
					</div>
					{description && <p className="text-lg text-slate-600 dark:text-slate-400">{description}</p>}
				</div>

				{/* Actions */}
				{actions.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{actions.map((action, index) => {
							const Icon = action.icon;
							return (
								<Button
									key={index}
									variant={action.variant || "default"}
									onClick={action.onClick}
									disabled={action.loading}
									className="gap-2"
								>
									{action.loading ? (
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									) : (
										Icon && <Icon className="h-4 w-4" />
									)}
									{action.label}
								</Button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
