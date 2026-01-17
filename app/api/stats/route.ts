import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db";
import { userProfiles, dailyLogs } from "@/app/db/schema";
import { eq, sum, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  calculateTotalPointsNeeded,
  calculateTargetPointsPerDay,
  calculateCalorieStats,
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

    // Get total points collected and count of logged days
    const [pointsResult] = await db
      .select({ 
        total: sum(dailyLogs.totalPoints),
        loggedDays: count(dailyLogs.id),
      })
      .from(dailyLogs)
      .where(eq(dailyLogs.userId, profile.id));

    const pointsCollected = Number(pointsResult?.total || 0);
    const loggedDays = Number(pointsResult?.loggedDays || 0);
    
    // Calculate days elapsed from start date
    const startDate = new Date(profile.startDate);
    const now = new Date();
    // Set both to midnight for accurate day counting
    startDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const daysElapsed = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Determine mode: cutting, bulking, or maintenance
    const isMaintenance = profile.startingWeight === profile.goalWeight;
    const isCutting = !isMaintenance && profile.startingWeight > profile.goalWeight;
    const isBulking = !isMaintenance && profile.goalWeight > profile.startingWeight;
    const weightDiff = Math.abs(profile.startingWeight - profile.goalWeight);
    
    // Total points needed (always positive)
    const totalPointsNeeded = (weightDiff * 7700) / 1000;
    
    // For cutting: positive points = progress, for bulking: negative points (surplus) = progress
    // But we'll handle bulking differently - surplus creates "bulk points"
    const effectivePointsCollected = isCutting ? pointsCollected : -pointsCollected;
    
    const targetPointsPerDay = calculateTargetPointsPerDay(
      profile.tdee,
      profile.targetCalories
    );
    
    // Use loggedDays for average, not elapsed days
    const actualAvgPointsPerDay = loggedDays > 0 ? pointsCollected / loggedDays : 0;
    
    // Calculate pace difference
    const targetAvgForPace = isCutting ? targetPointsPerDay : -targetPointsPerDay;
    const paceDifference = targetAvgForPace !== 0 
      ? ((actualAvgPointsPerDay - targetAvgForPace) / Math.abs(targetAvgForPace)) * 100 
      : 0;
    const onTrack = isCutting 
      ? actualAvgPointsPerDay >= targetPointsPerDay 
      : actualAvgPointsPerDay <= targetPointsPerDay; // For bulking, we want surplus
    
    // Projected completion
    let projectedCompletionDate: string | null = null;
    let daysToGoal: number | null = null;
    
    if (loggedDays > 0 && actualAvgPointsPerDay !== 0) {
      const pointsRemaining = totalPointsNeeded - Math.abs(effectivePointsCollected);
      if (pointsRemaining > 0) {
        daysToGoal = Math.ceil(pointsRemaining / Math.abs(actualAvgPointsPerDay));
        const projected = new Date();
        projected.setDate(projected.getDate() + daysToGoal);
        projectedCompletionDate = projected.toISOString().split("T")[0];
      }
    }
    
    // Weight change calculation
    const actualWeightChange = profile.startingWeight - profile.currentWeight;
    const weightChangeDisplay = {
      value: Math.abs(actualWeightChange),
      direction: actualWeightChange > 0 ? "lost" : actualWeightChange < 0 ? "gained" : "unchanged",
    };
    
    // Weight remaining
    const weightRemaining = isCutting 
      ? Math.max(0, profile.currentWeight - profile.goalWeight)
      : Math.max(0, profile.goalWeight - profile.currentWeight);
    
    // Progress based on actual weight change vs goal
    const progressPercent = weightDiff > 0 
      ? Math.min(100, Math.max(0, (Math.abs(actualWeightChange) / weightDiff) * 100))
      : 0;
    
    // Calorie stats  
    const calorieStats = calculateCalorieStats({
      tdee: profile.tdee,
      targetCalories: profile.targetCalories,
      startingWeight: profile.startingWeight,
      goalWeight: profile.goalWeight,
      pointsCollected,
    });

    return NextResponse.json({
      mode: isMaintenance ? "maintenance" : isCutting ? "cutting" : "bulking",
      summary: {
        startDate: profile.startDate,
        daysElapsed,
        daysLogged: loggedDays,
        startingWeight: profile.startingWeight,
        goalWeight: profile.goalWeight,
        currentWeight: profile.currentWeight,
        weightChange: weightChangeDisplay,
        weightRemaining: Number(weightRemaining.toFixed(2)),
        progressPercent: Number(progressPercent.toFixed(1)),
      },
      points: {
        totalNeeded: Number(totalPointsNeeded.toFixed(2)),
        collected: Number(pointsCollected.toFixed(2)),
        remaining: Number(Math.max(0, totalPointsNeeded - Math.abs(effectivePointsCollected)).toFixed(2)),
        progressPercent: Number(Math.min(100, (Math.abs(effectivePointsCollected) / totalPointsNeeded) * 100).toFixed(1)),
      },
      pace: {
        targetPointsPerDay: Number(Math.abs(targetPointsPerDay).toFixed(3)),
        actualAvgPointsPerDay: Number(actualAvgPointsPerDay.toFixed(3)),
        daysToGoal,
        projectedCompletionDate,
        onTrack,
        paceDifferencePercent: Number(paceDifference.toFixed(1)),
      },
      calories: {
        ...calorieStats,
        avgDailyDeficit: loggedDays > 0
          ? Math.round(calorieStats.deficitCreated / loggedDays)
          : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
