import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db";
import { userProfiles, dailyLogs } from "@/app/db/schema";
import { eq, sum } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  calculateTotalPointsNeeded,
  calculateDaysElapsed,
  calculateTargetPointsPerDay,
  calculateAveragePointsPerDay,
  calculateProjectedCompletion,
  isOnTrack,
  calculatePaceDifference,
  calculateCalorieStats,
  calculateWeightLost,
} from "@/lib/calculations";

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
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get total points collected
    const [pointsResult] = await db
      .select({ total: sum(dailyLogs.totalPoints) })
      .from(dailyLogs)
      .where(eq(dailyLogs.userId, profile.id));

    const pointsCollected = Number(pointsResult?.total || 0);
    
    // Calculate all stats
    const startDate = new Date(profile.startDate);
    const daysElapsed = calculateDaysElapsed(startDate);
    const totalPointsNeeded = calculateTotalPointsNeeded({
      startingWeight: profile.startingWeight,
      goalWeight: profile.goalWeight,
    });
    const targetPointsPerDay = calculateTargetPointsPerDay(
      profile.tdee,
      profile.targetCalories
    );
    const actualAvgPointsPerDay = calculateAveragePointsPerDay(pointsCollected, daysElapsed);
    const projectedCompletion = calculateProjectedCompletion({
      startDate,
      pointsCollected,
      totalPointsNeeded,
    });
    const onTrack = isOnTrack(actualAvgPointsPerDay, targetPointsPerDay);
    const paceDifference = calculatePaceDifference(actualAvgPointsPerDay, targetPointsPerDay);
    const calorieStats = calculateCalorieStats({
      tdee: profile.tdee,
      targetCalories: profile.targetCalories,
      startingWeight: profile.startingWeight,
      goalWeight: profile.goalWeight,
      pointsCollected,
    });

    // Summary section
    const weightLost = calculateWeightLost(pointsCollected);
    const weightRemaining = profile.startingWeight - profile.goalWeight - weightLost;
    const progressPercent = (pointsCollected / totalPointsNeeded) * 100;

    return NextResponse.json({
      summary: {
        startDate: profile.startDate,
        daysElapsed,
        startingWeight: profile.startingWeight,
        goalWeight: profile.goalWeight,
        currentWeight: profile.currentWeight,
        weightLost: Number(weightLost.toFixed(2)),
        weightRemaining: Number(Math.max(0, weightRemaining).toFixed(2)),
        progressPercent: Number(Math.min(100, progressPercent).toFixed(1)),
      },
      points: {
        totalNeeded: Number(totalPointsNeeded.toFixed(2)),
        collected: Number(pointsCollected.toFixed(2)),
        remaining: Number(Math.max(0, totalPointsNeeded - pointsCollected).toFixed(2)),
        progressPercent: Number(Math.min(100, progressPercent).toFixed(1)),
      },
      pace: {
        targetPointsPerDay: Number(targetPointsPerDay.toFixed(3)),
        actualAvgPointsPerDay: Number(actualAvgPointsPerDay.toFixed(3)),
        daysToGoal: actualAvgPointsPerDay > 0
          ? Math.ceil((totalPointsNeeded - pointsCollected) / actualAvgPointsPerDay)
          : null,
        projectedCompletionDate: projectedCompletion?.toISOString().split("T")[0] || null,
        onTrack,
        paceDifferencePercent: Number(paceDifference.toFixed(1)),
      },
      calories: {
        ...calorieStats,
        avgDailyDeficit: daysElapsed > 0
          ? Math.round(calorieStats.deficitCreated / daysElapsed)
          : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
