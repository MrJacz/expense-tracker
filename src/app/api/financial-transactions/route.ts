import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TransactionDataService } from "@/lib/database";
import { TransactionType } from "@prisma/client";

// GET /api/financial-transactions - Get filtered financial transactions
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);

		// Extract filters and convert to TransactionDataService format
		const filters = {
			type: searchParams.get("transaction_types")?.split(",")[0] as TransactionType || undefined,
			startDate: searchParams.get("start_date") || undefined,
			endDate: searchParams.get("end_date") || undefined,
			search: searchParams.get("search") || undefined,
			page: parseInt(searchParams.get("offset") || "0") / parseInt(searchParams.get("limit") || "100") + 1,
			limit: parseInt(searchParams.get("limit") || "100"),
			sortBy: (searchParams.get("sort_by") as "date" | "description") || "date",
			sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "desc"
		};

		// Use TransactionDataService to get transactions with actual structure
		const result = await TransactionDataService.getTransactions(session.user.id, filters);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching financial transactions:", error);
		return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
	}
}

// POST /api/financial-transactions - Create a new financial transaction
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();

		// Validate required fields
		if (!data.accountId || !data.description || !data.type || !data.splits?.length) {
			return NextResponse.json({ 
				error: "Account ID, description, type, and at least one split are required" 
			}, { status: 400 });
		}

		// Validate transaction type
		if (!["income", "expense", "transfer"].includes(data.type)) {
			return NextResponse.json({ 
				error: "Transaction type must be income, expense, or transfer" 
			}, { status: 400 });
		}

		// Create transaction
		const transaction = await TransactionDataService.createTransaction(session.user.id, {
			accountId: data.accountId,
			description: data.description,
			date: data.date ? new Date(data.date) : new Date(),
			type: data.type,
			splits: data.splits
		});

		return NextResponse.json({
			message: "Transaction created successfully",
			transaction
		}, { status: 201 });
	} catch (error) {
		console.error("Error creating financial transaction:", error);
		return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
	}
}