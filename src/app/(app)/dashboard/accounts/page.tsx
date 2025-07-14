"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  CreditCard,
  PiggyBank,
  Wallet,
  TrendingUp,
  Building,
  Car,
  Home,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { AccountType, AssetType, FinancialAccount, DebtDetails } from "@prisma/client";
import { AccountDialog } from "@/components/accounts/account-dialog";
import { DeleteAccountDialog } from "@/components/accounts/delete-account-dialog";

// Enhanced account type with relationships
type AccountWithDetails = FinancialAccount & {
  debtDetails?: DebtDetails | null;
  holdings?: any[];
  transactions?: any[];
};

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [accounts, setAccounts] = useState<AccountWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountWithDetails | null>(null);
  const [netWorth, setNetWorth] = useState<{ assets: number; liabilities: number; netWorth: number } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
      return;
    }

    loadAccounts();
    loadNetWorth();
  }, [session, status, router]);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/accounts");
      if (!response.ok) {
        throw new Error("Failed to load accounts");
      }
      
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error("Error loading accounts:", error);
      setError(error instanceof Error ? error.message : "Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const loadNetWorth = async () => {
    try {
      const response = await fetch("/api/accounts/net-worth");
      if (!response.ok) {
        throw new Error("Failed to load net worth");
      }
      
      const data = await response.json();
      setNetWorth(data);
    } catch (error) {
      console.error("Error loading net worth:", error);
    }
  };

  const handleCreateAccount = async (accountData: any) => {
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        throw new Error("Failed to create account");
      }

      await loadAccounts();
      await loadNetWorth();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating account:", error);
      setError(error instanceof Error ? error.message : "Failed to create account");
    }
  };

  const handleEditAccount = async (accountData: any) => {
    if (!selectedAccount) return;

    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        throw new Error("Failed to update account");
      }

      await loadAccounts();
      await loadNetWorth();
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error("Error updating account:", error);
      setError(error instanceof Error ? error.message : "Failed to update account");
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      await loadAccounts();
      await loadNetWorth();
      setIsDeleteDialogOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error("Error deleting account:", error);
      setError(error instanceof Error ? error.message : "Failed to delete account");
    }
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.checking:
      case AccountType.savings:
        return <Wallet className="h-4 w-4" />;
      case AccountType.credit_card:
        return <CreditCard className="h-4 w-4" />;
      case AccountType.cash:
        return <DollarSign className="h-4 w-4" />;
      case AccountType.investment:
      case AccountType.superannuation:
        return <TrendingUp className="h-4 w-4" />;
      case AccountType.loan:
        return <Building className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.property:
        return <Home className="h-4 w-4" />;
      case AssetType.vehicle:
        return <Car className="h-4 w-4" />;
      case AssetType.investment:
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <PiggyBank className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatAccountType = (type: AccountType) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatAssetType = (type: AssetType) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (status === "loading" || !session) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading accounts...</p>
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
                  <BreadcrumbPage>Accounts</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
              <p className="text-muted-foreground">Manage your financial accounts and assets</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { loadAccounts(); loadNetWorth(); }} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Net Worth Summary */}
          {netWorth && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assets</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(netWorth.assets)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Liabilities</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(netWorth.liabilities)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netWorth.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netWorth.netWorth)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Accounts List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Accounts</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading accounts...</p>
              </div>
            ) : accounts.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first account to start tracking your finances
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <Card key={account.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {account.isAsset && account.assetType ? 
                            getAssetIcon(account.assetType) : 
                            getAccountIcon(account.type)
                          }
                          <CardTitle className="text-lg">{account.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAccount(account);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAccount(account);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Balance</span>
                          <span className={`font-semibold ${
                            account.isAsset || account.balance.toNumber() >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(account.balance.toNumber())}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Type</span>
                          <Badge variant="outline">
                            {account.isAsset && account.assetType ? 
                              formatAssetType(account.assetType) : 
                              formatAccountType(account.type)
                            }
                          </Badge>
                        </div>
                        {account.apiSource && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Source</span>
                            <Badge variant="secondary">{account.apiSource}</Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Dialogs */}
      <AccountDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateAccount}
        title="Add New Account"
      />
      
      <AccountDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditAccount}
        title="Edit Account"
        account={selectedAccount}
      />
      
      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteAccount}
        account={selectedAccount}
      />
    </SidebarProvider>
  );
}