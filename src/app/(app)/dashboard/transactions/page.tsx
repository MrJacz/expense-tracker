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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  CalendarIcon,
  DollarSign,
  Receipt,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { TransactionType } from "@prisma/client";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CSVImportDialog } from "@/components/transactions/csv-import-dialog";

// Define transaction interface
interface Transaction {
  id: string;
  description: string;
  date: string;
  type: TransactionType;
  account: {
    id: string;
    name: string;
    type: string;
  };
  splits: {
    id: string;
    amount: number;
    category?: {
      id: string;
      name: string;
    } | null;
    notes?: string;
  }[];
  attachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    accountId: "",
    categoryId: "",
    type: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    search: "",
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  // Sorting
  const [sorting, setSorting] = useState({
    sortBy: "date" as "date" | "description" | "amount",
    sortOrder: "desc" as "asc" | "desc",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
      return;
    }

    loadTransactions();
    loadAccounts();
    loadCategories();
  }, [session, status, router, pagination.page, pagination.limit, sorting, filters]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
      });
      
      if (filters.accountId) params.append("accountId", filters.accountId);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.type) params.append("type", filters.type);
      if (filters.startDate) params.append("startDate", format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate) params.append("endDate", format(filters.endDate, "yyyy-MM-dd"));
      if (filters.search) params.append("search", filters.search);
      
      const response = await fetch(`/api/transactions?${params}`);
      if (!response.ok) {
        throw new Error("Failed to load transactions");
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error loading transactions:", error);
      setError(error instanceof Error ? error.message : "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleSort = (field: "date" | "description" | "amount") => {
    setSorting(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      accountId: "",
      categoryId: "",
      type: "",
      startDate: undefined,
      endDate: undefined,
      search: "",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatTransactionType = (type: TransactionType) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getTransactionTotal = (splits: Transaction['splits']) => {
    return splits.reduce((total, split) => total + split.amount, 0);
  };

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.income:
        return "text-green-600";
      case TransactionType.expense:
        return "text-red-600";
      case TransactionType.transfer:
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getSortIcon = (field: "date" | "description" | "amount") => {
    if (sorting.sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sorting.sortOrder === "asc" ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  if (status === "loading" || !session) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
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
                  <BreadcrumbPage>Transactions</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
              <p className="text-muted-foreground">Manage all your financial transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadTransactions} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <CSVImportDialog accounts={accounts} onImportComplete={loadTransactions}>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
              </CSVImportDialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
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

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Search */}
                <div className="xl:col-span-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search transactions..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Account Filter */}
                <div>
                  <Label htmlFor="account">Account</Label>
                  <Select value={filters.accountId} onValueChange={(value) => handleFilterChange("accountId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All accounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All accounts</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={filters.categoryId} onValueChange={(value) => handleFilterChange("categoryId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      {Object.values(TransactionType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatTransactionType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.startDate}
                          onSelect={(date) => handleFilterChange("startDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.endDate}
                          onSelect={(date) => handleFilterChange("endDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                  <p className="text-muted-foreground mb-4">
                    {Object.values(filters).some(v => v) ? 
                      "No transactions match your current filters." : 
                      "Add your first transaction to get started."
                    }
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 rounded-lg font-medium">
                    <div className="col-span-3 flex items-center gap-2 cursor-pointer" onClick={() => handleSort("date")}>
                      Date
                      {getSortIcon("date")}
                    </div>
                    <div className="col-span-3 flex items-center gap-2 cursor-pointer" onClick={() => handleSort("description")}>
                      Description
                      {getSortIcon("description")}
                    </div>
                    <div className="col-span-2">Account</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-1 flex items-center gap-2 cursor-pointer" onClick={() => handleSort("amount")}>
                      Amount
                      {getSortIcon("amount")}
                    </div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>

                  {/* Transactions */}
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="col-span-3">
                        <div className="text-sm font-medium">
                          {format(new Date(transaction.date), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), "h:mm a")}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getTransactionTypeColor(transaction.type)}>
                            {formatTransactionType(transaction.type)}
                          </Badge>
                          {transaction.attachments && transaction.attachments.length > 0 && (
                            <Badge variant="secondary">
                              {transaction.attachments.length} attachment{transaction.attachments.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm">{transaction.account.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.account.type.replace(/_/g, " ")}
                        </div>
                      </div>
                      <div className="col-span-2">
                        {transaction.splits.length === 1 ? (
                          <div className="text-sm">
                            {transaction.splits[0].category?.name || "Uncategorized"}
                          </div>
                        ) : (
                          <div className="text-sm">
                            <span className="font-medium">{transaction.splits.length} splits</span>
                            <div className="text-xs text-muted-foreground">
                              {transaction.splits.map((split, index) => (
                                <div key={split.id}>
                                  {split.category?.name || "Uncategorized"} ({formatCurrency(split.amount)})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="col-span-1">
                        <div className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.type === TransactionType.expense ? "-" : "+"}
                          {formatCurrency(Math.abs(getTransactionTotal(transaction.splits)))}
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                          const pageNum = Math.max(1, Math.min(pagination.totalPages, pagination.page - 2 + i));
                          return (
                            <Button
                              key={pageNum}
                              variant={pagination.page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}