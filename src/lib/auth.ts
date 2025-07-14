// lib/auth.ts - NextAuth Configuration with JWT Strategy

import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRepository } from "@/lib/database/index";

/**
 * NextAuth Configuration
 *
 * Uses JWT strategy for credentials authentication
 * Supports both OAuth and credentials authentication
 */
export const authOptions: NextAuthOptions = {
	// Note: adapter removed for JWT strategy with credentials provider
	// adapter: PrismaAdapter(prisma),

	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					// Use UserRepository to get user with credentials
					const user = await UserRepository.getUserByEmail(credentials.email);

					if (!user || !user.hasPassword) {
						return null;
					}

					// Verify password
					const isPasswordValid = await UserRepository.verifyPassword(user.id, credentials.password);

					if (!isPasswordValid) {
						return null;
					}

					return {
						id: user.id,
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
		// Add other providers here (Google, GitHub, etc.)
		// GoogleProvider({
		//   clientId: process.env.GOOGLE_CLIENT_ID!,
		//   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		// }),
	],

	callbacks: {
		async jwt({ token, user }) {
			// Initial sign in
			if (user) {
				token.id = user.id;
			}
			return token;
		},

		async session({ session, token }) {
			// Send properties to the client (JWT strategy)
			if (token) {
				session.user.id = token.id as string;
			}
			return session;
		},

		async signIn() {
			// Allow all sign ins for now
			return true;
		}
	},

	session: {
		strategy: "jwt", // Use JWT strategy for credentials provider compatibility
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60 // 24 hours
	},

	pages: {
		signIn: "/auth/login",
		newUser: "/getting-started"
		// signUp: "/auth/register",
		// error: "/auth/error",
	},

	events: {
		async signIn({ user, account }) {
			console.log(`User ${user.email} signed in via ${account?.provider}`);
		},

		async signOut() {
			console.log(`User signed out`);
		},

		async createUser({ user }) {
			console.log(`New user created: ${user.email}`);

			// Create user preferences for new users
			try {
				await UserRepository.updateUserPreferences(user.id, {
					defaultCurrency: "AUD",
					theme: "system"
				});
			} catch (error) {
				console.error("Error creating user preferences:", error);
			}
		}
	},

	debug: process.env.NODE_ENV === "development",
	secret: process.env.NEXTAUTH_SECRET
};

// TypeScript: Extend NextAuth types
declare module "next-auth" {
	interface Session {
		user: {
			id: string;
		} & DefaultSession["user"];
	}

	interface User {
		id: string;
		email: string;
		name?: string | null;
		image?: string | null;
		emailVerified?: Date | null;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
	}
}
