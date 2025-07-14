import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TransactionDataService } from "@/lib/database";

// PUT /api/expenses/[id] - Update an expense transaction
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: transactionId } = await params;
		const { accountId, description, splits, date, notes } = await request.json();

		// Validate required fields
		if (!accountId || !description || !splits?.length) {
			return NextResponse.json({ error: "Account ID, description, and at least one split are required" }, { status: 400 });
		}

		// Validate splits
		for (const split of splits) {
			if (!split.amount || split.amount <= 0) {
				return NextResponse.json({ error: "All splits must have amounts greater than 0" }, { status: 400 });
			}
			if (!split.categoryId) {
				return NextResponse.json({ error: "All splits must have a category" }, { status: 400 });
			}
		}

		// Update the transaction
		const transaction = await TransactionDataService.updateTransaction(session.user.id, transactionId, {
			accountId,
			description,
			date: date ? new Date(date) : undefined,
			notes,
			splits
		});

		if (!transaction) {
			return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Expense updated successfully",
			transaction
		});
	} catch (error) {
		console.error("Error updating expense:", error);
		return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
	}
}

// DELETE /api/expenses/[id] - Delete an expense transaction
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: transactionId } = await params;

		// Delete the transaction
		const success = await TransactionDataService.deleteTransaction(session.user.id, transactionId);

		if (!success) {
			return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Expense deleted successfully"
		});
	} catch (error) {
		console.error("Error deleting expense:", error);
		return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
	}
}
