"use client";

import { useSession, signOut } from "next-auth/react";
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
import { LogOut, User, Settings } from "lucide-react";

export function Header() {
	const { data: session } = useSession();

	const handleSignOut = () => {
		signOut({ callbackUrl: "/auth/login" });
	};

	return (
		<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center">
				<div className="mr-4 flex">
					<a className="mr-6 flex items-center space-x-2" href="/dashboard">
						<span className="font-bold text-xl">💰 ExpenseTracker</span>
					</a>
				</div>

				<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
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
									<DropdownMenuItem>
										<User className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Settings className="mr-2 h-4 w-4" />
										<span>Settings</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleSignOut}>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Log out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}
