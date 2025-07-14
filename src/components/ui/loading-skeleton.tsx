"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
	return <div className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-800", className)} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
	return (
		<div className="space-y-3">
			{Array.from({ length: rows }).map((_, i) => (
				<div key={i} className="flex items-center space-x-4">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 flex-1" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-16" />
				</div>
			))}
		</div>
	);
}

export function CardSkeleton() {
	return (
		<div className="rounded-lg border p-6 space-y-3">
			<Skeleton className="h-4 w-1/4" />
			<Skeleton className="h-8 w-1/2" />
			<Skeleton className="h-3 w-3/4" />
		</div>
	);
}
