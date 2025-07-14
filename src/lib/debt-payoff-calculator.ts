import { 
  DebtPayoffInput, 
  PayoffStrategy, 
  PaymentScheduleEntry, 
  DebtPayoffResult, 
  DebtPayoffComparison,
  CustomPayoffOrder
} from '@/types/debt-payoff';

export class DebtPayoffCalculator {
  private debts: DebtPayoffInput[];
  private extraPayment: number;

  constructor(debts: DebtPayoffInput[], extraPayment: number = 0) {
    this.debts = debts.map(debt => ({...debt})); // Deep copy
    this.extraPayment = extraPayment;
  }

  /**
   * Calculate debt payoff using snowball strategy (smallest balance first)
   */
  calculateSnowball(): DebtPayoffResult {
    const strategy: PayoffStrategy = {
      strategy: 'snowball',
      extra_payment: this.extraPayment,
      description: 'Pay off debts from smallest to largest balance'
    };

    // Sort debts by balance (ascending)
    const sortedDebts = [...this.debts].sort((a, b) => a.current_balance - b.current_balance);
    
    return this.calculatePayoffSchedule(sortedDebts, strategy);
  }

  /**
   * Calculate debt payoff using avalanche strategy (highest interest rate first)
   */
  calculateAvalanche(): DebtPayoffResult {
    const strategy: PayoffStrategy = {
      strategy: 'avalanche',
      extra_payment: this.extraPayment,
      description: 'Pay off debts from highest to lowest interest rate'
    };

    // Sort debts by interest rate (descending)
    const sortedDebts = [...this.debts].sort((a, b) => b.interest_rate - a.interest_rate);
    
    return this.calculatePayoffSchedule(sortedDebts, strategy);
  }

  /**
   * Calculate debt payoff using custom order
   */
  calculateCustom(customOrder: CustomPayoffOrder[]): DebtPayoffResult {
    const strategy: PayoffStrategy = {
      strategy: 'custom',
      extra_payment: this.extraPayment,
      description: 'Pay off debts in custom priority order'
    };

    // Sort debts by custom priority
    const sortedDebts = [...this.debts].sort((a, b) => {
      const priorityA = customOrder.find(o => o.debt_id === a.debt_id)?.priority || 999;
      const priorityB = customOrder.find(o => o.debt_id === b.debt_id)?.priority || 999;
      return priorityA - priorityB;
    });
    
    return this.calculatePayoffSchedule(sortedDebts, strategy);
  }

  /**
   * Calculate minimum payment only scenario
   */
  calculateMinimumOnly(): DebtPayoffResult {
    const strategy: PayoffStrategy = {
      strategy: 'avalanche', // Use avalanche as base but with 0 extra payment
      extra_payment: 0,
      description: 'Pay only minimum payments on all debts'
    };

    return this.calculatePayoffSchedule([...this.debts], strategy, true);
  }

  /**
   * Compare all strategies and provide recommendation
   */
  compareStrategies(): DebtPayoffComparison {
    const snowball = this.calculateSnowball();
    const avalanche = this.calculateAvalanche();
    const minimumOnly = this.calculateMinimumOnly();

    // Determine recommendation based on interest savings vs. psychological benefits
    const interestDifference = snowball.total_interest_paid - avalanche.total_interest_paid;
    const timeDifference = snowball.total_months - avalanche.total_months;
    
    let recommendedStrategy: 'snowball' | 'avalanche';
    let recommendationReason: string;

    if (interestDifference < 500 || timeDifference <= 3) {
      // If the difference is small, recommend snowball for psychological benefits
      recommendedStrategy = 'snowball';
      recommendationReason = 'The interest difference is minimal, so the psychological benefits of quick wins make snowball the better choice.';
    } else if (interestDifference > 2000 || timeDifference > 12) {
      // If the difference is significant, recommend avalanche
      recommendedStrategy = 'avalanche';
      recommendationReason = `Avalanche saves $${interestDifference.toFixed(0)} in interest and ${timeDifference} months, making it the clear winner.`;
    } else {
      // Middle ground - consider total debt amount
      const totalDebt = this.debts.reduce((sum, debt) => sum + debt.current_balance, 0);
      if (totalDebt > 50000) {
        recommendedStrategy = 'avalanche';
        recommendationReason = 'With high total debt, maximizing interest savings with avalanche is more important.';
      } else {
        recommendedStrategy = 'snowball';
        recommendationReason = 'Quick wins from snowball will help maintain motivation for debt payoff.';
      }
    }

    return {
      debts: this.debts,
      strategies: {
        snowball,
        avalanche,
        minimum_only: minimumOnly
      },
      recommended_strategy: recommendedStrategy,
      recommendation_reason: recommendationReason
    };
  }

