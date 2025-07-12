"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw, Mail } from "lucide-react";

// Prevent static generation to avoid pre-render issues with client components
// ...existing code...

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Application error:", error);
	}, [error]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full space-y-8">
				{/* Error Icon */}
				<div className="text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="h-8 w-8 text-red-600" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900">Something went wrong</h1>
					<p className="text-gray-600 mt-2">We encountered an unexpected error. Don&apos;t worry, your data is safe.</p>
				</div>

				{/* Error Details */}
				<Card className="border-0 shadow-lg">
					<CardHeader>
						<CardTitle className="text-lg">What happened?</CardTitle>
						<CardDescription>{error.message || "An unexpected error occurred"}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{error.digest && (
							<div className="bg-gray-50 p-3 rounded-lg">
								<div className="text-sm text-gray-600">
									<span className="font-medium">Error ID:</span> {error.digest}
								</div>
								<div className="text-xs text-gray-500 mt-1">Reference this ID when contacting support</div>
							</div>
						)}

						<div className="space-y-3 text-sm text-gray-600">
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span>Your expense data is secure</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<span>No data was lost in this error</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
								<span>Our team has been notified</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="space-y-4">
					<Button onClick={reset} size="lg" className="w-full">
						<RefreshCw className="mr-2 h-4 w-4" />
						Try Again
					</Button>

					<div className="grid grid-cols-2 gap-4">
						<Button asChild variant="outline" size="lg">
							<Link href="/" className="flex items-center justify-center gap-2">
								<Home className="h-4 w-4" />
								Go Home
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="/contact" className="flex items-center justify-center gap-2">
								<Mail className="h-4 w-4" />
								Contact Us
							</Link>
						</Button>
					</div>
				</div>

				{/* Help Text */}
				<div className="text-center text-sm text-gray-500">
					<p>
						If this error persists, please{" "}
						<Link href="/contact" className="text-blue-600 hover:text-blue-500 font-medium">
							contact our support team
						</Link>{" "}
						with the error ID above.
					</p>
				</div>
			</div>
		</div>
	);
}
