"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "./header";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return; // Still loading
		if (!session) router.push("/auth/login");
	}, [session, status, router]);

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<main className="container mx-auto py-6">{children}</main>
		</div>
	);
}
