import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRepository } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      defaultCurrency,
      monthlyIncome,
      primaryGoals,
      selectedCategories,
      onboardingComplete
    } = await request.json();

    // Update user preferences
    await UserRepository.updateUserPreferences(session.user.id, {
      defaultCurrency: defaultCurrency || "AUD",
      monthlyIncome: monthlyIncome || null,
      primaryGoals: primaryGoals || [],
      selectedCategories: selectedCategories || [],
      onboardingComplete: onboardingComplete || false
    });

    return NextResponse.json({
      message: "Preferences updated successfully"
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await UserRepository.getUserPreferences(session.user.id);

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}