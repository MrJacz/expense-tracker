import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/database";
import { Expense } from "@/types/expense";

// Type for the SQL query result (expense + category join)
interface ExpenseQueryResult {
	id: string;
	amount: string;
	description: string;
	date: string;
	time: string;
	notes: string;
	created_at: string;
	updated_at: string;
	category_id: string;
	category_name: string;
	category_color: string;
	category_icon: string;
}

// GET /api/expenses - Get all expenses for the authenticated user
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category");
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const search = searchParams.get("search");

		// Build dynamic query
		let queryText = `
      SELECT
        e.id,
        e.amount,
        e.description,
        e.date,
        e.time,
        e.notes,
        e.created_at,
        e.updated_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = $1
    `;

		const queryParams: unknown[] = [session.user.id];
		let paramCount = 1;

		// Add filters
		if (category) {
			paramCount++;
			queryText += ` AND c.id = $${paramCount}`;
			queryParams.push(category);
		}

		if (startDate) {
			paramCount++;
			queryText += ` AND e.date >= $${paramCount}`;
			queryParams.push(startDate);
		}

		if (endDate) {
			paramCount++;
			queryText += ` AND e.date <= $${paramCount}`;
			queryParams.push(endDate);
		}

		if (search) {
			paramCount++;
			queryText += ` AND (e.description ILIKE $${paramCount} OR e.notes ILIKE $${paramCount})`;
			queryParams.push(`%${search}%`);
		}

		queryText += ` ORDER BY e.date DESC, e.created_at DESC`;

		const result = await query(queryText, queryParams);

		// Transform the data to include category info
		const expenses: Expense[] = result.rows.map((row: ExpenseQueryResult) => ({
			id: row.id,
			amount: parseFloat(row.amount),
			description: row.description,
			date: row.date,
			time: row.time,
			notes: row.notes,
			created_at: row.created_at,
			updated_at: row.updated_at,
			category: {
				id: row.category_id,
				name: row.category_name,
				color: row.category_color,
				icon: row.category_icon
			}
		}));

		return NextResponse.json({ expenses });
	} catch (error) {
		console.error("Error fetching expenses:", error);
		return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
	}
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { amount, description, category_id, date, time, notes } = await request.json();

		// Validate required fields
		if (!amount || !description || !category_id || !date) {
			return NextResponse.json({ error: "Amount, description, category, and date are required" }, { status: 400 });
		}

		if (amount <= 0) {
			return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
		}

		// Verify category exists and user has access to it
		const categoryCheck = await query(
			`SELECT id FROM categories
       WHERE id = $1 AND (is_default = true OR user_id = $2)`,
			[category_id, session.user.id]
		);

		if (categoryCheck.rows.length === 0) {
			return NextResponse.json({ error: "Invalid category" }, { status: 400 });
		}

		// Create the expense
		const result = await query(
			`INSERT INTO expenses (user_id, category_id, amount, description, date, time, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, amount, description, date, time, notes, created_at`,
			[session.user.id, category_id, amount, description, date, time || "12:00:00", notes]
		);

		const newExpense = result.rows[0];

		// Get the category info for the response
		const categoryInfo = await query(`SELECT id, name, color, icon FROM categories WHERE id = $1`, [category_id]);

		return NextResponse.json(
			{
				message: "Expense created successfully",
				expense: {
					...newExpense,
					amount: parseFloat(newExpense.amount),
					category: categoryInfo.rows[0]
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating expense:", error);
		return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
	}
}
