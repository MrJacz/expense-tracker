"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutConfirmation } from "@/components/auth/logout-confirmation";
import { User, Settings, BarChart3, Home, Menu, X, LogOut, Moon, Sun, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface NavbarProps {
	variant?: "landing" | "dashboard";
}

const navigation = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: Home,
		description: "Overview and recent activity"
	},
	{
		name: "Analytics",
		href: "/dashboard/analytics",
		icon: BarChart3,
		description: "Spending insights and trends"
	}
];

const landingNavigation = [
	{ name: "Features", href: "#features" },
	{ name: "How it Works", href: "#how-it-works" },
	{ name: "Contact", href: "/contact" }
];

function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-9 px-0">
			<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}

function LandingNavbar({ isMobileMenuOpen, setIsMobileMenuOpen }: { isMobileMenuOpen: boolean; setIsMobileMenuOpen: (open: boolean) => void }) {
	const { data: session } = useSession();
	const isAuthenticated = !!session;

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
				{/* Logo */}
				<Link href="/" className="flex items-center space-x-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<span className="text-lg font-bold text-primary-foreground">💰</span>
					</div>
					<span className="hidden font-bold sm:inline-block">ExpenseTracker</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
					{isAuthenticated ? (
						<>
							<Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
								Dashboard
							</Link>
							<Link href="/dashboard/analytics" className="transition-colors hover:text-foreground/80 text-foreground/60">
								Analytics
							</Link>
						</>
					) : (
						<>
							{landingNavigation.map((item) => (
								<Link key={item.name} href={item.href} className="transition-colors hover:text-foreground/80 text-foreground/60">
									{item.name}
								</Link>
							))}
						</>
					)}
				</nav>

				{/* Auth Buttons / User Menu */}
				<div className="flex items-center space-x-2">
					<ThemeToggle />
					{isAuthenticated ? (
						<>
							<Button asChild variant="ghost" size="sm" className="hidden sm:flex">
								<Link href="/dashboard">Dashboard</Link>
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="relative h-9 w-9 rounded-full">
										<Avatar className="h-9 w-9">
											<AvatarFallback className="bg-muted">{session?.user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">{session?.user?.name}</p>
											<p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link href="/dashboard" className="flex items-center">
											<Home className="mr-2 h-4 w-4" />
											<span>Dashboard</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href="/dashboard/analytics" className="flex items-center">
											<BarChart3 className="mr-2 h-4 w-4" />
											<span>Analytics</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href="/dashboard/settings" className="flex items-center">
											<Settings className="mr-2 h-4 w-4" />
											<span>Settings</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<LogoutConfirmation>
										<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
											<LogOut className="mr-2 h-4 w-4" />
											<span>Log out</span>
										</DropdownMenuItem>
									</LogoutConfirmation>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					) : (
						<>
							<Button asChild variant="ghost" size="sm" className="hidden sm:flex">
								<Link href="/auth/login">Sign In</Link>
							</Button>
							<Button asChild size="sm">
								<Link href="/auth/register">Get Started</Link>
							</Button>
						</>
					)}

					{/* Mobile menu button */}
					<Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
						{isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
					</Button>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div className="border-t bg-background md:hidden">
					<nav className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-1 py-4">
						{isAuthenticated ? (
							<>
								<Link
									href="/dashboard"
									className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Dashboard
								</Link>
								<Link
									href="/dashboard/analytics"
									className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Analytics
								</Link>
								<Link
									href="/dashboard/settings"
									className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Settings
								</Link>
							</>
						) : (
							<>
								{landingNavigation.map((item) => (
									<Link
										key={item.name}
										href={item.href}
										className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										{item.name}
									</Link>
								))}
								<div className="border-t pt-4">
									<Link href="/auth/login" className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
										Sign In
									</Link>
								</div>
							</>
						)}
					</nav>
				</div>
			)}
		</header>
	);
}

