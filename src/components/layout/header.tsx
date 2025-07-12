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
import { User, Settings, BarChart3, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
	const { data: session } = useSession();
	const pathname = usePathname();

	const navigation = [
		{
			name: "Dashboard",
			href: "/dashboard",
			icon: Home,
			current: pathname === "/dashboard"
		},
		{
			name: "Analytics",
			href: "/analytics",
			icon: BarChart3,
			current: pathname === "/analytics"
		}
	];

	return (
		<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center">
				<div className="mr-4 flex">
					<Link className="mr-6 flex items-center space-x-2" href="/dashboard">
						<span className="font-bold text-xl">💰 ExpenseTracker</span>
					</Link>
				</div>

				{/* Navigation */}
				<nav className="flex items-center space-x-6 text-sm font-medium">
					{navigation.map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									"flex items-center gap-2 transition-colors hover:text-foreground/80",
									item.current ? "text-foreground" : "text-foreground/60"
								)}
							>
								<Icon className="h-4 w-4" />
								<span className="hidden sm:block">{item.name}</span>
							</Link>
						);
					})}
				</nav>

				<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
					<div className="w-full flex-1 md:w-auto md:flex-none">{/* Search could go here in the future */}</div>
					<nav className="flex items-center">
						{session && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="relative h-8 w-8 rounded-full">
										<Avatar className="h-8 w-8">
											<AvatarFallback>{session.user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">{session.user?.name}</p>
											<p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
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
										<Link href="/analytics" className="flex items-center">
											<BarChart3 className="mr-2 h-4 w-4" />
											<span>Analytics</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<User className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Settings className="mr-2 h-4 w-4" />
										<span>Settings</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<LogoutConfirmation>
										<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
											<span className="flex items-center w-full cursor-pointer">
												<span className="mr-2">🚪</span>
												<span>Log out</span>
											</span>
										</DropdownMenuItem>
									</LogoutConfirmation>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}
