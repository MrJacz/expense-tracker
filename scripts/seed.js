/* eslint-disable @typescript-eslint/no-require-imports */
// Updated seed script for NextAuth setup

const { Pool } = require("pg");
const { hash } = require("bcryptjs");
const { setup } = require("@skyra/env-utilities");
const { join } = require("path");

setup(join(__dirname, "../.env"));
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

// Default categories (same as before)
const defaultCategories = [
	{ name: "Food & Dining", color: "#ef4444", icon: "🍔" },
	{ name: "Transportation", color: "#3b82f6", icon: "🚗" },
	{ name: "Shopping", color: "#8b5cf6", icon: "🛍️" },
	{ name: "Entertainment", color: "#f59e0b", icon: "🎬" },
	{ name: "Bills & Utilities", color: "#10b981", icon: "💡" },
	{ name: "Healthcare", color: "#ec4899", icon: "🏥" },
	{ name: "Education", color: "#6366f1", icon: "📚" },
	{ name: "Travel", color: "#06b6d4", icon: "✈️" },
	{ name: "Personal Care", color: "#84cc16", icon: "💄" },
	{ name: "Home & Garden", color: "#f97316", icon: "🏠" },
	{ name: "Gifts & Donations", color: "#e11d48", icon: "🎁" },
	{ name: "Other", color: "#6b7280", icon: "📄" }
];

async function seedDefaultCategories() {
	console.log("Seeding default categories...");

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		const existingCategories = await client.query("SELECT COUNT(*) as count FROM categories WHERE is_default = true");

		if (existingCategories.rows[0].count > 0) {
			console.log("Default categories already exist, skipping...");
			await client.query("ROLLBACK");
			return;
		}

		for (const category of defaultCategories) {
			await client.query(
				`
                INSERT INTO categories (name, color, icon, is_default, user_id)
                VALUES ($1, $2, $3, true, NULL)
                ON CONFLICT (name, user_id) DO NOTHING
            `,
				[category.name, category.color, category.icon]
			);

			console.log(`Added category: ${category.icon} ${category.name}`);
		}

		await client.query("COMMIT");
		console.log("Default categories seeded successfully!");
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Failed to seed categories:", error.message);
		throw error;
	} finally {
		client.release();
	}
}

async function seedTestUser() {
	console.log("Creating test user for development...");

	if (process.env.NODE_ENV === "production") {
		console.log("Skipping test user creation in production");
		return;
	}

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		// Check if test user already exists
		const existingUser = await client.query("SELECT id FROM users WHERE email = $1", ["test@example.com"]);

		if (existingUser.rows.length > 0) {
			console.log("Test user already exists, skipping...");
			await client.query("ROLLBACK");
			return;
		}

		// Create test user (NextAuth format)
		const userResult = await client.query(
			`
            INSERT INTO users (email, name, "emailVerified")
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            RETURNING id
        `,
			["test@example.com", "Test User"]
		);

		const userId = userResult.rows[0].id;

		// Create password for credentials login
		const hashedPassword = await hash("password123", 12);
		await client.query(
			`
            INSERT INTO user_credentials (user_id, password_hash)
            VALUES ($1, $2)
        `,
			[userId, hashedPassword]
		);

		// Add sample expenses
		const sampleExpenses = [
			{ amount: 12.5, description: "Lunch at cafe", category: "Food & Dining", daysAgo: 0 },
			{ amount: 45.0, description: "Gas for car", category: "Transportation", daysAgo: 1 },
			{ amount: 25.99, description: "Movie tickets", category: "Entertainment", daysAgo: 2 },
			{ amount: 89.99, description: "Grocery shopping", category: "Food & Dining", daysAgo: 3 },
			{ amount: 150.0, description: "Electric bill", category: "Bills & Utilities", daysAgo: 5 }
		];

		for (const expense of sampleExpenses) {
			const categoryResult = await client.query("SELECT id FROM categories WHERE name = $1 AND is_default = true", [expense.category]);

			if (categoryResult.rows.length > 0) {
				const expenseDate = new Date();
				expenseDate.setDate(expenseDate.getDate() - expense.daysAgo);

				await client.query(
					`
                    INSERT INTO expenses (user_id, category_id, amount, description, date)
                    VALUES ($1, $2, $3, $4, $5)
                `,
					[userId, categoryResult.rows[0].id, expense.amount, expense.description, expenseDate.toISOString().split("T")[0]]
				);

				console.log(`Added expense: $${expense.amount} - ${expense.description}`);
			}
		}

		await client.query("COMMIT");
		console.log("Test user and sample data created successfully!");
		console.log("Email: test@example.com");
		console.log("Password: password123");
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Failed to create test user:", error.message);
		throw error;
	} finally {
		client.release();
	}
}

async function runSeeds() {
	try {
		console.log("Starting database seeding with NextAuth...\n");

		await seedDefaultCategories();
		console.log("");

		await seedTestUser();

		console.log("\nDatabase seeding completed successfully!");
	} catch (error) {
		console.error("Seeding failed:", error.message);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

runSeeds();
