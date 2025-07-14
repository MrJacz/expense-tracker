export interface DebtPayoffInput {
  debt_id: number;
  name: string;
  current_balance: number;
  interest_rate: number; // Annual percentage rate
  minimum_payment: number;
}

export interface PayoffStrategy {
  strategy: 'snowball' | 'avalanche' | 'custom';
  extra_payment: number; // Additional amount to pay beyond minimums
  description: string;
}

export interface PaymentScheduleEntry {
  month: number;
  debt_id: number;
  debt_name: string;
  payment_amount: number;
  principal_payment: number;
  interest_payment: number;
  remaining_balance: number;
  is_paid_off: boolean;
}

export interface DebtPayoffResult {
  strategy: PayoffStrategy;
  total_months: number;
  total_interest_paid: number;
  total_amount_paid: number;
  monthly_schedule: PaymentScheduleEntry[];
  debt_payoff_order: number[]; // Array of debt IDs in payoff order
  savings_vs_minimum: {
    months_saved: number;
    interest_saved: number;
  };
}

export interface DebtPayoffComparison {
  debts: DebtPayoffInput[];
  strategies: {
    snowball: DebtPayoffResult;
    avalanche: DebtPayoffResult;
    minimum_only: DebtPayoffResult;
  };
  recommended_strategy: 'snowball' | 'avalanche';
  recommendation_reason: string;
}

export interface PayoffCalculatorState {
  debts: DebtPayoffInput[];
  extra_payment: number;
  current_strategy: 'snowball' | 'avalanche' | 'custom';
  results: DebtPayoffResult | null;
  comparison: DebtPayoffComparison | null;
  isCalculating: boolean;
  error: string | null;
}

export interface CustomPayoffOrder {
  debt_id: number;
  priority: number; // 1 = highest priority (pay off first)
}

export interface PayoffProgress {
  debt_id: number;
  original_balance: number;
  current_balance: number;
  target_payoff_date: string;
  months_remaining: number;
  percent_complete: number;
  on_track: boolean;
  variance_months: number; // Positive = ahead of schedule, negative = behind
}

// Configuration for debt payoff visualization
export interface PayoffVisualizationConfig {
  show_interest_breakdown: boolean;
  show_payment_timeline: boolean;
  show_balance_progression: boolean;
  highlight_strategy_differences: boolean;
}

// Debt payoff goal tracking
export interface DebtPayoffGoal {
  id: number;
  user_id: number;
  name: string;
  target_strategy: 'snowball' | 'avalanche' | 'custom';
  target_extra_payment: number;
  target_completion_date: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  progress: PayoffProgress[];
}

export const PAYOFF_STRATEGY_CONFIG = {
  snowball: {
    name: 'Debt Snowball',
    description: 'Pay off debts from smallest to largest balance',
    icon: 'Snowflake',
    pros: [
      'Quick psychological wins',
      'Builds momentum and motivation',
      'Simplifies debt management faster'
    ],
    cons: [
      'May pay more interest overall',
      'Higher interest debts linger longer'
    ]
  },
  avalanche: {
    name: 'Debt Avalanche',
    description: 'Pay off debts from highest to lowest interest rate',
    icon: 'Mountain',
    pros: [
      'Minimizes total interest paid',
      'Mathematically optimal',
      'Saves the most money'
    ],
    cons: [
      'Slower initial progress',
      'Less psychological motivation',
      'Requires more discipline'
    ]
  },
  custom: {
    name: 'Custom Strategy',
    description: 'Set your own debt priority order',
    icon: 'Settings',
    pros: [
      'Flexible to your situation',
      'Can prioritize by personal factors',
      'Adaptable strategy'
    ],
    cons: [
      'Requires more planning',
      'May not be mathematically optimal',
      'Needs regular review'
    ]
  }
} as const;

export type PayoffStrategyType = keyof typeof PAYOFF_STRATEGY_CONFIG;