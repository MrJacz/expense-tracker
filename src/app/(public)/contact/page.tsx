"use client";

import { useState } from "react";
import Link from "next/link";

// Prevent static generation to avoid pre-render issues with client components
// ...existing code...
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, MessageCircle, Clock, CheckCircle, HelpCircle, Bug, Lightbulb, Shield, Loader2, Send } from "lucide-react";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		category: "",
		message: ""
	});
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (error) setError("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
			setError("Please fill in all required fields");
			return;
		}

		if (!formData.email.includes("@")) {
			setError("Please enter a valid email address");
			return;
		}

		setLoading(true);
		setError("");

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			setSubmitted(true);
		} catch {
			setError("Failed to send message. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (submitted) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
				<Card className="w-full max-w-md border-0 shadow-lg">
					<CardContent className="text-center p-8">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle className="h-8 w-8 text-green-600" />
						</div>
						<h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
						<p className="text-muted-foreground mb-6">Thank you for contacting us. We&apos;ll get back to you within 24 hours.</p>
						<div className="space-y-3">
							<Button asChild className="w-full">
								<Link href="/">Return Home</Link>
							</Button>
							<Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
								Send Another Message
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Header */}
				<div className="mb-8">
					<Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to home
					</Link>

					<div className="text-center space-y-4">
						<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
							<MessageCircle className="h-8 w-8 text-blue-600" />
						</div>
						<h1 className="text-4xl font-bold">Get in Touch</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Have questions about ExpenseTracker? We&apos;re here to help. Send us a message and we&apos;ll respond as soon as
							possible.
						</p>
					</div>
				</div>

				<div className="grid gap-8 lg:grid-cols-3">
					{/* Contact Information */}
					<div className="space-y-6">
						{/* Quick Help */}
						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<HelpCircle className="h-5 w-5" />
									Quick Help
								</CardTitle>
								<CardDescription>Common questions and answers</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<div className="p-3 bg-blue-50 rounded-lg">
										<h4 className="font-medium text-blue-900 text-sm">How do I add an expense?</h4>
										<p className="text-blue-700 text-xs mt-1">Click the &quot;Add Expense&quot; button on your dashboard</p>
									</div>
									<div className="p-3 bg-green-50 rounded-lg">
										<h4 className="font-medium text-green-900 text-sm">Is my data secure?</h4>
										<p className="text-green-700 text-xs mt-1">Yes, all data is encrypted and stored securely</p>
									</div>
									<div className="p-3 bg-purple-50 rounded-lg">
										<h4 className="font-medium text-purple-900 text-sm">Can I export my data?</h4>
										<p className="text-purple-700 text-xs mt-1">Yes, you can export to CSV from your dashboard</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Contact Methods */}
						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle>Contact Methods</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-start space-x-3">
									<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<Mail className="h-4 w-4 text-blue-600" />
									</div>
									<div>
										<h3 className="font-medium">Email Support</h3>
										<p className="text-sm text-muted-foreground">support@expensetracker.com</p>
										<p className="text-xs text-muted-foreground">Response within 24 hours</p>
									</div>
								</div>

								<div className="flex items-start space-x-3">
									<div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<MessageCircle className="h-4 w-4 text-green-600" />
									</div>
									<div>
										<h3 className="font-medium">Live Chat</h3>
										<p className="text-sm text-muted-foreground">Available 9 AM - 5 PM EST</p>
										<Button size="sm" variant="outline" className="mt-2">
											Start Chat
										</Button>
									</div>
								</div>

								<div className="flex items-start space-x-3">
									<div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<Clock className="h-4 w-4 text-orange-600" />
									</div>
									<div>
										<h3 className="font-medium">Response Times</h3>
										<p className="text-sm text-muted-foreground">
											General: 24 hours
											<br />
											Technical: 48 hours
											<br />
											Urgent: 4 hours
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Contact Form */}
					<div className="lg:col-span-2">
						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Send className="h-5 w-5" />
									Send us a message
								</CardTitle>
								<CardDescription>Fill out the form below and we&apos;ll get back to you as soon as possible.</CardDescription>
							</CardHeader>
							<CardContent>
								{error && (
									<Alert variant="destructive" className="mb-6">
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="name">Name *</Label>
											<Input
												id="name"
												placeholder="Your full name"
												value={formData.name}
												onChange={(e) => handleInputChange("name", e.target.value)}
												disabled={loading}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="email">Email *</Label>
											<Input
												id="email"
												type="email"
												placeholder="your@email.com"
												value={formData.email}
												onChange={(e) => handleInputChange("email", e.target.value)}
												disabled={loading}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="category">Category</Label>
										<Select
											value={formData.category}
											onValueChange={(value) => handleInputChange("category", value)}
											disabled={loading}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="general">
													<div className="flex items-center gap-2">
														<HelpCircle className="h-4 w-4" />
														General Question
													</div>
												</SelectItem>
												<SelectItem value="technical">
													<div className="flex items-center gap-2">
														<Bug className="h-4 w-4" />
														Technical Issue
													</div>
												</SelectItem>
												<SelectItem value="feature">
													<div className="flex items-center gap-2">
														<Lightbulb className="h-4 w-4" />
														Feature Request
													</div>
												</SelectItem>
												<SelectItem value="security">
													<div className="flex items-center gap-2">
														<Shield className="h-4 w-4" />
														Security Concern
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="subject">Subject</Label>
										<Input
											id="subject"
											placeholder="Brief description of your message"
											value={formData.subject}
											onChange={(e) => handleInputChange("subject", e.target.value)}
											disabled={loading}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="message">Message *</Label>
										<Textarea
											id="message"
											placeholder="Tell us how we can help you..."
											rows={6}
											value={formData.message}
											onChange={(e) => handleInputChange("message", e.target.value)}
											disabled={loading}
										/>
									</div>

									<div className="bg-blue-50 p-4 rounded-lg">
										<h4 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h4>
										<p className="text-sm text-blue-700">
											For technical issues, include your browser type and any error messages you&apos;re seeing. For feature
											requests, describe your use case to help us understand your needs better.
										</p>
									</div>

									<Button type="submit" className="w-full" size="lg" disabled={loading}>
										{loading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Sending message...
											</>
										) : (
											<>
												<Send className="mr-2 h-4 w-4" />
												Send message
											</>
										)}
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Additional Help */}
				<div className="mt-12 text-center">
					<h2 className="text-2xl font-bold mb-4">Need immediate help?</h2>
					<p className="text-muted-foreground mb-6">Check out our documentation or join our community for instant answers.</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Button variant="outline" asChild>
							<Link href="/docs">Documentation</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/community">Community Forum</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/faq">FAQ</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
