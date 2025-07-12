"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { LogOut, Loader2 } from "lucide-react";

interface LogoutConfirmationProps {
	children: React.ReactNode;
}

export function LogoutConfirmation({ children }: LogoutConfirmationProps) {
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await signOut({
				callbackUrl: "/auth/logout-success",
				redirect: true
			});
		} catch (error) {
			console.error("Logout error:", error);
			setIsLoggingOut(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<LogOut className="h-5 w-5" />
						Sign out of ExpenseTracker?
					</AlertDialogTitle>
					<AlertDialogDescription>
						You&apos;ll need to sign in again to access your expense data and analytics. Your data will be safely stored and available
						when you return.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleLogout} disabled={isLoggingOut} className="bg-red-600 hover:bg-red-700">
						{isLoggingOut ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing out...
							</>
						) : (
							<>
								<LogOut className="mr-2 h-4 w-4" />
								Sign out
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
