import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db";
import { userProfiles, dailyLogs } from "@/app/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { calculateDailyPoints } from "@/lib/calculations";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.clerkId, userId),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse query params for date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Fetch logs ordered by date descending
    let logs;
    if (startDate && endDate) {
      logs = await db.query.dailyLogs.findMany({
        where: eq(dailyLogs.userId, profile.id),
        orderBy: desc(dailyLogs.date),
      });
      // Filter by date range in JS (Drizzle date comparisons can be tricky)
      logs = logs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= new Date(startDate) && logDate <= new Date(endDate);
      });
    } else {
      logs = await db.query.dailyLogs.findMany({
        where: eq(dailyLogs.userId, profile.id),
        orderBy: desc(dailyLogs.date),
      });
    }

    // Calculate running totals (from oldest to newest)
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let runningTotal = 0;
    const logsWithRunningTotal = sortedLogs.map((log) => {
      runningTotal += log.totalPoints;
      return { ...log, runningTotal: Number(runningTotal.toFixed(3)) };
    });

    // Return in descending order (newest first)
    return NextResponse.json({
      logs: logsWithRunningTotal.reverse(),
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.clerkId, userId),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { date, caloriesConsumed, workoutCalories = 0, weight, notes } = body;

    // Calculate points
    const points = calculateDailyPoints({
      tdee: profile.tdee,
      caloriesConsumed,
      workoutCalories,
    });

    // Check if log for this date already exists
    const existingLog = await db.query.dailyLogs.findFirst({
      where: and(eq(dailyLogs.userId, profile.id), eq(dailyLogs.date, date)),
    });

    if (existingLog) {
      return NextResponse.json(
        { error: "Log for this date already exists. Use PATCH to update." },
        { status: 400 }
      );
    }

    // Create new log
    const [log] = await db
      .insert(dailyLogs)
      .values({
        userId: profile.id,
        date,
        caloriesConsumed,
        workoutCalories,
        weight,
        notes,
        dietPoints: points.dietPoints,
        workoutPoints: points.workoutPoints,
        totalPoints: points.totalPoints,
      })
      .returning();

    // Update current weight if provided
    if (weight) {
      await db
        .update(userProfiles)
        .set({ currentWeight: weight })
        .where(eq(userProfiles.id, profile.id));
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error("Error creating log:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.clerkId, userId),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { id, caloriesConsumed, workoutCalories, weight, notes } = body;

    // Recalculate points
    const points = calculateDailyPoints({
      tdee: profile.tdee,
      caloriesConsumed,
      workoutCalories: workoutCalories || 0,
    });

    const [updated] = await db
      .update(dailyLogs)
      .set({
        caloriesConsumed,
        workoutCalories: workoutCalories || 0,
        weight,
        notes,
        dietPoints: points.dietPoints,
        workoutPoints: points.workoutPoints,
        totalPoints: points.totalPoints,
      })
      .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, profile.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    // Update current weight if this is the most recent log
    if (weight) {
      const mostRecentLog = await db.query.dailyLogs.findFirst({
        where: eq(dailyLogs.userId, profile.id),
        orderBy: desc(dailyLogs.date),
      });

      if (mostRecentLog?.id === id) {
        await db
          .update(userProfiles)
          .set({ currentWeight: weight })
          .where(eq(userProfiles.id, profile.id));
      }
    }

    return NextResponse.json({ log: updated });
  } catch (error) {
    console.error("Error updating log:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.clerkId, userId),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Log ID required" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(dailyLogs)
      .where(and(eq(dailyLogs.id, Number(id)), eq(dailyLogs.userId, profile.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