  /**
   * Core calculation logic for debt payoff schedule
   */
  private calculatePayoffSchedule(
    sortedDebts: DebtPayoffInput[], 
    strategy: PayoffStrategy,
    minimumOnly: boolean = false
  ): DebtPayoffResult {
    const schedule: PaymentScheduleEntry[] = [];
    const workingDebts = sortedDebts.map(debt => ({
      ...debt,
      remaining_balance: debt.current_balance
    }));

    let month = 0;
    let totalInterestPaid = 0;
    let totalAmountPaid = 0;
    const debtPayoffOrder: number[] = [];

    while (workingDebts.some(debt => debt.remaining_balance > 0)) {
      month++;

      // Calculate total minimum payments for active debts
      const activeDebts = workingDebts.filter(debt => debt.remaining_balance > 0);

      // Distribute extra payment to highest priority debt (first in sorted order)
      let remainingExtraPayment = minimumOnly ? 0 : strategy.extra_payment;
      
      for (const debt of workingDebts) {
        if (debt.remaining_balance <= 0) continue;

        // Calculate monthly interest
        const monthlyInterest = (debt.remaining_balance * debt.interest_rate / 100) / 12;
        
        // Base payment is minimum payment
        let totalPayment = debt.minimum_payment;
        
        // Add extra payment to the first active debt (highest priority)
        if (remainingExtraPayment > 0 && debt === activeDebts[0]) {
          totalPayment += remainingExtraPayment;
          remainingExtraPayment = 0;
        }

        // Don't pay more than the remaining balance
        totalPayment = Math.min(totalPayment, debt.remaining_balance + monthlyInterest);
        
        // Calculate principal payment
        const principalPayment = totalPayment - monthlyInterest;
        
        // Update remaining balance
        debt.remaining_balance = Math.max(0, debt.remaining_balance - principalPayment);
        
        // Track if debt is paid off this month
        const isPaidOff = debt.remaining_balance === 0;
        if (isPaidOff && !debtPayoffOrder.includes(debt.debt_id)) {
          debtPayoffOrder.push(debt.debt_id);
        }

        // Add to schedule
        schedule.push({
          month,
          debt_id: debt.debt_id,
          debt_name: debt.name,
          payment_amount: totalPayment,
          principal_payment: principalPayment,
          interest_payment: monthlyInterest,
          remaining_balance: debt.remaining_balance,
          is_paid_off: isPaidOff
        });

        totalInterestPaid += monthlyInterest;
        totalAmountPaid += totalPayment;
      }

      // Safety check to prevent infinite loops
      if (month > 600) { // 50 years max
        throw new Error('Debt payoff calculation exceeded maximum timeframe');
      }
    }

    // Calculate savings vs minimum only
    const minimumOnlyResult = minimumOnly ? null : this.calculateMinimumOnly();
    const savingsVsMinimum = minimumOnlyResult ? {
      months_saved: minimumOnlyResult.total_months - month,
      interest_saved: minimumOnlyResult.total_interest_paid - totalInterestPaid
    } : {
      months_saved: 0,
      interest_saved: 0
    };

    return {
      strategy,
      total_months: month,
      total_interest_paid: totalInterestPaid,
      total_amount_paid: totalAmountPaid,
      monthly_schedule: schedule,
      debt_payoff_order: debtPayoffOrder,
      savings_vs_minimum: savingsVsMinimum
    };
  }

  /**
   * Calculate how much extra payment is needed to pay off all debts by a target date
   */
  calculateExtraPaymentForTarget(targetMonths: number): number {
    let low = 0;
    let high = 10000; // Start with reasonable upper bound
    let bestExtraPayment = 0;

    // Binary search for the required extra payment
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const calculator = new DebtPayoffCalculator(this.debts, mid);
      const result = calculator.calculateAvalanche(); // Use avalanche for efficiency

      if (result.total_months <= targetMonths) {
        bestExtraPayment = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }

      // If we need more than $10,000 extra payment, double the search range
      if (low > 10000) {
        high = 20000;
        low = 10001;
      }
    }

    return bestExtraPayment;
  }

  /**
   * Get debt payoff summary statistics
   */
  getSummaryStats() {
    const totalBalance = this.debts.reduce((sum, debt) => sum + debt.current_balance, 0);
    const totalMinimumPayments = this.debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
    const averageInterestRate = this.debts.length > 0 
      ? this.debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / this.debts.length 
      : 0;
    const highestInterestRate = Math.max(...this.debts.map(debt => debt.interest_rate));
    const lowestBalance = Math.min(...this.debts.map(debt => debt.current_balance));

    return {
      total_balance: totalBalance,
      total_minimum_payments: totalMinimumPayments,
      average_interest_rate: averageInterestRate,
      highest_interest_rate: highestInterestRate,
      lowest_balance: lowestBalance,
      debt_count: this.debts.length
    };
  }
}