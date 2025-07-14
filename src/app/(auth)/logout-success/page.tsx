import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, BarChart3, Shield } from "lucide-react";

export default function LogoutSuccessPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full space-y-8">
				{/* Success Icon */}
				<div className="text-center">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900">Successfully signed out</h1>
					<p className="text-gray-600 mt-2">You&apos;ve been safely logged out of your ExpenseTracker account.</p>
				</div>

				{/* Security Message */}
				<Card className="border-0 shadow-lg">
					<CardHeader className="text-center pb-4">
						<CardTitle className="text-lg flex items-center justify-center gap-2">
							<Shield className="h-5 w-5 text-blue-600" />
							Your data is secure
						</CardTitle>
						<CardDescription>
							All your expense data and analytics are safely stored and will be available when you sign back in.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3 text-sm text-gray-600">
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span>Session ended securely</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<span>Data encrypted and protected</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
								<span>Ready for your return</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="space-y-4">
					<Button asChild size="lg" className="w-full">
						<Link href="/auth/login" className="flex items-center justify-center gap-2">
							Sign back in
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>

					<div className="flex gap-4">
						<Button asChild variant="outline" size="lg" className="flex-1">
							<Link href="/" className="flex items-center justify-center gap-2">
								<BarChart3 className="h-4 w-4" />
								Learn More
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="flex-1">
							<Link href="/auth/register" className="flex items-center justify-center gap-2">
								Create Account
							</Link>
						</Button>
					</div>
				</div>

				{/* Footer Message */}
				<div className="text-center text-sm text-gray-500">
					<p>
						Thank you for using ExpenseTracker! <br />
						We&apos;ll be here when you&apos;re ready to continue your financial journey.
					</p>
				</div>
			</div>
		</div>
	);
}
