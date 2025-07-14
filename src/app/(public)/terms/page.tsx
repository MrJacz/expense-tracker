import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Shield, Users, Scale } from "lucide-react";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Header */}
				<div className="mb-8">
					<Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to home
					</Link>

					<div className="text-center space-y-4">
						<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
							<FileText className="h-8 w-8 text-blue-600" />
						</div>
						<h1 className="text-4xl font-bold">Terms of Service</h1>
						<p className="text-xl text-muted-foreground">Last updated: January 2025</p>
					</div>
				</div>

				{/* Quick Overview */}
				<Card className="mb-8 border-0 shadow-lg">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Scale className="h-5 w-5" />
							Quick Overview
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">By using ExpenseTracker, you agree to these terms. Here&apos;s what you can expect:</p>
						<div className="grid gap-4 md:grid-cols-3">
							<div className="flex items-start space-x-3">
								<div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
									<Shield className="h-4 w-4 text-green-600" />
								</div>
								<div>
									<h3 className="font-medium">Your Privacy</h3>
									<p className="text-sm text-muted-foreground">We protect your financial data</p>
								</div>
							</div>
							<div className="flex items-start space-x-3">
								<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
									<Users className="h-4 w-4 text-blue-600" />
								</div>
								<div>
									<h3 className="font-medium">Fair Use</h3>
									<p className="text-sm text-muted-foreground">Use the service responsibly</p>
								</div>
							</div>
							<div className="flex items-start space-x-3">
								<div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
									<FileText className="h-4 w-4 text-purple-600" />
								</div>
								<div>
									<h3 className="font-medium">Transparency</h3>
									<p className="text-sm text-muted-foreground">Clear terms, no hidden clauses</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Terms Content */}
				<div className="space-y-8">
					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>1. Acceptance of Terms</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>
								By accessing and using ExpenseTracker (&quot;the Service&quot;), you accept and agree to be bound by the terms and
								provision of this agreement. If you do not agree to abide by the above, please do not use this service.
							</p>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>2. Use License</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>
								Permission is granted to temporarily use ExpenseTracker for personal, non-commercial transitory viewing only. This is
								the grant of a license, not a transfer of title, and under this license you may not:
							</p>
							<ul className="list-disc list-inside space-y-1 mt-3">
								<li>modify or copy the materials</li>
								<li>use the materials for any commercial purpose or for any public display</li>
								<li>attempt to reverse engineer any software contained on the website</li>
								<li>remove any copyright or other proprietary notations from the materials</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>3. Privacy and Data Protection</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>
								Your privacy is important to us. We collect and use your information in accordance with our Privacy Policy. By using
								ExpenseTracker, you consent to the collection and use of information as described in our Privacy Policy.
							</p>
							<p className="mt-3">
								We implement appropriate data collection, storage and processing practices and security measures to protect against
								unauthorized access, alteration, disclosure or destruction of your personal information and data stored on our
								service.
							</p>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>4. User Content</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>
								You retain ownership of all content you submit, post or display on or through ExpenseTracker. By submitting content,
								you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify,
								publish, transmit, display and distribute such content for the purpose of providing the service.
							</p>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>5. Service Availability</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>
								We strive to provide a reliable service, but we cannot guarantee that ExpenseTracker will always be available or
								uninterrupted. We may need to suspend the service for maintenance or other reasons. We will try to give you advance
								notice when possible.
							</p>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>6. Limitation of Liability</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>
								In no event shall ExpenseTracker or its suppliers be liable for any damages (including, without limitation, damages
								for loss of data or profit, or due to business interruption) arising out of the use or inability to use
								ExpenseTracker, even if we have been notified orally or in writing of the possibility of such damage.
							</p>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>7. Contact Information</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>If you have any questions about these Terms of Service, please contact us at:</p>
							<div className="bg-gray-50 p-4 rounded-lg mt-3">
								<p className="font-medium">ExpenseTracker Support</p>
								<p>Email: legal@expensetracker.com</p>
								<p>Address: 123 Finance Street, Money City, MC 12345</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Footer Actions */}
				<div className="mt-12 text-center space-y-4">
					<div className="flex justify-center gap-4">
						<Button asChild variant="outline">
							<Link href="/privacy">View Privacy Policy</Link>
						</Button>
						<Button asChild>
							<Link href="/auth/register">Accept & Sign Up</Link>
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">
						Questions about our terms?{" "}
						<Link href="/contact" className="text-blue-600 hover:text-blue-500">
							Contact our support team
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