function DashboardNavbar({ setIsMobileMenuOpen }: { setIsMobileMenuOpen: (open: boolean) => void }) {
	const { data: session } = useSession();
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
				{/* Mobile menu button */}
				<Button variant="ghost" size="sm" className="mr-4 lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
					<Menu className="h-5 w-5" />
				</Button>

				{/* Logo */}
				<div className="mr-6 flex items-center space-x-2">
					<Link href="/" className="flex items-center space-x-2">
						<span className="text-2xl">💰</span>
						<span className="hidden sm:block font-bold text-xl">ExpenseTracker</span>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden lg:flex items-center space-x-1 mr-6">
					{navigation.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;

						return (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									"flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
									isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
								)}
							>
								<Icon className="h-4 w-4" />
								<span className="hidden xl:block">{item.name}</span>
							</Link>
						);
					})}
				</nav>

				{/* Spacer to push right side actions to the right */}
				<div className="flex-1"></div>

				{/* Right side actions */}
				<div className="flex items-center space-x-2">
					<ThemeToggle />

					{/* User Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-9 w-9 rounded-full">
								<Avatar className="h-9 w-9">
									<AvatarFallback className="bg-muted">{session?.user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-64" align="end" forceMount>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">{session?.user?.name}</p>
									<p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />

							<DropdownMenuItem asChild>
								<Link href="/dashboard" className="flex items-center">
									<Home className="mr-2 h-4 w-4" />
									<span>Dashboard</span>
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link href="/dashboard/analytics" className="flex items-center">
									<BarChart3 className="mr-2 h-4 w-4" />
									<span>Analytics</span>
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link href="/debt-payoff" className="flex items-center">
									<Calculator className="mr-2 h-4 w-4" />
									<span>Debt Payoff</span>
								</Link>
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem>
								<User className="mr-2 h-4 w-4" />
								<span>Profile</span>
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link href="/dashboard/settings" className="flex items-center">
									<Settings className="mr-2 h-4 w-4" />
									<span>Settings</span>
								</Link>
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<LogoutConfirmation>
								<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Log out</span>
								</DropdownMenuItem>
							</LogoutConfirmation>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}

function MobileMenu({ isOpen, onClose, variant = "dashboard" }: { isOpen: boolean; onClose: () => void; variant?: "landing" | "dashboard" }) {
	const pathname = usePathname();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 lg:hidden">
			{/* Backdrop */}
			<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

			{/* Sidebar */}
			<div className="fixed left-0 top-0 h-full w-72 bg-card border-r shadow-lg">
				<div className="flex h-16 items-center justify-between px-6 border-b">
					<Link href="/" className="flex items-center space-x-2">
						<span className="text-2xl">💰</span>
						<span className="font-bold text-xl">ExpenseTracker</span>
					</Link>
					<Button variant="ghost" size="sm" onClick={onClose}>
						<X className="h-5 w-5" />
					</Button>
				</div>

				<nav className="p-4 space-y-2">
					{variant === "dashboard"
						? navigation.map((item) => {
								const Icon = item.icon;
								const isActive = pathname === item.href;

								return (
									<Link
										key={item.name}
										href={item.href}
										onClick={onClose}
										className={cn(
											"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
											isActive
												? "bg-primary text-primary-foreground shadow-sm"
												: "text-muted-foreground hover:text-foreground hover:bg-muted"
										)}
									>
										<Icon className="h-4 w-4" />
										<div>
											<div>{item.name}</div>
											<div className="text-xs opacity-70">{item.description}</div>
										</div>
									</Link>
								);
							})
						: landingNavigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									onClick={onClose}
									className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
								>
									{item.name}
								</Link>
							))}
				</nav>
			</div>
		</div>
	);
}

export function Navbar({ variant = "dashboard" }: NavbarProps) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<>
			{variant === "landing" ? (
				<LandingNavbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
			) : (
				<DashboardNavbar setIsMobileMenuOpen={setIsMobileMenuOpen} />
			)}

			<MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} variant={variant} />
		</>
	);
}
