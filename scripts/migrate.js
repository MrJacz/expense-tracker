/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require("pg");
const { readdirSync, readFileSync } = require("fs");
const { join } = require("path");
const { setup } = require("@skyra/env-utilities");

setup(join(__dirname, "../.env"));
/**
 * Simple Migration System
 *
 * This script:
 * 1. Creates a migrations table to track what's been run
 * 2. Runs any new migration files in order
 * 3. Keeps track of what's been applied
 */

// Database connection using environment variables

if (!process.env.DATABASE_URL) {
	console.error("DATABASE_URL environment variable is not set!");
	process.exit(1);
}

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

async function createMigrationsTable() {
	console.log("Creating migrations table if it doesn't exist...");

	await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) UNIQUE NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function getAppliedMigrations() {
	console.log("Checking which migrations have already been applied...");

	const result = await pool.query("SELECT filename FROM migrations ORDER BY id");
	return result.rows.map((row) => row.filename);
}

async function runMigration(filename, sqlContent) {
	console.log(`Running migration: ${filename}`);

	const client = await pool.connect();

	try {
		// Start transaction - if anything fails, we rollback everything
		await client.query("BEGIN");

		// Run the migration SQL
		await client.query(sqlContent);

		// Record that we ran this migration
		await client.query("INSERT INTO migrations (filename) VALUES ($1)", [filename]);

		// Commit the transaction
		await client.query("COMMIT");

		console.log(`Migration ${filename} completed successfully`);
	} catch (error) {
		// If anything failed, rollback
		await client.query("ROLLBACK");
		console.error(`Migration ${filename} failed:`, error.message);
		throw error;
	} finally {
		client.release();
	}
}

async function runMigrations() {
	try {
		console.log("Starting database migrations...\n");

		// Step 1: Make sure we have a migrations table
		await createMigrationsTable();

		// Step 2: Get list of already applied migrations
		const appliedMigrations = await getAppliedMigrations();

		// Step 3: Get all migration files
		const migrationsDir = join(__dirname, "../database");
		const migrationFiles = readdirSync(migrationsDir)
			.filter((file) => file.endsWith(".sql"))
			.sort(); // Run in alphabetical order

		console.log(`Found ${migrationFiles.length} migration files`);
		console.log(`${appliedMigrations.length} migrations already applied\n`);

		// Step 4: Run any new migrations
		for (const filename of migrationFiles) {
			if (!appliedMigrations.includes(filename)) {
				const sqlContent = readFileSync(join(migrationsDir, filename), "utf-8");
				await runMigration(filename, sqlContent);
			} else {
				console.log(`Skipping ${filename} (already applied)`);
			}
		}

		console.log("\nAll migrations completed successfully!");
	} catch (error) {
		console.error("Migration failed:", error.message);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

runMigrations();
