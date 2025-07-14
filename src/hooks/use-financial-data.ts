"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  TransactionWithDetails, 
  FinancialAccountWithDebt, 
  RecurringTransactionWithCategory,
  RealFinancialSummary,
  calculateTransactionTotal,
  getMonthlyMultiplier,
  ensureDate
} from "@/types/prisma-financial";

interface FinancialData {
  transactions: TransactionWithDetails[];
  debts: FinancialAccountWithDebt[];
  recurringPayments: RecurringTransactionWithCategory[];
  summary: RealFinancialSummary | null;
  isLoading: boolean;
  error: string | null;
}

export function useFinancialData() {
  const [data, setData] = useState<FinancialData>({
    transactions: [],
    debts: [],
    recurringPayments: [],
    summary: null,
    isLoading: true,
    error: null
  });

  const fetchFinancialData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch recent transactions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      const [transactionsRes, debtsRes, recurringRes, summaryRes] = await Promise.all([
        fetch(`/api/financial-transactions?start_date=${startDate}&limit=50&sort_by=date&sort_order=desc`),
        fetch('/api/debts'),
        fetch('/api/recurring-payments?is_active=true'),
        fetch('/api/financial-summary')
      ]);

      if (!transactionsRes.ok || !debtsRes.ok || !recurringRes.ok) {
        throw new Error('Failed to fetch financial data');
      }

      const [transactionsData, debtsData, recurringData] = await Promise.all([
        transactionsRes.json(),
        debtsRes.json(),
        recurringRes.json()
      ]);

      // Try to get summary from API, fallback to calculation if not available
      let summary;
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        summary = summaryData.summary;
      } else {
        // Fallback to client-side calculation
        summary = calculateFinancialSummary(
          transactionsData.transactions || [],
          debtsData.debts || [],
          recurringData.recurringPayments || []
        );
      }

      setData({
        transactions: transactionsData.transactions || [],
        debts: debtsData.debts || [],
        recurringPayments: recurringData.recurringPayments || [],
        summary,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch financial data"
      }));
    }
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const refreshData = useCallback(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  return {
    ...data,
    refreshData
  };
}

function calculateFinancialSummary(
  transactions: TransactionWithDetails[],
  debts: FinancialAccountWithDebt[],
  recurringPayments: RecurringTransactionWithCategory[]
): RealFinancialSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Filter transactions by type and time period
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  
  const currentMonthExpenses = expenses.filter(t => {
    const date = ensureDate(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const currentMonthIncome = income.filter(t => {
    const date = ensureDate(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const lastMonthExpenses = expenses.filter(t => {
    const date = ensureDate(t.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });

  const lastMonthIncome = income.filter(t => {
    const date = ensureDate(t.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });

  // Calculate totals using the helper function
  const totalExpenses = expenses.reduce((sum, t) => sum + calculateTransactionTotal(t), 0);
  const totalIncome = income.reduce((sum, t) => sum + calculateTransactionTotal(t), 0);
  const monthlyExpenses = currentMonthExpenses.reduce((sum, t) => sum + calculateTransactionTotal(t), 0);
  const monthlyIncome = currentMonthIncome.reduce((sum, t) => sum + calculateTransactionTotal(t), 0);
  
  const lastMonthExpensesTotal = lastMonthExpenses.reduce((sum, t) => sum + calculateTransactionTotal(t), 0);
  const lastMonthIncomeTotal = lastMonthIncome.reduce((sum, t) => sum + calculateTransactionTotal(t), 0);

  // Calculate trends (percentage change from last month)
  const expenseTrend = lastMonthExpensesTotal > 0 
    ? ((monthlyExpenses - lastMonthExpensesTotal) / lastMonthExpensesTotal) * 100 
    : monthlyExpenses > 0 ? 100 : 0;

  const incomeTrend = lastMonthIncomeTotal > 0 
    ? ((monthlyIncome - lastMonthIncomeTotal) / lastMonthIncomeTotal) * 100 
    : monthlyIncome > 0 ? 100 : 0;

  // Debt calculations
  const totalDebt = debts.reduce((sum, d) => sum + Number(d.balance), 0);
  const monthlyDebtPayments = debts.reduce((sum, d) => sum + (d.debtDetails?.minimumPayment ? Number(d.debtDetails.minimumPayment) : 0), 0);
  const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;

  // Calculate debt trend (would need historical data for accurate calculation)
  const debtTrend = 0; // Placeholder - would need previous month's debt data

  // Recurring payments calculations
  const activeRecurring = recurringPayments.filter(rp => rp.isActive);
  const monthlyRecurringExpenses = activeRecurring
    .reduce((sum, rp) => {
      const multiplier = getMonthlyMultiplier(rp.frequency);
      return sum + (Number(rp.amount) * multiplier);
    }, 0);

  // Upcoming bills (due within 7 days)
  const upcomingBills = activeRecurring.filter(rp => {
    const dueDate = ensureDate(rp.nextDueDate);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return dueDate <= sevenDaysFromNow;
  });

  // Overdue payments
  const overdueBills = activeRecurring.filter(rp => {
    const dueDate = ensureDate(rp.nextDueDate);
    return dueDate < now;
  });

  // Low balance debts (less than 3 months of minimum payments remaining)
  const lowBalanceDebts = debts.filter(d => {
    if (!d.debtDetails?.minimumPayment || Number(d.debtDetails.minimumPayment) <= 0) return false;
    const monthsRemaining = Number(d.balance) / Number(d.debtDetails.minimumPayment);
    return monthsRemaining <= 3 && d.debtDetails.status === 'active';
  });

  return {
    // Transaction totals
    totalExpenses,
    totalIncome,
    netIncome: totalIncome - totalExpenses,

    // Monthly summaries
    monthlyExpenses,
    monthlyIncome,
    monthlyNet: monthlyIncome - monthlyExpenses,

    // Debt summary
    totalDebt,
    monthlyDebtPayments,
    debtToIncomeRatio,

    // Recurring payments summary
    monthlyRecurringExpenses,
    monthlyRecurringIncome: 0, // Not tracked in current schema
    activeSubscriptions: activeRecurring.length,

    // Trends
    expenseTrend,
    incomeTrend,
    debtTrend,

    // Upcoming events
    upcomingBills,
    overdueBills,
    lowBalanceDebts
  };
}

