"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
	show?: boolean;
	onComplete?: () => void;
	className?: string;
}

export function SuccessAnimation({ show = false, onComplete, className }: SuccessAnimationProps) {
	const [animate, setAnimate] = useState(false);

	useEffect(() => {
		if (show) {
			setAnimate(true);
			const timer = setTimeout(() => {
				onComplete?.();
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [show, onComplete]);

	if (!show) return null;

	return (
		<div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm", className)}>
			<div
				className={cn(
					"bg-white rounded-full p-8 shadow-2xl transition-all duration-500",
					animate ? "scale-100 opacity-100" : "scale-50 opacity-0"
				)}
			>
				<CheckCircle className={cn("h-16 w-16 text-green-600 transition-all duration-700", animate && "animate-bounce")} />
			</div>
		</div>
	);
}
