import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/database";

// GET /api/expenses - Get filtered expenses for the authenticated user
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);

		// Extract all possible filters
		const filters = {
			categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
			startDate: searchParams.get("startDate"),
			endDate: searchParams.get("endDate"),
			search: searchParams.get("search"),
			minAmount: searchParams.get("minAmount"),
			maxAmount: searchParams.get("maxAmount"),
			sortBy: searchParams.get("sortBy") || "date", // date, amount, description
			sortOrder: searchParams.get("sortOrder") || "desc", // asc, desc
			limit: parseInt(searchParams.get("limit") || "100"),
			offset: parseInt(searchParams.get("offset") || "0")
		};

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
        c.icon as category_icon,
        COUNT(*) OVER() as total_count
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = $1
    `;

		const queryParams: unknown[] = [session.user.id];
		let paramCount = 1;

		// Category filtering (multiple categories)
		if (filters.categories.length > 0) {
			paramCount++;
			const categoryIds = filters.categories.map((id) => parseInt(id)).filter((id) => !isNaN(id));
			if (categoryIds.length > 0) {
				queryText += ` AND c.id = ANY($${paramCount}::int[])`;
				queryParams.push(categoryIds);
			}
		}

		// Date range filtering
		if (filters.startDate) {
			paramCount++;
			queryText += ` AND e.date >= $${paramCount}`;
			queryParams.push(filters.startDate);
		}

		if (filters.endDate) {
			paramCount++;
			queryText += ` AND e.date <= $${paramCount}`;
			queryParams.push(filters.endDate);
		}

		// Amount range filtering
		if (filters.minAmount) {
			paramCount++;
			queryText += ` AND e.amount >= $${paramCount}`;
			queryParams.push(parseFloat(filters.minAmount));
		}

		if (filters.maxAmount) {
			paramCount++;
			queryText += ` AND e.amount <= $${paramCount}`;
			queryParams.push(parseFloat(filters.maxAmount));
		}

		// Text search (description and notes)
		if (filters.search) {
			paramCount++;
			queryText += ` AND (
        e.description ILIKE $${paramCount} OR
        e.notes ILIKE $${paramCount} OR
        c.name ILIKE $${paramCount}
      )`;
			queryParams.push(`%${filters.search}%`);
		}

		// Sorting
		const validSortFields = {
			date: "e.date",
			amount: "e.amount",
			description: "e.description",
			category: "c.name",
			created: "e.created_at"
		};

		const sortField = validSortFields[filters.sortBy as keyof typeof validSortFields] || "e.date";
		const sortOrder = filters.sortOrder === "asc" ? "ASC" : "DESC";

		queryText += ` ORDER BY ${sortField} ${sortOrder}, e.created_at DESC`;

		// Pagination
		queryText += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
		queryParams.push(filters.limit, filters.offset);

		const result = await query(queryText, queryParams);

		// Transform the data
		const expenses = result.rows.map((row) => ({
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

		// Get total count (for pagination)
		const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

		// Calculate summary stats for the filtered data
		// TODO: Implement complex filtering for stats query

		// Simplified stats query for now
		const simpleStatsQuery = `
      SELECT
        COUNT(*) as total_expenses,
        COALESCE(SUM(e.amount), 0) as total_amount,
        COALESCE(AVG(e.amount), 0) as avg_amount,
        COUNT(DISTINCT e.category_id) as unique_categories
      FROM expenses e
      WHERE e.user_id = $1
    `;

		const statsResult = await query(simpleStatsQuery, [session.user.id]);
		const stats = statsResult.rows[0];

		return NextResponse.json({
			expenses,
			pagination: {
				total: totalCount,
				limit: filters.limit,
				offset: filters.offset,
				hasMore: filters.offset + filters.limit < totalCount
			},
			summary: {
				totalExpenses: parseInt(stats.total_expenses),
				totalAmount: parseFloat(stats.total_amount),
				avgAmount: parseFloat(stats.avg_amount),
				uniqueCategories: parseInt(stats.unique_categories)
			},
			filters: filters // Return applied filters for debugging
		});
	} catch (error) {
		console.error("Error fetching expenses:", error);
		return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
	}
}

// POST endpoint remains the same
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
