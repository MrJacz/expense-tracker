"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<html>
			<body>
				<div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
					<div className="max-w-md w-full text-center space-y-8">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
							<AlertTriangle className="h-8 w-8 text-red-600" />
						</div>

						<div className="space-y-4">
							<h1 className="text-3xl font-bold text-gray-900">Critical Error</h1>
							<p className="text-gray-600">A critical error occurred. Please try refreshing the page.</p>
						</div>

						<div className="space-y-4">
							<Button onClick={reset} size="lg" className="w-full">
								<RefreshCw className="mr-2 h-4 w-4" />
								Try Again
							</Button>

							<Button asChild variant="outline" size="lg" className="w-full">
								<Link href="/" className="flex items-center justify-center gap-2">
									<Home className="h-4 w-4" />
									Go Home
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
