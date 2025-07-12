"use client";

import { useEffect, useState } from "react";

interface AnimatedNumberProps {
	value: number;
	duration?: number;
	prefix?: string;
	suffix?: string;
	className?: string;
	formatterAction?: (value: number) => string;
}

export function AnimatedNumber({
	value,
	duration = 1000,
	prefix = "",
	suffix = "",
	className = "",
	formatterAction = (n: number) => n.toLocaleString()
}: AnimatedNumberProps) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		let startTime: number;
		let animationFrame: number;

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / duration, 1);

			// Easing function (ease-out)
			const easeOut = 1 - Math.pow(1 - progress, 3);

			setDisplayValue(Math.floor(value * easeOut));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);

		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, [value, duration]);

	return (
		<span className={className}>
			{prefix}
			{formatterAction(displayValue)}
			{suffix}
		</span>
	);
}
