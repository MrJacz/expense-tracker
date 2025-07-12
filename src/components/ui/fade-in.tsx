"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
	children: React.ReactNode;
	className?: string;
	delay?: number;
	direction?: "up" | "down" | "left" | "right" | "none";
	distance?: number;
}

export function FadeIn({ children, className, delay = 0, direction = "up", distance = 20 }: FadeInProps) {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setTimeout(() => setIsVisible(true), delay);
					observer.unobserve(entry.target);
				}
			},
			{ threshold: 0.1 }
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => observer.disconnect();
	}, [delay]);

	const getTransform = () => {
		if (isVisible) return "translate3d(0, 0, 0)";

		switch (direction) {
			case "up":
				return `translate3d(0, ${distance}px, 0)`;
			case "down":
				return `translate3d(0, -${distance}px, 0)`;
			case "left":
				return `translate3d(${distance}px, 0, 0)`;
			case "right":
				return `translate3d(-${distance}px, 0, 0)`;
			default:
				return "translate3d(0, 0, 0)";
		}
	};

	return (
		<div
			ref={ref}
			className={cn("transition-all duration-700 ease-out", className)}
			style={{
				opacity: isVisible ? 1 : 0,
				transform: getTransform()
			}}
		>
			{children}
		</div>
	);
}
