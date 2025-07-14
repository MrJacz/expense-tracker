import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const type = searchParams.get("type");

		// Build date filter for Prisma
		const dateFilter: { gte?: Date; lte?: Date } = {};
		if (startDate) {
			dateFilter.gte = new Date(startDate);
		}
		if (endDate) {
			dateFilter.lte = new Date(endDate);
		}

		const analytics: Record<string, unknown> = {};

		// Base where clause for transactions
		const baseWhere = {
			userId: session.user.id,
			type: "expense" as const,
			...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
		};

		// Category breakdown
		if (!type || type === "category") {
			const categoryBreakdown = await prisma.category.findMany({
				where: {
					OR: [
						{ userId: session.user.id },
						{ isDefault: true }
					]
				},
				include: {
					transactionSplits: {
						where: {
							transaction: baseWhere
						}
					}
				}
			});

			const totalAmount = await prisma.transactionSplit.aggregate({
				where: {
					transaction: baseWhere
				},
				_sum: {
					amount: true
				}
			});

			const total = totalAmount._sum.amount?.toNumber() || 0;

			analytics.categoryBreakdown = categoryBreakdown
				.map(category => {
					const splits = category.transactionSplits;
					const categoryTotal = splits.reduce((sum, split) => sum + split.amount.toNumber(), 0);
					const count = splits.length;

					if (count === 0) return null;

					return {
						id: category.id,
						name: category.name,
						value: categoryTotal,
						count,
						average: count > 0 ? categoryTotal / count : 0,
						percentage: total > 0 ? (categoryTotal / total) * 100 : 0
					};
				})
				.filter(Boolean)
				.sort((a, b) => (b?.value || 0) - (a?.value || 0));
		}

		// Daily spending trend
		if (!type || type === "daily") {
			const transactions = await prisma.transaction.findMany({
				where: baseWhere,
				include: {
					splits: true
				},
				orderBy: {
					date: 'asc'
				}
			});

			const dailyData = new Map();
			
			transactions.forEach(transaction => {
				const dateKey = transaction.date.toISOString().split('T')[0];
				const totalAmount = transaction.splits.reduce((sum, split) => sum + split.amount.toNumber(), 0);
				
				if (!dailyData.has(dateKey)) {
					dailyData.set(dateKey, {
						date: dateKey,
						amount: 0,
						count: 0,
						transactions: []
					});
				}
				
				const day = dailyData.get(dateKey);
				day.amount += totalAmount;
				day.count += 1;
				day.transactions.push(totalAmount);
			});

			analytics.dailyTrend = Array.from(dailyData.values()).map(day => ({
				date: day.date,
				amount: day.amount,
				count: day.count,
				average: day.count > 0 ? day.amount / day.count : 0,
				formattedDate: new Date(day.date).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric"
				})
			}));
		}

		// Summary statistics
		const transactions = await prisma.transaction.findMany({
			where: baseWhere,
			include: {
				splits: {
					include: {
						category: true
					}
				}
			}
		});

		const amounts = transactions.flatMap(t => 
			t.splits.map(s => s.amount.toNumber())
		);

		const uniqueCategories = new Set(
			transactions.flatMap(t => 
				t.splits.map(s => s.categoryId).filter(Boolean)
			)
		).size;

		const uniqueDays = new Set(
			transactions.map(t => t.date.toISOString().split('T')[0])
		).size;

		analytics.summary = {
			totalTransactions: transactions.length,
			totalAmount: amounts.reduce((sum, amount) => sum + amount, 0),
			avgTransaction: amounts.length > 0 ? amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length : 0,
			minTransaction: amounts.length > 0 ? Math.min(...amounts) : 0,
			maxTransaction: amounts.length > 0 ? Math.max(...amounts) : 0,
			uniqueCategories,
			uniqueDays
		};

		return NextResponse.json({ analytics });
	} catch (error) {
		console.error("Error fetching analytics:", error);
		return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
	}
}
