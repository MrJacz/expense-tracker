import { Button } from "@/components/ui/button";
import { Github, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t py-12">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid gap-8 lg:grid-cols-4">
					<div className="lg:col-span-1">
						<Link href="/" className="flex items-center space-x-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
								<span className="text-lg font-bold text-primary-foreground">💰</span>
							</div>
							<span className="font-bold">ExpenseTracker</span>
						</Link>
						<p className="mt-4 text-sm text-muted-foreground">
							Take control of your finances with beautiful, intuitive expense tracking.
						</p>
					</div>

					<div>
						<h3 className="font-semibold">Product</h3>
						<ul className="mt-4 space-y-2 text-sm text-muted-foreground">
							<li>
								<Link href="#features" className="hover:text-foreground">
									Features
								</Link>
							</li>
							<li>
								<Link href="/dashboard/analytics" className="hover:text-foreground">
									Analytics
								</Link>
							</li>
							<li>
								<Link href="/auth/register" className="hover:text-foreground">
									Get Started
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="font-semibold">Support</h3>
						<ul className="mt-4 space-y-2 text-sm text-muted-foreground">
							<li>
								<Link href="/contact" className="hover:text-foreground">
									Contact
								</Link>
							</li>
							<li>
								<Link href="/privacy" className="hover:text-foreground">
									Privacy
								</Link>
							</li>
							<li>
								<Link href="/terms" className="hover:text-foreground">
									Terms
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="font-semibold">Connect</h3>
						<div className="mt-4 flex space-x-4">
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<Twitter className="h-4 w-4" />
							</Button>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<Github className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				<div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
					© 2025 ExpenseTracker. All rights reserved.
				</div>
			</div>
		</footer>
	);
}
