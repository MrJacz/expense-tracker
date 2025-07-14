import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { getMonthlyMultiplier } from "@/types/prisma-financial";

// GET /api/recurring-payments - Get recurring payments for user
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		
		// Simple filtering for now
		const isActive = searchParams.get("is_active");
		const whereClause: { userId: string; isActive?: boolean } = { userId: session.user.id };
		
		if (isActive === "true") {
			whereClause.isActive = true;
		} else if (isActive === "false") {
			whereClause.isActive = false;
		}

		const recurringPayments = await prisma.recurringTransaction.findMany({
			where: whereClause,
			include: {
				category: {
					select: { id: true, name: true }
				}
			},
			orderBy: { description: 'asc' }
		});

		// Calculate summary stats
		const totalMonthlyExpenses = recurringPayments
			.reduce((sum, rp) => {
				const multiplier = getMonthlyMultiplier(rp.frequency);
				return sum + (Number(rp.amount) * multiplier);
			}, 0);

		const activeCount = recurringPayments.filter(rp => rp.isActive).length;
		
		// Count upcoming payments (due within 7 days)
		const sevenDaysFromNow = new Date();
		sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
		const upcomingCount = recurringPayments.filter(rp => {
			const dueDate = new Date(rp.nextDueDate);
			return dueDate <= sevenDaysFromNow && rp.isActive;
		}).length;

		return NextResponse.json({
			recurringPayments,
			summary: {
				totalMonthlyExpenses,
				activeCount,
				upcomingCount
			}
		});
	} catch (error) {
		console.error("Error fetching recurring payments:", error);
		return NextResponse.json({ error: "Failed to fetch recurring payments" }, { status: 500 });
	}
}

// POST /api/recurring-payments - Create a new recurring payment
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();

		// Validate required fields
		if (!data.description || !data.amount || !data.frequency || !data.categoryId || !data.accountId) {
			return NextResponse.json({ 
				error: "Description, amount, frequency, category, and account are required" 
			}, { status: 400 });
		}

		// Create recurring payment
		const recurringPayment = await prisma.recurringTransaction.create({
			data: {
				userId: session.user.id,
				accountId: data.accountId,
				description: data.description,
				amount: data.amount,
				frequency: data.frequency,
				categoryId: data.categoryId,
				startDate: data.startDate ? new Date(data.startDate) : new Date(),
				nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : new Date(),
				isActive: data.isActive ?? true
			},
			include: {
				category: {
					select: { id: true, name: true }
				}
			}
		});

		return NextResponse.json({
			message: "Recurring payment created successfully",
			recurringPayment
		}, { status: 201 });
	} catch (error) {
		console.error("Error creating recurring payment:", error);
		return NextResponse.json({ error: "Failed to create recurring payment" }, { status: 500 });
	}
}