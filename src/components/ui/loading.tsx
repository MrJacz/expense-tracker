"use client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8"
	};

	return <Loader2 className={cn("animate-spin text-gray-500", sizeClasses[size], className)} />;
}

interface LoadingPageProps {
	message?: string;
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
			<div className="text-center space-y-4">
				<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
					<LoadingSpinner size="lg" className="text-blue-600" />
				</div>
				<div className="space-y-2">
					<h2 className="text-xl font-semibold text-gray-900">{message}</h2>
					<p className="text-gray-600">Please wait a moment...</p>
				</div>
			</div>
		</div>
	);
}

interface LoadingCardProps {
	message?: string;
	className?: string;
}

export function LoadingCard({ message = "Loading...", className }: LoadingCardProps) {
	return (
		<div className={cn("flex items-center justify-center py-8", className)}>
			<div className="text-center space-y-3">
				<LoadingSpinner size="lg" />
				<p className="text-sm text-gray-500">{message}</p>
			</div>
		</div>
	);
}
