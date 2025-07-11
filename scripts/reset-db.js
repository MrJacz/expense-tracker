/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require("pg");
const { setup } = require("@skyra/env-utilities");
const { join } = require("path");

setup(join(__dirname, "../.env"));

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

async function resetDatabase() {
	try {
		console.log("Resetting database...\n");

		// Drop all tables
		const tables = ["expenses", "categories", "user_credentials", "verification_tokens", "sessions", "accounts", "users", "migrations"];

		for (const table of tables) {
			try {
				await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
				console.log(`Dropped table: ${table}`);
			} catch (error) {
				console.log(`Table ${table} did not exist or could not be dropped`, error);
			}
		}

		console.log("\nDatabase reset completed successfully!");
	} catch (error) {
		console.error("Database reset failed:", error.message);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

resetDatabase();
