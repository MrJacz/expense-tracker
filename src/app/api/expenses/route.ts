import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TransactionDataService } from "@/lib/database";

// GET /api/expenses - Get filtered expenses for the authenticated user
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);

		// Extract filters and convert to TransactionDataService format
		const filters = {
			categoryId: searchParams.get("categoryId") || undefined,
			type: "expense" as const,
			startDate: searchParams.get("startDate") || undefined,
			endDate: searchParams.get("endDate") || undefined,
			search: searchParams.get("search") || undefined,
			page: parseInt(searchParams.get("page") || "1"),
			limit: parseInt(searchParams.get("limit") || "50"),
			sortBy: (searchParams.get("sortBy") || "date") as "date" | "description",
			sortOrder: (searchParams.get("sortOrder") || "desc") as "asc" | "desc"
		};

		// Use TransactionDataService to get transactions
		const result = await TransactionDataService.getTransactions(session.user.id, filters);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching expenses:", error);
		return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
	}
}

// POST /api/expenses - Create a new expense transaction
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();

		// Validate required fields
		if (!data.accountId || !data.description || !data.splits?.length) {
			return NextResponse.json({ 
				error: "Account ID, description, and at least one split are required" 
			}, { status: 400 });
		}

		// Create transaction
		const transaction = await TransactionDataService.createTransaction(session.user.id, {
			accountId: data.accountId,
			description: data.description,
			date: data.date ? new Date(data.date) : new Date(),
			type: "expense",
			splits: data.splits
		});

		return NextResponse.json({
			message: "Expense created successfully",
			transaction
		}, { status: 201 });
	} catch (error) {
		console.error("Error creating expense:", error);
		return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
	}
}