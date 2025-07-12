"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Globe } from "lucide-react";

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Header */}
				<div className="mb-8">
					<Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to home
					</Link>

					<div className="text-center space-y-4">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
							<Shield className="h-8 w-8 text-green-600" />
						</div>
						<h1 className="text-4xl font-bold">Privacy Policy</h1>
						<p className="text-xl text-muted-foreground">Your data, your control. Last updated: January 2025</p>
					</div>
				</div>

				{/* Privacy Principles */}
				<Card className="mb-8 border-0 shadow-lg">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Eye className="h-5 w-5" />
							Our Privacy Principles
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<Lock className="h-4 w-4 text-green-600" />
									</div>
									<div>
										<h3 className="font-medium">Data Minimization</h3>
										<p className="text-sm text-muted-foreground">We only collect what we need to provide our service</p>
									</div>
								</div>

								<div className="flex items-start space-x-3">
									<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<Database className="h-4 w-4 text-blue-600" />
									</div>
									<div>
										<h3 className="font-medium">Secure Storage</h3>
										<p className="text-sm text-muted-foreground">Your data is encrypted and stored securely</p>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<Users className="h-4 w-4 text-purple-600" />
									</div>
									<div>
										<h3 className="font-medium">No Selling</h3>
										<p className="text-sm text-muted-foreground">We never sell your personal information</p>
									</div>
								</div>

								<div className="flex items-start space-x-3">
									<div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<Globe className="h-4 w-4 text-orange-600" />
									</div>
									<div>
										<h3 className="font-medium">Your Control</h3>
										<p className="text-sm text-muted-foreground">Export or delete your data anytime</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Privacy Sections */}
				<div className="space-y-8">
					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>Information We Collect</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>We collect information you provide directly to us, such as:</p>
							<ul className="list-disc list-inside space-y-1 mt-3">
								<li>
									<strong>Account Information:</strong> Name, email address, password
								</li>
								<li>
									<strong>Expense Data:</strong> Transaction amounts, descriptions, categories, dates
								</li>
								<li>
									<strong>Usage Information:</strong> How you interact with our service (anonymized)
								</li>
								<li>
									<strong>Device Information:</strong> Browser type, IP address, operating system
								</li>
							</ul>
							<p className="mt-4">
								We do <strong>not</strong> collect sensitive financial information like bank account numbers, credit card details, or
								social security numbers.
							</p>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>How We Use Your Information</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>We use the information we collect to:</p>
							<ul className="list-disc list-inside space-y-1 mt-3">
								<li>Provide, maintain, and improve our service</li>
								<li>Create and manage your account</li>
								<li>Generate analytics and insights about your spending</li>
								<li>Send you service-related notifications</li>
								<li>Provide customer support</li>
								<li>Protect against fraud and abuse</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>Data Security</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>We implement industry-standard security measures to protect your data:</p>
							<ul className="list-disc list-inside space-y-1 mt-3">
								<li>All data is encrypted in transit and at rest</li>
								<li>Regular security audits and updates</li>
								<li>Access controls and authentication</li>
								<li>Secure data centers with physical security</li>
								<li>Regular backups and disaster recovery plans</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>Your Rights</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>You have the following rights regarding your personal data:</p>
							<div className="grid gap-4 md:grid-cols-2 mt-4">
								<div className="bg-blue-50 p-4 rounded-lg">
									<h4 className="font-medium text-blue-900">Access & Export</h4>
									<p className="text-sm text-blue-700 mt-1">Download all your data in a portable format</p>
								</div>
								<div className="bg-green-50 p-4 rounded-lg">
									<h4 className="font-medium text-green-900">Correction</h4>
									<p className="text-sm text-green-700 mt-1">Update or correct your personal information</p>
								</div>
								<div className="bg-orange-50 p-4 rounded-lg">
									<h4 className="font-medium text-orange-900">Deletion</h4>
									<p className="text-sm text-orange-700 mt-1">Delete your account and all associated data</p>
								</div>
								<div className="bg-purple-50 p-4 rounded-lg">
									<h4 className="font-medium text-purple-900">Portability</h4>
									<p className="text-sm text-purple-700 mt-1">Transfer your data to another service</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>Contact Us</CardTitle>
						</CardHeader>
						<CardContent className="prose max-w-none">
							<p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
							<div className="bg-gray-50 p-4 rounded-lg mt-3">
								<p className="font-medium">Privacy Team</p>
								<p>Email: privacy@expensetracker.com</p>
								<p>Response time: Within 72 hours</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Footer Actions */}
				<div className="mt-12 text-center space-y-4">
					<div className="flex justify-center gap-4">
						<Button asChild variant="outline">
							<Link href="/terms">View Terms of Service</Link>
						</Button>
						<Button asChild>
							<Link href="/auth/register">Accept & Sign Up</Link>
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">
						Questions about privacy?{" "}
						<Link href="/contact" className="text-green-600 hover:text-green-500">
							Contact our privacy team
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
