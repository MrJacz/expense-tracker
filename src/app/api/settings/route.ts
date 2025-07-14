import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const settings = await prisma.userPreferences.findUnique({
			where: { userId: session.user.id }
		});

		return NextResponse.json({
			settings: settings || {
				defaultCurrency: "AUD",
				theme: "light",
				dateFormat: "dd/MM/yyyy",
				timeFormat: "24h"
			}
		});
	} catch (error) {
		console.error("Error fetching user settings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch settings" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const updates = await request.json();

		const settings = await prisma.userPreferences.upsert({
			where: { userId: session.user.id },
			update: updates,
			create: {
				userId: session.user.id,
				...updates
			}
		});

		return NextResponse.json({ settings });
	} catch (error) {
		console.error("Error updating user settings:", error);
		return NextResponse.json(
			{ error: "Failed to update settings" },
			{ status: 500 }
		);
	}
}