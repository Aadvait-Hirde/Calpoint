import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db";
import { userProfiles } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.clerkId, userId),
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      heightCm,
      age,
      sex,
      startingWeight,
      goalWeight,
      currentWeight,
      tdee,
      targetCalories,
      startDate,
    } = body;

    // Check if profile already exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.clerkId, userId),
    });

    if (existingProfile) {
      // Update existing profile
      const [updated] = await db
        .update(userProfiles)
        .set({
          heightCm,
          age,
          sex,
          startingWeight,
          goalWeight,
          currentWeight,
          tdee,
          targetCalories,
          startDate,
        })
        .where(eq(userProfiles.clerkId, userId))
        .returning();

      return NextResponse.json({ profile: updated });
    }

    // Create new profile
    const [profile] = await db
      .insert(userProfiles)
      .values({
        clerkId: userId,
        heightCm,
        age,
        sex,
        startingWeight,
        goalWeight,
        currentWeight,
        tdee,
        targetCalories,
        startDate,
      })
      .returning();

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
