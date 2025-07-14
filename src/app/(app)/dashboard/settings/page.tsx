"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
	Settings, 
	CreditCard, 
	Bell, 
	Palette, 
	Trash2,
	CheckCircle,
	AlertCircle,
	Clock,
	RefreshCw,
	RotateCcw
} from "lucide-react";
import { UserSettings, UserBankIntegration } from "@/types/settings";

interface SettingsPageState {
	userSettings: UserSettings | null;
	bankIntegrations: UserBankIntegration[];
	isLoading: boolean;
	error: string | null;
	successMessage: string | null;
}

export default function SettingsPage() {
	const [state, setState] = useState<SettingsPageState>({
		userSettings: null,
		bankIntegrations: [],
		isLoading: true,
		error: null,
		successMessage: null
	});
	
	const [upBankToken, setUpBankToken] = useState("");
	const [isConnecting, setIsConnecting] = useState(false);

	// Load user settings and bank integrations
	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			setState(prev => ({ ...prev, isLoading: true, error: null }));
			
			const [settingsRes, banksRes] = await Promise.all([
				fetch("/api/settings"),
				fetch("/api/settings/banks")
			]);

			if (!settingsRes.ok || !banksRes.ok) {
				throw new Error("Failed to load settings");
			}

			const settingsData = await settingsRes.json();
			const banksData = await banksRes.json();

			setState(prev => ({
				...prev,
				userSettings: settingsData.settings,
				bankIntegrations: banksData.integrations || [],
				isLoading: false
			}));
		} catch (error) {
			setState(prev => ({
				...prev,
				error: error instanceof Error ? error.message : "Failed to load settings",
				isLoading: false
			}));
		}
	};

	const updateUserSetting = async (key: keyof UserSettings, value: unknown) => {
		try {
			const response = await fetch("/api/settings", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [key]: value })
			});

			if (!response.ok) {
				throw new Error("Failed to update setting");
			}

			const data = await response.json();
			setState(prev => ({
				...prev,
				userSettings: data.settings,
				successMessage: "Setting updated successfully"
			}));

			// Clear success message after 3 seconds
			setTimeout(() => {
				setState(prev => ({ ...prev, successMessage: null }));
			}, 3000);
		} catch (error) {
			setState(prev => ({
				...prev,
				error: error instanceof Error ? error.message : "Failed to update setting"
			}));
		}
	};

	const connectUpBank = async () => {
		if (!upBankToken.trim()) {
			setState(prev => ({ ...prev, error: "Please enter your UP Bank Personal Access Token" }));
			return;
		}

		setIsConnecting(true);
		try {
			const response = await fetch("/api/settings/banks", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					bank_provider: "up_bank",
					bank_name: "UP Bank",
					access_token: upBankToken,
					auto_import: true,
					import_frequency: "daily"
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to connect UP Bank");
			}

			setState(prev => ({
				...prev,
				successMessage: "UP Bank connected successfully!"
			}));
			setUpBankToken("");
			await loadSettings(); // Reload to show new integration
		} catch (error) {
			setState(prev => ({
				...prev,
				error: error instanceof Error ? error.message : "Failed to connect UP Bank"
			}));
		} finally {
			setIsConnecting(false);
		}
	};

	const disconnectBank = async (integrationId: number) => {
		try {
			const response = await fetch(`/api/settings/banks/${integrationId}`, {
				method: "DELETE"
			});

			if (!response.ok) {
				throw new Error("Failed to disconnect bank");
			}

			setState(prev => ({
				...prev,
				successMessage: "Bank disconnected successfully"
			}));
			await loadSettings();
		} catch (error) {
			setState(prev => ({
				...prev,
				error: error instanceof Error ? error.message : "Failed to disconnect bank"
			}));
		}
	};

	const syncBankTransactions = async (integrationId: number) => {
		try {
			setState(prev => ({
				...prev,
				successMessage: "Starting transaction sync..."
			}));

			const response = await fetch(`/api/settings/banks/${integrationId}/sync`, {
				method: "POST"
			});

			if (!response.ok) {
				throw new Error("Failed to sync transactions");
			}

			const result = await response.json();
			const { importedCount, skippedCount, totalFetched } = result.result || {};

			setState(prev => ({
				...prev,
				successMessage: `Sync completed! ${importedCount || 0} new expenses imported, ${skippedCount || 0} skipped, ${totalFetched || 0} total transactions processed.`
			}));
			await loadSettings();
		} catch (error) {
			setState(prev => ({
				...prev,
				error: error instanceof Error ? error.message : "Failed to sync transactions"
			}));
		}
	};

	const reprocessTransactions = async (integrationId: number) => {
		try {
			setState(prev => ({
				...prev,
				successMessage: "Reprocessing pending transactions..."
			}));

			const response = await fetch(`/api/settings/banks/${integrationId}/reprocess`, {
				method: "POST"
			});

			if (!response.ok) {
				throw new Error("Failed to reprocess transactions");
			}

			const result = await response.json();
			const { processedCount, errorCount, totalTransactions } = result.result || {};

			setState(prev => ({
				...prev,
				successMessage: `Reprocessing completed! ${processedCount || 0} transactions converted to expenses, ${errorCount || 0} errors, ${totalTransactions || 0} total processed.`
			}));
			await loadSettings();
		} catch (error) {
			setState(prev => ({
				...prev,
				error: error instanceof Error ? error.message : "Failed to reprocess transactions"
			}));
		}
	};

	const fullSyncTransactions = async (integrationId: number) => {
		try {
			setState(prev => ({
				...prev,
				successMessage: "Starting full sync (all historical transactions)..."
			}));

			const response = await fetch(`/api/settings/banks/${integrationId}/full-sync`, {
				method: "POST"
			});

			if (!response.ok) {
				throw new Error("Failed to perform full sync");
			}

			const result = await response.json();
			const { importedCount, skippedCount, totalFetched } = result.result || {};

			setState(prev => ({
				...prev,
				successMessage: `Full sync completed! ${importedCount || 0} new expenses imported, ${skippedCount || 0} skipped (already imported or credits), ${totalFetched || 0} total transactions processed.`
			}));
			await loadSettings();
		} catch (error) {
			setState(prev => ({
				...prev,
				error: error instanceof Error ? error.message : "Failed to perform full sync"
			}));
		}
	};

	const getBankStatusIcon = (integration: UserBankIntegration) => {
		if (!integration.is_active) {
			return <AlertCircle className="h-4 w-4 text-gray-400" />;
		}
		if (integration.last_sync_status === "success") {
			return <CheckCircle className="h-4 w-4 text-green-500" />;
		}
		if (integration.last_sync_status === "error") {
			return <AlertCircle className="h-4 w-4 text-red-500" />;
		}
		return <Clock className="h-4 w-4 text-yellow-500" />;
	};

	if (state.isLoading) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
				<div className="flex items-center justify-center py-12">
					<div className="text-center space-y-4">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
						<p className="text-sm text-muted-foreground">Loading settings...</p>
					</div>
				</div>
				</SidebarInset>
			</SidebarProvider>
		);
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage>Settings</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
						<p className="text-muted-foreground">Manage your account preferences and integrations</p>
					</div>
				</div>

				{/* Success/Error Messages */}
				{state.successMessage && (
					<Alert className="border-green-200 bg-green-50 text-green-800">
						<CheckCircle className="h-4 w-4" />
						<AlertDescription>{state.successMessage}</AlertDescription>
					</Alert>
				)}

				{state.error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{state.error}</AlertDescription>
					</Alert>
				)}

				{/* General Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							General Preferences
						</CardTitle>
						<CardDescription>Configure your basic application settings</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="currency">Currency</Label>
								<Select
									value={state.userSettings?.currency || "AUD"}
									onValueChange={(value) => updateUserSetting("currency", value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
										<SelectItem value="USD">USD - US Dollar</SelectItem>
										<SelectItem value="EUR">EUR - Euro</SelectItem>
										<SelectItem value="GBP">GBP - British Pound</SelectItem>
										<SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="timezone">Timezone</Label>
								<Select
									value={state.userSettings?.timezone || "Australia/Sydney"}
									onValueChange={(value) => updateUserSetting("timezone", value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Australia/Sydney">Sydney</SelectItem>
										<SelectItem value="Australia/Melbourne">Melbourne</SelectItem>
										<SelectItem value="Australia/Brisbane">Brisbane</SelectItem>
										<SelectItem value="Australia/Perth">Perth</SelectItem>
										<SelectItem value="Australia/Adelaide">Adelaide</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Appearance Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Palette className="h-5 w-5" />
							Appearance
						</CardTitle>
						<CardDescription>Customize the look and feel of the application</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Label htmlFor="theme">Theme</Label>
							<Select
								value={state.userSettings?.theme || "system"}
								onValueChange={(value) => updateUserSetting("theme", value as "light" | "dark" | "system")}
							>
								<SelectTrigger className="w-48">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="light">Light</SelectItem>
									<SelectItem value="dark">Dark</SelectItem>
									<SelectItem value="system">System</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Notification Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="h-5 w-5" />
							Notifications
						</CardTitle>
						<CardDescription>Choose what notifications you want to receive</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="email-notifications">Email Notifications</Label>
								<p className="text-sm text-muted-foreground">Receive important updates via email</p>
							</div>
							<Switch
								id="email-notifications"
								checked={state.userSettings?.email_notifications || false}
								onCheckedChange={(checked) => updateUserSetting("email_notifications", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="weekly-reports">Weekly Reports</Label>
								<p className="text-sm text-muted-foreground">Get weekly spending summaries</p>
							</div>
							<Switch
								id="weekly-reports"
								checked={state.userSettings?.weekly_reports || false}
								onCheckedChange={(checked) => updateUserSetting("weekly_reports", checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="budget-alerts">Budget Alerts</Label>
								<p className="text-sm text-muted-foreground">Get notified when approaching budget limits</p>
							</div>
							<Switch
								id="budget-alerts"
								checked={state.userSettings?.budget_alerts || false}
								onCheckedChange={(checked) => updateUserSetting("budget_alerts", checked)}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Bank Integrations */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5" />
							Bank Integrations
						</CardTitle>
						<CardDescription>Connect your bank accounts to automatically import transactions</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Connected Banks */}
						{state.bankIntegrations.length > 0 && (
							<div className="space-y-4">
								<h4 className="font-medium">Connected Banks</h4>
								{state.bankIntegrations.map((integration) => (
									<div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center gap-3">
											{getBankStatusIcon(integration)}
											<div>
												<p className="font-medium">{integration.bank_name}</p>
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<span>Last sync: {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleDateString() : "Never"}</span>
													<Badge variant={integration.is_active ? "default" : "secondary"}>
														{integration.is_active ? "Active" : "Inactive"}
													</Badge>
												</div>
												{integration.last_error_message && (
													<p className="text-sm text-red-600">{integration.last_error_message}</p>
												)}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => syncBankTransactions(integration.id)}
												disabled={!integration.is_active}
												title="Sync new transactions since last sync"
											>
												<RefreshCw className="h-4 w-4 mr-1" />
												Sync
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => fullSyncTransactions(integration.id)}
												disabled={!integration.is_active}
												title="Fetch ALL historical transactions from UP Bank"
											>
												<Clock className="h-4 w-4 mr-1" />
												Full Sync
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => reprocessTransactions(integration.id)}
												disabled={!integration.is_active}
												title="Convert pending imported transactions to expenses"
											>
												<RotateCcw className="h-4 w-4 mr-1" />
												Reprocess
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => disconnectBank(integration.id)}
											>
												<Trash2 className="h-4 w-4 mr-1" />
												Disconnect
											</Button>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Connect UP Bank */}
						<div className="space-y-4">
							<h4 className="font-medium">Connect UP Bank</h4>
							<div className="space-y-4 p-4 border rounded-lg bg-muted/50">
								<div className="space-y-2">
									<Label htmlFor="up-token">Personal Access Token</Label>
									<Input
										id="up-token"
										type="password"
										placeholder="up:yeah:..."
										value={upBankToken}
										onChange={(e) => setUpBankToken(e.target.value)}
									/>
									<p className="text-sm text-muted-foreground">
										Get your Personal Access Token from the UP Bank app: Settings → API
									</p>
								</div>
								<Button onClick={connectUpBank} disabled={isConnecting || !upBankToken.trim()}>
									{isConnecting ? (
										<>
											<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
											Connecting...
										</>
									) : (
										"Connect UP Bank"
									)}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}