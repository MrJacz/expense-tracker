"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  CreditCard, 
  ArrowUpCircle,
  ArrowDownCircle,
  MoreHorizontal,
  Calendar
} from "lucide-react";
import { TransactionWithDetails, calculateTransactionTotal, ensureDate } from "@/types/prisma-financial";

interface RecentTransactionsProps {
  transactions: TransactionWithDetails[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

export function RecentTransactions({ transactions, isLoading, onViewAll }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    // Ensure amount is a valid number, default to 0 if NaN
    const validAmount = isNaN(amount) ? 0 : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(validAmount);
  };

  const formatDate = (dateString: string) => {
    const date = ensureDate(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
      case 'expense':
        return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <MoreHorizontal className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'income':
        return "text-green-600";
      case 'expense':
        return "text-red-600";
      case 'transfer':
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'income':
        return "+";
      case 'expense':
        return "-";
      case 'transfer':
        return "";
      default:
        return "";
    }
  };

  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = ensureDate(transaction.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, TransactionWithDetails[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent transactions</p>
            <p className="text-sm text-gray-400">Your transactions will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Last 30 days • {transactions.length} transactions
            </CardDescription>
          </div>
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedDates.slice(0, 7).map((date) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  {formatDate(date)}
                </h4>
                <div className="flex-1 h-px bg-border"></div>
                <div className="text-xs text-muted-foreground">
                  {groupedTransactions[date].length} transactions
                </div>
              </div>
              
              <div className="space-y-3">
                {groupedTransactions[date].slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {transaction.description}
                        </p>
                        {transaction.splits[0]?.category && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {transaction.splits[0].category.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {transaction.account.name}
                        </span>
                        {transaction.splits.length > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            {transaction.splits.length} splits
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${getAmountColor(transaction.type)}`}>
                        {getAmountPrefix(transaction.type)}{formatCurrency(calculateTransactionTotal(transaction))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ensureDate(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {groupedTransactions[date].length > 5 && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm" className="text-xs">
                      +{groupedTransactions[date].length - 5} more transactions
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {sortedDates.length > 7 && (
            <div className="text-center pt-4 border-t">
              <Button variant="outline" size="sm" onClick={onViewAll}>
                View All Transactions
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}