// This file creates the NextAuth API endpoints

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth Dynamic API Route
 *
 * This single file handles ALL authentication endpoints:
 * - /api/auth/signin (GET/POST) - Sign in page and handling
 * - /api/auth/signout (GET/POST) - Sign out
 * - /api/auth/callback/* - OAuth callbacks
 * - /api/auth/session (GET) - Get current session
 * - /api/auth/providers (GET) - List available providers
 * - /api/auth/csrf (GET) - CSRF token
 *
 * The [...nextauth] filename means this catches all routes under /api/auth/
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
