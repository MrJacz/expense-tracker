import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";

// GET /api/debts - Get financial accounts that are debts
export async function GET(_request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get financial accounts that are debts with debt details
		const debts = await prisma.financialAccount.findMany({
			where: {
				userId: session.user.id,
				type: { in: ['credit_card', 'loan'] }
			},
			include: {
				debtDetails: true
			},
			orderBy: { name: 'asc' }
		});

		// Calculate summary stats
		const totalDebt = debts.reduce((sum, debt) => sum + Number(debt.balance), 0);
		const totalMonthlyPayments = debts.reduce((sum, debt) => 
			sum + (debt.debtDetails?.minimumPayment ? Number(debt.debtDetails.minimumPayment) : 0), 0);
		const averageInterestRate = debts.length > 0 
			? debts.reduce((sum, debt) => 
				sum + (debt.debtDetails?.interestRateApr ? Number(debt.debtDetails.interestRateApr) : 0), 0) / debts.length
			: 0;

		const byStatus = debts.reduce((acc: Record<string, number>, debt) => {
			const status = debt.debtDetails?.status || 'active';
			acc[status] = (acc[status] || 0) + 1;
			return acc;
		}, {});

		return NextResponse.json({
			debts,
			summary: {
				totalDebt,
				totalMonthlyPayments,
				averageInterestRate,
				debtCount: debts.length,
				byStatus
			}
		});
	} catch (error) {
		console.error("Error fetching debts:", error);
		return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 });
	}
}

// POST /api/debts - Create a new debt payoff goal
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const debtData = await request.json();

		// Validate required fields
		if (!debtData.name || !debtData.original_amount) {
			return NextResponse.json({ 
				error: "Name and original amount are required" 
			}, { status: 400 });
		}

		if (debtData.original_amount <= 0) {
			return NextResponse.json({ error: "Invalid amount values" }, { status: 400 });
		}

		// Get user's first account if no target account specified
		let linkedAccountId = debtData.target_account_id;
		if (!linkedAccountId) {
			const account = await prisma.financialAccount.findFirst({
				where: { userId: session.user.id },
				select: { id: true }
			});
			linkedAccountId = account?.id || null;
		}

		// Create the debt payoff goal
		const newGoal = await prisma.goal.create({
			data: {
				userId: session.user.id,
				linkedAccountId,
				name: debtData.name,
				targetAmount: debtData.original_amount,
				currentAmount: debtData.current_balance || 0,
				targetDate: debtData.due_date ? new Date(debtData.due_date) : null
			},
			include: {
				linkedAccount: {
					select: { name: true }
				}
			}
		});

		return NextResponse.json(
			{
				message: "Debt payoff goal created successfully",
				debt: {
					id: newGoal.id,
					name: newGoal.name,
					description: null,
					original_amount: newGoal.targetAmount.toNumber(),
					current_balance: newGoal.targetAmount.toNumber() - newGoal.currentAmount.toNumber(),
					total_paid: newGoal.currentAmount.toNumber(),
					start_date: newGoal.createdAt,
					due_date: newGoal.targetDate,
					created_at: newGoal.createdAt
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating debt:", error);
		return NextResponse.json({ error: "Failed to create debt" }, { status: 500 });
	}
}