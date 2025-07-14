import { NextRequest, NextResponse } from "next/server";
import { UserDataService } from "@/lib/database";

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
		const existingUser = await UserDataService.getUserByEmail(email);

		if (existingUser) {
			return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
		}

		// Create user with password
		const newUser = await UserDataService.createUserWithPassword(email, password, name);

		return NextResponse.json({
			message: "User created successfully",
			user: {
				id: newUser.id,
				email: newUser.email,
				name: newUser.name
			}
		});
	} catch (error) {
		console.error("Registration error:", error);
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
	}
}
