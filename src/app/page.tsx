"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return;
		if (session) {
			router.push("/dashboard");
		}
	}, [session, status, router]);

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (session) {
		return null; // Will redirect to dashboard
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
			<div className="text-center space-y-6 max-w-md">
				<h1 className="text-4xl font-bold text-gray-900">💰 Expense Tracker</h1>
				<p className="text-lg text-gray-600">Take control of your finances. Track expenses, set budgets, and achieve your financial goals.</p>
				<div className="space-y-4">
					<Link href="/auth/login">
						<Button className="w-full">Sign In</Button>
					</Link>
					<Link href="/auth/register">
						<Button variant="outline" className="w-full">
							Create Account
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
