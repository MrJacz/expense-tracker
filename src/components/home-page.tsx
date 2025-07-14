"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, Shield, Smartphone, ArrowRight, DollarSign, TrendingUp, Zap, Star } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
	return (
		<section className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-8 py-24 md:py-32">
			<div className="mx-auto max-w-4xl text-center">
				{!isAuthenticated && (
					<Badge variant="secondary" className="mb-6">
						🎉 Free forever • No credit card required
					</Badge>
				)}

				<h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
					{isAuthenticated ? (
						<>
							Welcome back to your{" "}
							<span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
								financial hub
							</span>
						</>
					) : (
						<>
							Take control of your{" "}
							<span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
								spending
							</span>
						</>
					)}
				</h1>

				<p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
					{isAuthenticated ? (
						"Access your dashboard to view expenses, analyze spending patterns, and manage your finances."
					) : (
						"Track expenses effortlessly with beautiful analytics. See where your money goes, set smart budgets, and make better financial decisions."
					)}
				</p>

				<div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
					{isAuthenticated ? (
						<>
							<Button asChild size="lg" className="text-base">
								<Link href="/dashboard" className="gap-2">
									Go to Dashboard
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="text-base">
								<Link href="/dashboard/analytics">View Analytics</Link>
							</Button>
						</>
					) : (
						<>
							<Button asChild size="lg" className="text-base">
								<Link href="/auth/register" className="gap-2">
									Start tracking for free
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="text-base">
								<Link href="/auth/login">Sign in</Link>
							</Button>
						</>
					)}
				</div>

				{!isAuthenticated && (
					<p className="mt-6 text-sm text-muted-foreground">Join 1,200+ users • 2-minute setup</p>
				)}
			</div>

			{/* Hero Image/Preview */}
			<div className="mx-auto mt-16 max-w-5xl">
				<div className="rounded-xl border bg-background/50 p-8 shadow-xl backdrop-blur">
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Stats Preview */}
						<Card className="lg:col-span-2">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">This month</p>
										<p className="text-2xl font-bold">$2,847.30</p>
									</div>
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
										<TrendingUp className="h-6 w-6 text-green-600" />
									</div>
								</div>
								<div className="mt-4 flex items-center gap-2 text-sm">
									<span className="flex items-center gap-1 text-green-600">
										<TrendingUp className="h-3 w-3" />
										12%
									</span>
									<span className="text-muted-foreground">vs last month</span>
								</div>
							</CardContent>
						</Card>

						<div className="space-y-4">
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<div className="h-3 w-3 rounded-full bg-blue-500"></div>
										<div className="flex-1">
											<p className="text-sm font-medium">Food & Dining</p>
											<p className="text-xs text-muted-foreground">$847</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<div className="h-3 w-3 rounded-full bg-green-500"></div>
										<div className="flex-1">
											<p className="text-sm font-medium">Transportation</p>
											<p className="text-xs text-muted-foreground">$234</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function FeaturesSection() {
	const features = [
		{
			icon: BarChart3,
			title: "Beautiful Analytics",
			description: "Visualize your spending with charts and insights that actually make sense."
		},
		{
			icon: Zap,
			title: "Lightning Fast",
			description: "Add expenses in seconds. Our interface is designed for speed and simplicity."
		},
		{
			icon: Shield,
			title: "Bank-level Security",
			description: "Your financial data is encrypted and protected with enterprise-grade security."
		},
		{
			icon: Smartphone,
			title: "Works Everywhere",
			description: "Native experience on desktop, tablet, and mobile. Track expenses anywhere."
		},
		{
			icon: PieChart,
			title: "Smart Categories",
			description: "Automatic categorization with custom categories for your unique spending habits."
		},
		{
			icon: DollarSign,
			title: "Budget Tracking",
			description: "Set budgets and get intelligent alerts before you overspend."
		}
	];

	return (
		<section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
			<div className="mx-auto max-w-2xl text-center">
				<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need</h2>
				<p className="mt-4 text-lg text-muted-foreground">Powerful features that make expense tracking effortless and insightful.</p>
			</div>

			<div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
				{features.map((feature, index) => {
					const Icon = feature.icon;
					return (
						<div key={index} className="group relative">
							<Card className="h-full transition-all duration-200 hover:shadow-md">
								<CardContent className="p-6">
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
										<Icon className="h-6 w-6 text-primary" />
									</div>
									<h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
									<p className="text-muted-foreground">{feature.description}</p>
								</CardContent>
							</Card>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function HowItWorksSection() {
	const steps = [
		{
			step: "1",
			title: "Create account",
			description: "Sign up in seconds with just your email. No credit card required."
		},
		{
			step: "2",
			title: "Add expenses",
			description: "Log expenses as you spend. Quick, simple, and works on any device."
		},
		{
			step: "3",
			title: "Get insights",
			description: "See beautiful analytics that help you understand your spending patterns."
		}
	];

	return (
		<section id="how-it-works" className="bg-muted/30 py-24">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Get started in minutes</h2>
					<p className="mt-4 text-lg text-muted-foreground">Three simple steps to take control of your finances.</p>
				</div>

				<div className="mx-auto mt-16 max-w-4xl">
					<div className="grid gap-8 md:grid-cols-3">
						{steps.map((step, index) => (
							<div key={index} className="text-center">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
									{step.step}
								</div>
								<h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
								<p className="text-muted-foreground">{step.description}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function TestimonialSection() {
	return (
		<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
			<div className="mx-auto max-w-4xl text-center">
				<div className="mb-8">
					<div className="mx-auto mb-4 flex justify-center space-x-1">
						{[...Array(5)].map((_, i) => (
							<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
						))}
					</div>
					<blockquote className="text-xl font-medium sm:text-2xl">
						&quot;ExpenseTracker helped me save $800 in my first month by showing exactly where my money was going. The insights are
						incredible.&quot;
					</blockquote>
				</div>
				<div className="flex items-center justify-center gap-4">
					<div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
					<div className="text-left">
						<p className="font-semibold">Sarah Chen</p>
						<p className="text-sm text-muted-foreground">Marketing Manager</p>
					</div>
				</div>
			</div>
		</section>
	);
}

function CTASection({ isAuthenticated }: { isAuthenticated: boolean }) {
	if (isAuthenticated) {
		return (
			<section className="bg-muted/30 py-24">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore your financial tools</h2>
						<p className="mt-4 text-lg text-muted-foreground">Access all your financial management features from your dashboard.</p>
						<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
							<Button asChild size="lg" className="text-base">
								<Link href="/dashboard" className="gap-2">
									Open Dashboard
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="text-base">
								<Link href="/dashboard/settings">Settings</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="bg-muted/30 py-24">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to take control?</h2>
					<p className="mt-4 text-lg text-muted-foreground">Start tracking your expenses today. Free forever, no credit card required.</p>
					<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
						<Button asChild size="lg" className="text-base">
							<Link href="/auth/register" className="gap-2">
								Start free today
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="text-base">
							<Link href="/auth/login">Sign in</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function HomePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "loading") return;
		setIsLoading(false);
	}, [session, status, router]);

	const isAuthenticated = !!session;

	if (status === "loading" || isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
					<p className="mt-4 text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<Navbar variant="landing" />
			<main>
				<HeroSection isAuthenticated={isAuthenticated} />
				{!isAuthenticated && (
					<>
						<FeaturesSection />
						<HowItWorksSection />
						<TestimonialSection />
					</>
				)}
				<CTASection isAuthenticated={isAuthenticated} />
			</main>
			<Footer />
		</div>
	);
}
