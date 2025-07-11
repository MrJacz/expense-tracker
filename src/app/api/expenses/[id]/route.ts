import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/database";

// PUT /api/expenses/[id] - Update an expense
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: expenseId } = await params;
		const { amount, description, category_id, date, time, notes } = await request.json();

		// Validate required fields
		if (!amount || !description || !category_id || !date) {
			return NextResponse.json({ error: "Amount, description, category, and date are required" }, { status: 400 });
		}

		if (amount <= 0) {
			return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
		}

		// Check if expense exists and belongs to user
		const expenseCheck = await query(`SELECT id FROM expenses WHERE id = $1 AND user_id = $2`, [expenseId, session.user.id]);

		if (expenseCheck.rows.length === 0) {
			return NextResponse.json({ error: "Expense not found" }, { status: 404 });
		}

		// Verify category exists
		const categoryCheck = await query(
			`SELECT id FROM categories
       WHERE id = $1 AND (is_default = true OR user_id = $2)`,
			[category_id, session.user.id]
		);

		if (categoryCheck.rows.length === 0) {
			return NextResponse.json({ error: "Invalid category" }, { status: 400 });
		}

		// Update the expense
		const result = await query(
			`UPDATE expenses
       SET amount = $1, description = $2, category_id = $3, date = $4, time = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING id, amount, description, date, time, notes, updated_at`,
			[amount, description, category_id, date, time || "12:00:00", notes, expenseId, session.user.id]
		);

		const updatedExpense = result.rows[0];

		// Get category info
		const categoryInfo = await query(`SELECT id, name, color, icon FROM categories WHERE id = $1`, [category_id]);

		return NextResponse.json({
			message: "Expense updated successfully",
			expense: {
				...updatedExpense,
				amount: parseFloat(updatedExpense.amount),
				category: categoryInfo.rows[0]
			}
		});
	} catch (error) {
		console.error("Error updating expense:", error);
		return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
	}
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: expenseId } = await params;

		// Check if expense exists and belongs to user
		const expenseCheck = await query(`SELECT id FROM expenses WHERE id = $1 AND user_id = $2`, [expenseId, session.user.id]);

		if (expenseCheck.rows.length === 0) {
			return NextResponse.json({ error: "Expense not found" }, { status: 404 });
		}

		// Delete the expense
		await query(`DELETE FROM expenses WHERE id = $1 AND user_id = $2`, [expenseId, session.user.id]);

		return NextResponse.json({
			message: "Expense deleted successfully"
		});
	} catch (error) {
		console.error("Error deleting expense:", error);
		return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
	}
}
