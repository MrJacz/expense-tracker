"use client";

import { useState, useCallback } from "react";
import { 
  DebtPayoffInput, 
  PayoffCalculatorState, 
  DebtPayoffComparison,
  CustomPayoffOrder 
} from "@/types/debt-payoff";

interface TargetPaymentResult {
  required_extra_payment: number;
  is_achievable: boolean;
  current_timeline: number;
  target_timeline: number;
  actual_timeline?: number;
  total_interest_with_extra?: number;
  total_interest_minimum_only?: number;
  interest_savings?: number;
  months_saved?: number;
  months_ahead?: number;
  message: string;
}

export function useDebtPayoff() {
  const [state, setState] = useState<PayoffCalculatorState>({
    debts: [],
    extra_payment: 0,
    current_strategy: 'snowball',
    results: null,
    comparison: null,
    isCalculating: false,
    error: null
  });

  const setDebts = useCallback((debts: DebtPayoffInput[]) => {
    setState(prev => ({ ...prev, debts, results: null, comparison: null, error: null }));
  }, []);

  const setExtraPayment = useCallback((amount: number) => {
    setState(prev => ({ ...prev, extra_payment: amount, results: null, comparison: null }));
  }, []);

  const setStrategy = useCallback((strategy: 'snowball' | 'avalanche' | 'custom') => {
    setState(prev => ({ ...prev, current_strategy: strategy, results: null }));
  }, []);

  const calculatePayoff = useCallback(async (
    strategy: 'snowball' | 'avalanche' | 'custom' | 'comparison' = 'comparison',
    customOrder?: CustomPayoffOrder[]
  ) => {
    if (state.debts.length === 0) {
      setState(prev => ({ ...prev, error: "No debts to calculate" }));
      return;
    }

    setState(prev => ({ ...prev, isCalculating: true, error: null }));

    try {
      const response = await fetch("/api/debt-payoff/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debts: state.debts,
          extra_payment: state.extra_payment,
          strategy,
          custom_order: customOrder
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to calculate debt payoff");
      }

      const data = await response.json();

      if (data.strategy === 'comparison') {
        setState(prev => ({ 
          ...prev, 
          comparison: data.comparison,
          results: null,
          isCalculating: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          results: data.result,
          comparison: null,
          current_strategy: strategy === "comparison" ? "avalanche" : strategy,
          isCalculating: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Failed to calculate debt payoff",
        isCalculating: false 
      }));
    }
  }, [state.debts, state.extra_payment]);

  const calculateTargetPayment = useCallback(async (targetMonths: number): Promise<TargetPaymentResult | null> => {
    if (state.debts.length === 0) {
      throw new Error("No debts to calculate");
    }

    try {
      const response = await fetch("/api/debt-payoff/target-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debts: state.debts,
          target_months: targetMonths
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to calculate target payment");
      }

      return await response.json();
    } catch (error) {
      console.error("Error calculating target payment:", error);
      throw error;
    }
  }, [state.debts]);

  const addDebt = useCallback((debt: Omit<DebtPayoffInput, 'debt_id'>) => {
    const newDebt: DebtPayoffInput = {
      ...debt,
      debt_id: Date.now() // Simple ID generation for demo
    };
    setState(prev => ({ 
      ...prev, 
      debts: [...prev.debts, newDebt],
      results: null,
      comparison: null,
      error: null
    }));
  }, []);

  const updateDebt = useCallback((debtId: number, updates: Partial<DebtPayoffInput>) => {
    setState(prev => ({
      ...prev,
      debts: prev.debts.map(debt => 
        debt.debt_id === debtId ? { ...debt, ...updates } : debt
      ),
      results: null,
      comparison: null,
      error: null
    }));
  }, []);

  const removeDebt = useCallback((debtId: number) => {
    setState(prev => ({
      ...prev,
      debts: prev.debts.filter(debt => debt.debt_id !== debtId),
      results: null,
      comparison: null,
      error: null
    }));
  }, []);

  const clearResults = useCallback(() => {
    setState(prev => ({ ...prev, results: null, comparison: null, error: null }));
  }, []);

  const resetCalculator = useCallback(() => {
    setState({
      debts: [],
      extra_payment: 0,
      current_strategy: 'snowball',
      results: null,
      comparison: null,
      isCalculating: false,
      error: null
    });
  }, []);

  // Helper functions for analysis
  const getTotalDebt = useCallback(() => {
    return state.debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  }, [state.debts]);

  const getTotalMinimumPayments = useCallback(() => {
    return state.debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  }, [state.debts]);

  const getAverageInterestRate = useCallback(() => {
    if (state.debts.length === 0) return 0;
    const totalWeightedRate = state.debts.reduce((sum, debt) => 
      sum + (debt.interest_rate * debt.current_balance), 0
    );
    return totalWeightedRate / getTotalDebt();
  }, [state.debts, getTotalDebt]);

  const getHighestInterestDebt = useCallback(() => {
    if (state.debts.length === 0) return null;
    return state.debts.reduce((highest, debt) => 
      debt.interest_rate > highest.interest_rate ? debt : highest
    );
  }, [state.debts]);

  const getSmallestBalanceDebt = useCallback(() => {
    if (state.debts.length === 0) return null;
    return state.debts.reduce((smallest, debt) => 
      debt.current_balance < smallest.current_balance ? debt : smallest
    );
  }, [state.debts]);

  return {
    // State
    ...state,
    
    // Actions
    setDebts,
    setExtraPayment,
    setStrategy,
    calculatePayoff,
    calculateTargetPayment,
    addDebt,
    updateDebt,
    removeDebt,
    clearResults,
    resetCalculator,
    
    // Computed values
    getTotalDebt,
    getTotalMinimumPayments,
    getAverageInterestRate,
    getHighestInterestDebt,
    getSmallestBalanceDebt
  };
}