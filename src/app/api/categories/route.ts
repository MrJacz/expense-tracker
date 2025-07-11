import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/database";

// GET /api/categories - Get all available categories for user
export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get both default categories and user's custom categories
		const result = await query(
			`SELECT id, name, color, icon, is_default
       FROM categories
       WHERE is_default = true OR user_id = $1
       ORDER BY is_default DESC, name ASC`,
			[session.user.id]
		);

		return NextResponse.json({ categories: result.rows });
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
	}
}
