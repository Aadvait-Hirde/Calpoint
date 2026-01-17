import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db";
import { userProfiles, dailyLogs } from "@/app/db/schema";
import { eq, asc } from "drizzle-orm";
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
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch all logs ordered by date ascending
    const logs = await db.query.dailyLogs.findMany({
      where: eq(dailyLogs.userId, profile.id),
      orderBy: asc(dailyLogs.date),
    });

    if (logs.length === 0) {
      return NextResponse.json({ 
        progressData: [],
        weightData: [],
        dailyPointsData: [],
        weeklyData: [],
        pointsBreakdown: { diet: 0, workout: 0 },
        heatmapData: [],
      });
    }

    // Calculate target points per day for trajectory
    const targetPointsPerDay = (profile.tdee - profile.targetCalories) / 1000;
    const totalPointsNeeded = (Math.abs(profile.startingWeight - profile.goalWeight) * 7700) / 1000;

    // Build data for charts
    let cumulativePoints = 0;
    let cumulativeTarget = 0;
    let totalDietPoints = 0;
    let totalWorkoutPoints = 0;

    const progressData: { date: string; actual: number; target: number }[] = [];
    const weightData: { date: string; weight: number | null; goal: number }[] = [];
    const dailyPointsData: { date: string; points: number; target: number }[] = [];
    const heatmapData: { date: string; points: number; level: number }[] = [];

    // Group by week for weekly averages
    const weeklyMap = new Map<string, { total: number; count: number }>();

    logs.forEach((log, index) => {
      cumulativePoints += log.totalPoints;
      cumulativeTarget = (index + 1) * targetPointsPerDay;
      totalDietPoints += log.dietPoints;
      totalWorkoutPoints += log.workoutPoints;

      // Progress chart
      progressData.push({
        date: log.date,
        actual: Number(cumulativePoints.toFixed(2)),
        target: Number(cumulativeTarget.toFixed(2)),
      });

      // Weight chart (only if weight logged)
      if (log.weight) {
        weightData.push({
          date: log.date,
          weight: log.weight,
          goal: profile.goalWeight,
        });
      }

      // Daily points bar chart
      dailyPointsData.push({
        date: log.date,
        points: Number(log.totalPoints.toFixed(2)),
        target: Number(targetPointsPerDay.toFixed(2)),
      });

      // Heatmap data
      let level = 0;
      if (log.totalPoints >= 0.7) level = 4; // Great
      else if (log.totalPoints >= 0.4) level = 3; // Good
      else if (log.totalPoints >= 0) level = 2; // Maintenance
      else if (log.totalPoints >= -0.4) level = 1; // Slight surplus
      else level = 0; // Surplus

      heatmapData.push({
        date: log.date,
        points: Number(log.totalPoints.toFixed(2)),
        level,
      });

      // Weekly grouping
      const logDate = new Date(log.date);
      const weekStart = new Date(logDate);
      weekStart.setDate(logDate.getDate() - logDate.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      
      const existing = weeklyMap.get(weekKey) || { total: 0, count: 0 };
      weeklyMap.set(weekKey, {
        total: existing.total + log.totalPoints,
        count: existing.count + 1,
      });
    });

    // Weekly data
    const weeklyData = Array.from(weeklyMap.entries()).map(([week, { total, count }]) => ({
      week,
      avgPoints: Number((total / count).toFixed(2)),
      onTrack: total / count >= targetPointsPerDay,
    }));

    // Cumulative deficit data
    const deficitData = logs.map((log, index) => {
      const cumulative = logs.slice(0, index + 1).reduce((sum, l) => sum + l.totalPoints * 1000, 0);
      return {
        date: log.date,
        deficit: Math.round(cumulative),
        target: Math.round((index + 1) * targetPointsPerDay * 1000),
      };
    });

    return NextResponse.json({
      progressData,
      weightData,
      dailyPointsData,
      deficitData,
      weeklyData,
      heatmapData,
      pointsBreakdown: {
        diet: Number(totalDietPoints.toFixed(2)),
        workout: Number(totalWorkoutPoints.toFixed(2)),
      },
      summary: {
        totalPointsNeeded,
        targetPointsPerDay: Number(targetPointsPerDay.toFixed(3)),
        goalWeight: profile.goalWeight,
      },
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
