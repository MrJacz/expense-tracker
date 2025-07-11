// Separate registration endpoint (since NextAuth credentials don't handle registration)

import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { query } from "@/lib/database";

export async function POST(request: NextRequest) {
	try {
		const { email, password, name } = await request.json();

		// Validate input
		if (!email || !password || !name) {
			return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
		}

		if (password.length < 6) {
			return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
		}

		// Check if user already exists
		const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);

		if (existingUser.rows.length > 0) {
			return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
		}

		// Hash password
		const hashedPassword = await bcryptjs.hash(password, 12);

		// Create user
		const newUser = await query(
			`
      INSERT INTO users (email, name, "emailVerified")
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, email, name
    `,
			[email, name]
		);

		const userId = newUser.rows[0].id;

		// Store password
		await query(
			`
      INSERT INTO user_credentials (user_id, password_hash)
      VALUES ($1, $2)
    `,
			[userId, hashedPassword]
		);

		return NextResponse.json({
			message: "User created successfully",
			user: {
				id: userId,
				email: email,
				name: name
			}
		});
	} catch (error) {
		console.error("Registration error:", error);
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
	}
}
