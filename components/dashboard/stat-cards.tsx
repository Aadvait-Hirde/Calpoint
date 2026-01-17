"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Stats } from "./types";

interface StatCardsProps {
  stats: Stats;
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Summary */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">
            Summary
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Days Elapsed</span>
            <span className="font-medium">{stats.summary.daysElapsed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Days Logged</span>
            <span className="font-medium">{stats.summary.daysLogged}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Starting</span>
            <span className="font-medium">{stats.summary.startingWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current</span>
            <span className="font-medium">{stats.summary.currentWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Goal</span>
            <span className="font-medium">{stats.summary.goalWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {stats.summary.weightChange.direction === "lost"
                ? "Lost"
                : stats.summary.weightChange.direction === "gained"
                ? "Gained"
                : "Change"}
            </span>
            <span
              className={`font-medium ${
                stats.summary.weightChange.direction === "lost"
                  ? "text-green-600"
                  : stats.summary.weightChange.direction === "gained"
                  ? "text-red-600"
                  : ""
              }`}
            >
              {stats.summary.weightChange.direction === "unchanged"
                ? "0"
                : `${stats.summary.weightChange.direction === "lost" ? "-" : "+"}${stats.summary.weightChange.value.toFixed(1)}`}{" "}
              kg
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Points */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">
            Points
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Needed</span>
            <span className="font-medium">{stats.points.totalNeeded.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Collected</span>
            <span className="font-medium">{stats.points.collected.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-medium">{stats.points.remaining.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{stats.points.progressPercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Pace */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">
            Pace
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target/Day</span>
            <span className="font-medium">{stats.pace.targetPointsPerDay.toFixed(2)} pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Actual Avg</span>
            <span className="font-medium">{stats.pace.actualAvgPointsPerDay.toFixed(2)} pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">On Track?</span>
            <span
              className={`font-medium ${stats.pace.onTrack ? "text-green-600" : "text-red-600"}`}
            >
              {stats.pace.onTrack ? "Yes" : "No"} (
              {stats.pace.paceDifferencePercent > 0 ? "+" : ""}
              {stats.pace.paceDifferencePercent.toFixed(0)}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Days to Goal</span>
            <span className="font-medium">{stats.pace.daysToGoal ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Projected</span>
            <span className="font-medium">{stats.pace.projectedCompletionDate || "—"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Calories */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">
            Calories
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">TDEE</span>
            <span className="font-medium">{stats.calories.tdee} cal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target</span>
            <span className="font-medium">{stats.calories.targetCalories} cal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deficit Created</span>
            <span className="font-medium">
              {stats.calories.deficitCreated.toLocaleString()} cal
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Daily</span>
            <span className="font-medium">{stats.calories.avgDailyDeficit} cal</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
