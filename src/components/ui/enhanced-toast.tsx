import * as React from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EnhancedToastProps {
	variant?: "success" | "error" | "warning" | "info";
	title: string;
	description?: string;
	onClose?: () => void;
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

const icons = {
	success: CheckCircle,
	error: XCircle,
	warning: AlertCircle,
	info: Info
};

const variantStyles = {
	success: "border-green-200 bg-green-50 text-green-800",
	error: "border-red-200 bg-red-50 text-red-800",
	warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
	info: "border-blue-200 bg-blue-50 text-blue-800"
};

export function EnhancedToast({ variant = "info", title, description, onClose, action, className }: EnhancedToastProps) {
	const Icon = icons[variant];

	return (
		<div
			className={cn(
				"group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all",
				variantStyles[variant],
				className
			)}
		>
			<div className="flex items-start space-x-3">
				<Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
				<div className="space-y-1">
					<div className="text-sm font-medium">{title}</div>
					{description && <div className="text-sm opacity-90">{description}</div>}
				</div>
			</div>

			<div className="flex items-center space-x-2">
				{action && (
					<Button variant="outline" size="sm" onClick={action.onClick} className="h-8 text-xs">
						{action.label}
					</Button>
				)}

				{onClose && (
					<Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 opacity-70 hover:opacity-100">
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
