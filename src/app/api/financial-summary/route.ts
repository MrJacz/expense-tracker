import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { calculateTransactionTotal, getMonthlyMultiplier } from "@/types/prisma-financial";

// GET /api/financial-summary - Get comprehensive financial summary
export async function GET(_request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const now = new Date();
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		// Get transactions for the last 30 days
		const transactions = await prisma.transaction.findMany({
			where: {
				userId: session.user.id,
				date: {
					gte: thirtyDaysAgo
				}
			},
			include: {
				account: {
					select: { id: true, name: true, type: true }
				},
				splits: {
					include: {
						category: {
							select: { id: true, name: true }
						}
					}
				},
				attachments: {
					select: { id: true, fileName: true, fileUrl: true, fileType: true }
				}
			}
		});

		// Get financial accounts that are debts
		const debts = await prisma.financialAccount.findMany({
			where: {
				userId: session.user.id,
				type: { in: ['credit_card', 'loan'] }
			},
			include: {
				debtDetails: true
			}
		});

		// Get active recurring payments
		const recurringPayments = await prisma.recurringTransaction.findMany({
			where: {
				userId: session.user.id,
				isActive: true
			}
		});

		// Calculate transaction totals
		const expenseTransactions = transactions.filter(t => t.type === 'expense');
		const incomeTransactions = transactions.filter(t => t.type === 'income');

		const totalExpenses = expenseTransactions.reduce((sum, t) => sum + calculateTransactionTotal(t), 0);
		const totalIncome = incomeTransactions.reduce((sum, t) => sum + calculateTransactionTotal(t), 0);

		// Calculate monthly totals
		const currentMonthTransactions = transactions.filter(t => {
			const date = new Date(t.date);
			return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
		});

		const monthlyExpenses = currentMonthTransactions
			.filter(t => t.type === 'expense')
			.reduce((sum, t) => sum + calculateTransactionTotal(t), 0);

		const monthlyIncome = currentMonthTransactions
			.filter(t => t.type === 'income')
			.reduce((sum, t) => sum + calculateTransactionTotal(t), 0);

		// Calculate debt totals
		const totalDebt = debts.reduce((sum, d) => sum + Number(d.balance), 0);
		const monthlyDebtPayments = debts.reduce((sum, d) => 
			sum + (d.debtDetails?.minimumPayment ? Number(d.debtDetails.minimumPayment) : 0), 0);

		// Calculate recurring payments
		const monthlyRecurringExpenses = recurringPayments.reduce((sum, rp) => {
			const multiplier = getMonthlyMultiplier(rp.frequency);
			return sum + (Number(rp.amount) * multiplier);
		}, 0);

		// Upcoming bills (due within 7 days)
		const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
		const upcomingBills = recurringPayments.filter(rp => {
			const dueDate = new Date(rp.nextDueDate);
			return dueDate <= sevenDaysFromNow;
		});

		// Overdue bills
		const overdueBills = recurringPayments.filter(rp => {
			const dueDate = new Date(rp.nextDueDate);
			return dueDate < now;
		});

		// Low balance debts (less than 3 months of minimum payments)
		const lowBalanceDebts = debts.filter(d => {
			if (!d.debtDetails?.minimumPayment || Number(d.debtDetails.minimumPayment) <= 0) return false;
			const monthsRemaining = Number(d.balance) / Number(d.debtDetails.minimumPayment);
			return monthsRemaining <= 3 && d.debtDetails.status === 'active';
		});

		const summary = {
			totalExpenses,
			totalIncome,
			netIncome: totalIncome - totalExpenses,
			monthlyExpenses,
			monthlyIncome,
			monthlyNet: monthlyIncome - monthlyExpenses,
			totalDebt,
			monthlyDebtPayments,
			debtToIncomeRatio: monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0,
			monthlyRecurringExpenses,
			activeSubscriptions: recurringPayments.length,
			expenseTrend: 0, // Would need historical data for trends
			incomeTrend: 0,
			debtTrend: 0,
			upcomingBills,
			overdueBills,
			lowBalanceDebts
		};

		return NextResponse.json({ summary });
	} catch (error) {
		console.error("Error fetching financial summary:", error);
		return NextResponse.json({ error: "Failed to fetch financial summary" }, { status: 500 });
	}
}