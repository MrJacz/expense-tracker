import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DebtPayoffCalculator } from "@/lib/debt-payoff-calculator";
import { DebtPayoffInput, CustomPayoffOrder } from "@/types/debt-payoff";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      debts, 
      extra_payment = 0, 
      strategy = 'comparison',
      custom_order = []
    }: {
      debts: DebtPayoffInput[];
      extra_payment?: number;
      strategy?: 'snowball' | 'avalanche' | 'custom' | 'comparison';
      custom_order?: CustomPayoffOrder[];
    } = body;

    // Validate input
    if (!Array.isArray(debts) || debts.length === 0) {
      return NextResponse.json({ error: "At least one debt is required" }, { status: 400 });
    }

    // Validate debt data
    for (const debt of debts) {
      if (!debt.debt_id || !debt.name || debt.current_balance <= 0 || debt.interest_rate < 0 || debt.minimum_payment <= 0) {
        return NextResponse.json({ 
          error: "Invalid debt data. All debts must have valid ID, name, balance, interest rate, and minimum payment" 
        }, { status: 400 });
      }
    }

    if (extra_payment < 0) {
      return NextResponse.json({ error: "Extra payment cannot be negative" }, { status: 400 });
    }

    const calculator = new DebtPayoffCalculator(debts, extra_payment);

    switch (strategy) {
      case 'snowball': {
        const result = calculator.calculateSnowball();
        const summaryStats = calculator.getSummaryStats();
        return NextResponse.json({
          strategy: 'snowball',
          result,
          summary_stats: summaryStats
        });
      }

      case 'avalanche': {
        const result = calculator.calculateAvalanche();
        const summaryStats = calculator.getSummaryStats();
        return NextResponse.json({
          strategy: 'avalanche',
          result,
          summary_stats: summaryStats
        });
      }

      case 'custom': {
        if (!Array.isArray(custom_order) || custom_order.length === 0) {
          return NextResponse.json({ error: "Custom order is required for custom strategy" }, { status: 400 });
        }
        
        const result = calculator.calculateCustom(custom_order);
        const summaryStats = calculator.getSummaryStats();
        return NextResponse.json({
          strategy: 'custom',
          result,
          summary_stats: summaryStats
        });
      }

      case 'comparison':
      default: {
        const comparison = calculator.compareStrategies();
        const summaryStats = calculator.getSummaryStats();
        return NextResponse.json({
          strategy: 'comparison',
          comparison,
          summary_stats: summaryStats
        });
      }
    }
  } catch (error) {
    console.error("Error calculating debt payoff:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to calculate debt payoff" 
    }, { status: 500 });
  }
}