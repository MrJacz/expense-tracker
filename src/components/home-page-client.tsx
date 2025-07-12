"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	BarChart3,
	PieChart,
	TrendingUp,
	Shield,
	Smartphone,
	ArrowRight,
	CheckCircle,
	DollarSign,
	Target,
	Calendar,
	Star,
	Users,
	Globe
} from "lucide-react";

export default function HomePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "loading") return;

		setIsLoading(false);
	}, [session, status, router]);

	if (status === "loading" || isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	const features = [
		{
			icon: BarChart3,
			title: "Smart Analytics",
			description: "Visualize your spending patterns with beautiful charts and insights"
		},
		{
			icon: Target,
			title: "Budget Tracking",
			description: "Set budgets and get alerts when you're approaching your limits"
		},
		{
			icon: PieChart,
			title: "Category Breakdown",
			description: "See exactly where your money goes with detailed category analysis"
		},
		{
			icon: Calendar,
			title: "Time-based Insights",
			description: "Track daily, weekly, and monthly spending trends over time"
		},
		{
			icon: Smartphone,
			title: "Mobile Friendly",
			description: "Add expenses on the go with our responsive mobile interface"
		},
		{
			icon: Shield,
			title: "Secure & Private",
			description: "Your financial data is encrypted and stored securely"
		}
	];

	const benefits = [
		"Track expenses in real-time",
		"Beautiful data visualizations",
		"Smart spending insights",
		"Budget management tools",
		"Mobile-optimized experience",
		"Secure cloud storage"
	];

	const stats = [
		{ number: "10,000+", label: "Expenses Tracked", icon: DollarSign },
		{ number: "500+", label: "Happy Users", icon: Users },
		{ number: "50+", label: "Countries", icon: Globe },
		{ number: "4.9/5", label: "User Rating", icon: Star }
	];

	return (
		<div className="min-h-screen bg-background">
			{/* Navigation */}
			<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center space-x-2">
						<span className="text-2xl">💰</span>
						<span className="font-bold text-xl">ExpenseTracker</span>
					</div>
					<div className="flex items-center space-x-4">
						<Button asChild variant="ghost">
							<Link href="/auth/login">Sign In</Link>
						</Button>
						<Button asChild>
							<Link href="/auth/register">Get Started</Link>
						</Button>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="py-20 lg:py-32">
				<div className="container">
					<div className="text-center space-y-8">
						<Badge variant="secondary" className="text-sm">
							🎉 Track, Analyze, and Optimize Your Spending
						</Badge>

						<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
							Take Control of Your
							<span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								{" "}
								Finances
							</span>
						</h1>

						<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
							Simple, powerful expense tracking with beautiful analytics. See where your money goes, set budgets, and make smarter
							financial decisions.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Button asChild size="lg" className="text-lg px-8">
								<Link href="/auth/register">
									Start Tracking Free
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="text-lg px-8">
								<Link href="/auth/login">
									<span>Sign In</span>
								</Link>
							</Button>
						</div>

						<p className="text-sm text-muted-foreground">No credit card required • Free forever • 2 minute setup</p>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className="py-20 bg-muted/30">
				<div className="container">
					<div className="text-center space-y-4 mb-16">
						<h2 className="text-3xl md:text-4xl font-bold">Everything you need to manage expenses</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Powerful features designed to make expense tracking effortless and insightful
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
									<CardHeader>
										<div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
											<Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
										</div>
										<CardTitle className="text-xl">{feature.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-20">
				<div className="container">
					<div className="grid gap-12 lg:grid-cols-2 items-center">
						<div className="space-y-8">
							<div className="space-y-4">
								<h2 className="text-3xl md:text-4xl font-bold">Why choose ExpenseTracker?</h2>
								<p className="text-xl text-muted-foreground">
									Built by developers who understand the pain of manual expense tracking. We&apos;ve created the tool we always
									wanted to use.
								</p>
							</div>

							<div className="space-y-4">
								{benefits.map((benefit, index) => (
									<div key={index} className="flex items-center space-x-3">
										<CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
										<span className="text-lg">{benefit}</span>
									</div>
								))}
							</div>

							<Button asChild size="lg" className="w-full sm:w-auto">
								<Link href="/auth/register">
									Get Started Now
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
						</div>

						<div className="relative">
							<div className="grid gap-4">
								<Card className="p-6">
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold">Monthly Spending</h3>
										<TrendingUp className="h-5 w-5 text-green-600" />
									</div>
									<div className="text-3xl font-bold text-green-600">$2,847</div>
									<div className="text-sm text-muted-foreground">↗ 12% vs last month</div>
								</Card>

								<div className="grid grid-cols-2 gap-4">
									<Card className="p-4">
										<div className="flex items-center space-x-2">
											<div className="w-3 h-3 rounded-full bg-blue-500"></div>
											<span className="text-sm">Food</span>
										</div>
										<div className="text-lg font-bold">$847</div>
									</Card>
									<Card className="p-4">
										<div className="flex items-center space-x-2">
											<div className="w-3 h-3 rounded-full bg-green-500"></div>
											<span className="text-sm">Transport</span>
										</div>
										<div className="text-lg font-bold">$234</div>
									</Card>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-20 bg-muted/30">
				<div className="container">
					<div className="text-center space-y-4 mb-16">
						<h2 className="text-3xl md:text-4xl font-bold">Trusted by users worldwide</h2>
						<p className="text-xl text-muted-foreground">Join thousands of people taking control of their finances</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{stats.map((stat, index) => {
							const Icon = stat.icon;
							return (
								<div key={index} className="text-center space-y-2">
									<Icon className="h-8 w-8 mx-auto text-blue-600" />
									<div className="text-3xl md:text-4xl font-bold">{stat.number}</div>
									<div className="text-muted-foreground">{stat.label}</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20">
				<div className="container">
					<Card className="p-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
						<div className="space-y-6">
							<h2 className="text-3xl md:text-4xl font-bold">Ready to take control of your spending?</h2>
							<p className="text-xl opacity-90 max-w-2xl mx-auto">
								Join thousands of users who have transformed their financial habits. Start tracking your expenses today.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button asChild size="lg" variant="secondary" className="text-lg px-8">
									<Link href="/auth/register">
										Start Free Today
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
								>
									<Link href="/auth/login">Sign In</Link>
								</Button>
							</div>
						</div>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-12 border-t bg-muted/30">
				<div className="container">
					<div className="grid gap-8 md:grid-cols-4">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								<span className="text-2xl">💰</span>
								<span className="font-bold text-xl">ExpenseTracker</span>
							</div>
							<p className="text-sm text-muted-foreground">Take control of your finances with beautiful, intuitive expense tracking.</p>
						</div>

						<div>
							<h3 className="font-semibold mb-4">Product</h3>
							<div className="space-y-2 text-sm">
								<div>Features</div>
								<div>Analytics</div>
								<div>Security</div>
								<div>Mobile App</div>
							</div>
						</div>

						<div>
							<h3 className="font-semibold mb-4">Company</h3>
							<div className="space-y-2 text-sm">
								<div>About</div>
								<div>Blog</div>
								<div>Careers</div>
								<div>Contact</div>
							</div>
						</div>

						<div>
							<h3 className="font-semibold mb-4">Support</h3>
							<div className="space-y-2 text-sm">
								<div>Help Center</div>
								<div>Privacy Policy</div>
								<div>Terms of Service</div>
								<div>Status</div>
							</div>
						</div>
					</div>

					<div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">© 2025 ExpenseTracker. All rights reserved.</div>
				</div>
			</footer>
		</div>
	);
}
