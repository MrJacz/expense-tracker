"use client";

import { cn } from "@/lib/utils";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function PageContainer({ children, className, maxWidth = "2xl" }: PageContainerProps) {
	const maxWidthClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
		"2xl": "max-w-7xl",
		full: "max-w-none"
	};

	return <div className={cn("mx-auto px-4 py-6 sm:px-6 lg:px-8", maxWidthClasses[maxWidth], className)}>{children}</div>;
}
