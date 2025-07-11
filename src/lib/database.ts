import { Pool } from "pg";

/**
 * Database Connection Utility
 *
 * This creates a connection pool to PostgreSQL that:
 * 1. Reuses connections for better performance
 * 2. Handles connection errors gracefully
 * 3. Provides a simple interface for queries
 */

// Create a connection pool (this is shared across your app)
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	// Connection pool settings
	max: 20, // Maximum number of connections
	idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
	connectionTimeoutMillis: 2000 // Timeout after 2 seconds of trying to connect
});

// Handle pool errors
pool.on("error", (err) => {
	console.error("Unexpected error on idle client", err);
	process.exit(-1);
});

/**
 * Execute a SQL query
 * @param text - SQL query string
 * @param params - Parameters for the query
 * @returns Query result
 */
export async function query(text: string, params?: unknown[]) {
	const start = Date.now();

	try {
		const res = await pool.query(text, params);
		const duration = Date.now() - start;

		// Log queries in development for debugging
		if (process.env.NODE_ENV === "development") {
			console.log("🗃️  Executed query", { text, duration, rows: res.rowCount });
		}

		return res;
	} catch (error) {
		console.error("❌ Database query error:", error);
		throw error;
	}
}

/**
 * Get a client from the pool for transactions
 * Use this when you need to run multiple queries as a single transaction
 */
export async function getClient() {
	return await pool.connect();
}

/**
 * Close all connections (useful for graceful shutdown)
 */
export async function end() {
	await pool.end();
}

export { pool };
