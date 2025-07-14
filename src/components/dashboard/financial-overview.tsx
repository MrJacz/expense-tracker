"use client";

import { Section } from "@/components/ui/section";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Repeat, 
  AlertTriangle,
  Calendar,
  Target,
  Wallet,
  PiggyBank
} from "lucide-react";
import { RealFinancialSummary, FinancialAccountWithDebt, RecurringTransactionWithCategory, ensureDate } from "@/types/prisma-financial";

interface FinancialOverviewProps {
  summary: RealFinancialSummary;
  debts: FinancialAccountWithDebt[];
  recurringPayments: RecurringTransactionWithCategory[];
}

export function FinancialOverview({ summary, debts }: FinancialOverviewProps) {
  const formatCurrency = (amount: number) => {
    // Ensure amount is a valid number, default to 0 if NaN
    const validAmount = isNaN(amount) ? 0 : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(validAmount);
  };


  // Calculate financial health score (0-100)
  const calculateHealthScore = () => {
    let score = 50; // Base score
    
    // Positive net income adds points
    if (summary.monthlyNet > 0) score += 20;
    
    // Low debt-to-income ratio adds points
    if (summary.debtToIncomeRatio < 20) score += 15;
    else if (summary.debtToIncomeRatio < 40) score += 10;
    else score -= 10;
    
    // No overdue payments adds points
    if (summary.overdueBills.length === 0) score += 10;
    else score -= summary.overdueBills.length * 5;
    
    // Positive income trend adds points
    if (summary.incomeTrend > 0) score += 5;
    if (summary.expenseTrend < 0) score += 5; // Decreasing expenses is good
    
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();
  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  return (
    <div className="space-y-8">
      {/* Financial Health Score */}
      <Section title="Financial Health" description="Your overall financial wellness">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Financial Health Score
                </CardTitle>
                <CardDescription>
                  Based on income, expenses, debt, and payment history
                </CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getHealthColor(healthScore)}`}>
                  {healthScore}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getHealthLabel(healthScore)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={healthScore} className="h-3" />
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">Net Income</div>
                <div className={summary.monthlyNet >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(summary.monthlyNet)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Debt Ratio</div>
                <div className={summary.debtToIncomeRatio < 40 ? "text-green-600" : "text-red-600"}>
                  {summary.debtToIncomeRatio.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Overdue Bills</div>
                <div className={summary.overdueBills.length === 0 ? "text-green-600" : "text-red-600"}>
                  {summary.overdueBills.length}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Active Debts</div>
                <div className="text-muted-foreground">
                  {debts.filter(d => d.debtDetails?.status === 'active').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Key Financial Metrics */}
      <Section title="Financial Overview" description="Your money at a glance">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Monthly Income"
            value={formatCurrency(summary.monthlyIncome)}
            description="This month's earnings"
            icon={TrendingUp}
            trend={summary.incomeTrend !== 0 ? {
              value: Math.abs(summary.incomeTrend),
              isPositive: summary.incomeTrend > 0,
              label: "vs last month"
            } : undefined}
          />

          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(summary.monthlyExpenses)}
            description="This month's spending"
            icon={TrendingDown}
            trend={summary.expenseTrend !== 0 ? {
              value: Math.abs(summary.expenseTrend),
              isPositive: summary.expenseTrend < 0, // Negative expense trend is good
              label: "vs last month"
            } : undefined}
          />

          <StatCard
            title="Net Income"
            value={formatCurrency(summary.monthlyNet)}
            description="Income minus expenses"
            icon={summary.monthlyNet >= 0 ? Wallet : AlertTriangle}
            trend={summary.monthlyNet >= 0 ? {
              value: Math.abs((summary.monthlyNet / Math.max(summary.monthlyIncome, 1)) * 100),
              isPositive: true,
              label: "of income saved"
            } : undefined}
          />

          <StatCard
            title="Total Debt"
            value={formatCurrency(summary.totalDebt)}
            description={`${formatCurrency(summary.monthlyDebtPayments)}/month minimum`}
            icon={CreditCard}
            trend={summary.debtToIncomeRatio > 0 ? {
              value: summary.debtToIncomeRatio,
              isPositive: false,
              label: "debt-to-income ratio"
            } : undefined}
          />
        </div>
      </Section>

      {/* Recurring Payments Summary */}
      <Section title="Recurring Payments" description="Your subscriptions and regular income">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Monthly Subscriptions"
            value={formatCurrency(summary.monthlyRecurringExpenses)}
            description={`${summary.activeSubscriptions} active subscriptions`}
            icon={Repeat}
          />

          <StatCard
            title="Regular Income"
            value={formatCurrency(summary.monthlyRecurringIncome)}
            description="Recurring monthly income"
            icon={PiggyBank}
          />

          <StatCard
            title="Upcoming Bills"
            value={summary.upcomingBills.length.toString()}
            description="Due in next 7 days"
            icon={Calendar}
          />
        </div>
      </Section>

      {/* Alerts and Notifications */}
      {(summary.overdueBills.length > 0 || summary.lowBalanceDebts.length > 0) && (
        <Section title="Attention Required" description="Items that need your attention">
          <div className="space-y-4">
            {/* Overdue Payments */}
            {summary.overdueBills.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Overdue Payments ({summary.overdueBills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summary.overdueBills.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="font-medium">{payment.description}</div>
                          <div className="text-sm text-red-600">
                            Due: {ensureDate(payment.nextDueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-800">
                            {formatCurrency(Number(payment.amount))}
                          </div>
                          <Badge variant="destructive">Overdue</Badge>
                        </div>
                      </div>
                    ))}
                    {summary.overdueBills.length > 3 && (
                      <div className="text-center text-sm text-red-600">
                        +{summary.overdueBills.length - 3} more overdue payments
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Low Balance Debts */}
            {summary.lowBalanceDebts.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <CreditCard className="h-5 w-5" />
                    Debts Nearing Payoff ({summary.lowBalanceDebts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summary.lowBalanceDebts.slice(0, 3).map((debt) => (
                      <div key={debt.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="font-medium">{debt.name}</div>
                          <div className="text-sm text-yellow-600">
                            {debt.debtDetails?.minimumPayment && Number(debt.balance) > 0 
                              ? `${Math.ceil(Number(debt.balance) / Number(debt.debtDetails.minimumPayment))} payments remaining`
                              : 'Almost paid off!'
                            }
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-yellow-800">
                            {formatCurrency(Number(debt.balance))}
                          </div>
                          <Badge variant="secondary">Low Balance</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </Section>
      )}

      {/* Quick Actions */}
      <Section>
        <div className="flex flex-wrap gap-3">
          <Button className="gap-2">
            <DollarSign className="h-4 w-4" />
            Add Transaction
          </Button>
          <Button variant="outline" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Manage Debts
          </Button>
          <Button variant="outline" className="gap-2">
            <Repeat className="h-4 w-4" />
            Recurring Payments
          </Button>
          <Button variant="outline" className="gap-2">
            <Target className="h-4 w-4" />
            Set Budget
          </Button>
        </div>
      </Section>
    </div>
  );
}