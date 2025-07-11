// lib/auth.ts - Simplified NextAuth Configuration

import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";
import bcryptjs from "bcryptjs";
import { query } from "./database";

/**
 * NextAuth Configuration Explained:
 *
 * NextAuth is like a security guard for your app that:
 * 1. **Adapter**: Stores user sessions in your PostgreSQL database
 * 2. **Providers**: Handles different login methods (email/password, Google, etc.)
 * 3. **Callbacks**: Customizes what data gets stored in sessions
 * 4. **Security**: Handles all the complex security stuff automatically
 */

// Create connection pool for NextAuth
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

export const authOptions: NextAuthOptions = {
	// Connect NextAuth to our PostgreSQL database
	adapter: PostgresAdapter(pool),

	// How users can sign in
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" }
			},

			// This function runs when someone tries to log in
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					// Look up user and their password
					const userResult = await query(
						`
            SELECT u.id, u.email, u.name, u."emailVerified", u.image, uc.password_hash
            FROM users u
            JOIN user_credentials uc ON u.id = uc.user_id
            WHERE u.email = $1
          `,
						[credentials.email]
					);

					if (userResult.rows.length === 0) {
						return null; // No user found
					}

					const user = userResult.rows[0];

					// Check if password is correct
					const isPasswordValid = await bcryptjs.compare(credentials.password, user.password_hash);

					if (!isPasswordValid) {
						return null; // Wrong password
					}

					// Return user data (NextAuth will handle the session)
					return {
						id: user.id.toString(),
						email: user.email,
						name: user.name,
						emailVerified: user.emailVerified,
						image: user.image
					};
				} catch (error) {
					console.error("Login error:", error);
					return null;
				}
			}
		})
	],

	// Customize what data goes into the session
	callbacks: {
		async session({ session, user }) {
			// Add user ID to session so we can use it in our app
			if (session.user && user) {
				session.user.id = user.id;
			}
			return session;
		}
	},

	// Session settings
	session: {
		strategy: "database", // Store sessions in database (more secure than JWT)
		maxAge: 30 * 24 * 60 * 60 // 30 days
	},

	// Required for security
	secret: process.env.NEXTAUTH_SECRET
};

// TypeScript: Tell NextAuth what our session looks like
declare module "next-auth" {
	interface Session {
		user: {
			id: string;
		} & DefaultSession["user"];
	}
}
