import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"]
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"]
});

export const metadata: Metadata = {
	title: {
		default: "ExpenseTracker - Take Control of Your Finances",
		template: "%s | ExpenseTracker"
	},
	description: "Simple, powerful expense tracking with beautiful analytics. Track expenses, set budgets, and make smarter financial decisions.",
	keywords: ["expense tracker", "budget", "finance", "money management"],
	authors: [{ name: "Jack Nagle" }],
	creator: "Jack Nagle",
	icons: {
		icon: "/favicon.ico"
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://your-domain.com",
		title: "ExpenseTracker - Take Control of Your Finances",
		description: "Simple, powerful expense tracking with beautiful analytics.",
		siteName: "ExpenseTracker"
	},
	twitter: {
		card: "summary_large_image",
		title: "ExpenseTracker - Take Control of Your Finances",
		description: "Simple, powerful expense tracking with beautiful analytics."
	},
	robots: {
		index: true,
		follow: true
	}
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
