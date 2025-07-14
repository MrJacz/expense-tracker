import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";

// GET /api/categories - Get all available categories for user
export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get both default categories and user's custom categories
		const categories = await prisma.category.findMany({
			where: {
				OR: [
					{ isDefault: true },
					{ userId: session.user.id }
				]
			},
			select: {
				id: true,
				name: true,
				isDefault: true,
				parentCategoryId: true,
				budgetClassification: true
			},
			orderBy: [
				{ isDefault: "desc" }, // Default categories first
				{ name: "asc" }
			]
		});

		// Transform to match expected format
		const formattedCategories = categories.map(category => ({
			id: category.id,
			name: category.name,
			color: null, // Not available in schema
			icon: null, // Not available in schema
			is_default: category.isDefault,
			description: null, // Not available in schema
			parent_category_id: category.parentCategoryId,
			budget_classification: category.budgetClassification
		}));

		return NextResponse.json({ categories: formattedCategories });
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
	}
}
