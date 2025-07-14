"use client";

import { cn } from "@/lib/utils";

interface SectionProps {
	children: React.ReactNode;
	className?: string;
	title?: string;
	description?: string;
	headerAction?: React.ReactNode;
}

export function Section({ children, className, title, description, headerAction }: SectionProps) {
	return (
		<section className={cn("space-y-6", className)}>
			{(title || description || headerAction) && (
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						{title && <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
						{description && <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>}
					</div>
					{headerAction}
				</div>
			)}
			{children}
		</section>
	);
}
