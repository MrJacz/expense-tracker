"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full text-center space-y-8">
				{/* 404 Illustration */}
				<div className="relative">
					<div className="text-8xl font-bold text-gray-200 select-none">404</div>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-6xl">🔍</div>
					</div>
				</div>

				{/* Error Message */}
				<div className="space-y-4">
					<h1 className="text-3xl font-bold text-gray-900">Oops! Page not found</h1>
					<p className="text-lg text-gray-600">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
				</div>

				{/* Suggestions Card */}
				<Card className="border-0 shadow-lg">
					<CardContent className="p-6 space-y-4">
						<h2 className="text-lg font-semibold text-gray-900">What can you do?</h2>
						<div className="space-y-3 text-sm text-gray-600">
							<div className="flex items-center gap-3">
								<Search className="h-4 w-4 text-blue-500" />
								<span>Check the URL for typos</span>
							</div>
							<div className="flex items-center gap-3">
								<ArrowLeft className="h-4 w-4 text-green-500" />
								<span>Go back to the previous page</span>
							</div>
							<div className="flex items-center gap-3">
								<Home className="h-4 w-4 text-purple-500" />
								<span>Return to the homepage</span>
							</div>
							<div className="flex items-center gap-3">
								<HelpCircle className="h-4 w-4 text-orange-500" />
								<span>Contact support if the problem persists</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button asChild size="lg" className="flex items-center gap-2">
						<Link href="/">
							<Home className="h-4 w-4" />
							Go Home
						</Link>
					</Button>
					<Button asChild variant="outline" size="lg" onClick={() => window.history.back()}>
						<button className="flex items-center gap-2">
							<ArrowLeft className="h-4 w-4" />
							Go Back
						</button>
					</Button>
				</div>

				{/* Additional Help */}
				<div className="text-sm text-gray-500">
					Still having trouble?{" "}
					<Link href="/contact" className="text-blue-600 hover:text-blue-500 font-medium">
						Contact Support
					</Link>
				</div>
			</div>
		</div>
	);
}
