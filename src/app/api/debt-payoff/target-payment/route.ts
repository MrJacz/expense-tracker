import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DebtPayoffCalculator } from "@/lib/debt-payoff-calculator";
import { DebtPayoffInput } from "@/types/debt-payoff";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      debts, 
      target_months
    }: {
      debts: DebtPayoffInput[];
      target_months: number;
    } = body;

    // Validate input
    if (!Array.isArray(debts) || debts.length === 0) {
      return NextResponse.json({ error: "At least one debt is required" }, { status: 400 });
    }

    if (!target_months || target_months <= 0 || target_months > 600) {
      return NextResponse.json({ error: "Target months must be between 1 and 600" }, { status: 400 });
    }

    // Validate debt data
    for (const debt of debts) {
      if (!debt.debt_id || !debt.name || debt.current_balance <= 0 || debt.interest_rate < 0 || debt.minimum_payment <= 0) {
        return NextResponse.json({ 
          error: "Invalid debt data. All debts must have valid ID, name, balance, interest rate, and minimum payment" 
        }, { status: 400 });
      }
    }

    const calculator = new DebtPayoffCalculator(debts, 0);
    
    // First check if it's possible with minimum payments only
    const minimumOnlyResult = calculator.calculateMinimumOnly();
    
    if (minimumOnlyResult.total_months <= target_months) {
      return NextResponse.json({
        required_extra_payment: 0,
        is_achievable: true,
        current_timeline: minimumOnlyResult.total_months,
        target_timeline: target_months,
        months_ahead: minimumOnlyResult.total_months - target_months,
        message: "Target is achievable with minimum payments only"
      });
    }

    // Calculate required extra payment
    const requiredExtraPayment = calculator.calculateExtraPaymentForTarget(target_months);
    
    // Verify the calculation by running it with the calculated extra payment
    const verificationCalculator = new DebtPayoffCalculator(debts, requiredExtraPayment);
    const verificationResult = verificationCalculator.calculateAvalanche();
    
    const isAchievable = verificationResult.total_months <= target_months;
    
    if (!isAchievable && requiredExtraPayment >= 10000) {
      return NextResponse.json({
        required_extra_payment: requiredExtraPayment,
        is_achievable: false,
        current_timeline: minimumOnlyResult.total_months,
        target_timeline: target_months,
        message: "Target requires very high extra payments and may not be practical"
      });
    }

    return NextResponse.json({
      required_extra_payment: requiredExtraPayment,
      is_achievable: isAchievable,
      current_timeline: minimumOnlyResult.total_months,
      target_timeline: target_months,
      actual_timeline: verificationResult.total_months,
      total_interest_with_extra: verificationResult.total_interest_paid,
      total_interest_minimum_only: minimumOnlyResult.total_interest_paid,
      interest_savings: minimumOnlyResult.total_interest_paid - verificationResult.total_interest_paid,
      months_saved: minimumOnlyResult.total_months - verificationResult.total_months,
      message: isAchievable 
        ? `Extra payment of $${requiredExtraPayment}/month will achieve your target`
        : "Target timeline may require very high extra payments"
    });
  } catch (error) {
    console.error("Error calculating target payment:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to calculate target payment" 
    }, { status: 500 });
  }
}