"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Stats } from "./types";

interface StatCardsProps {
  stats: Stats;
}

// Circular progress indicator component
function CircularProgress({ 
  value, 
  max, 
  size = 48, 
  strokeWidth = 4,
  color = "hsl(var(--primary))"
}: { 
  value: number; 
  max: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

// Mini progress bar component
function MiniProgressBar({ 
  value, 
  max, 
  color = "bg-primary",
  showOverflow = false
}: { 
  value: number; 
  max: number; 
  color?: string;
  showOverflow?: boolean;
}) {
  const percent = showOverflow 
    ? (value / max) * 100 
    : Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

export function StatCards({ stats }: StatCardsProps) {
  const pacePercent = (stats.pace.actualAvgPointsPerDay / stats.pace.targetPointsPerDay) * 100;
  const calorieProgress = stats.calories.targetCalories > 0 
    ? (stats.calories.avgDailyDeficit / stats.calories.plannedDailyDeficit) * 100 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Summary Card - Enhanced */}
      <Card className="border border-white/30 shadow-sm bg-white/20 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Weight Journey
              </p>
              <p className="text-3xl font-light tracking-tight">
                {stats.summary.currentWeight}
                <span className="text-lg text-muted-foreground ml-1">kg</span>
              </p>
            </div>
            <div className="relative">
              <CircularProgress 
                value={stats.summary.progressPercent} 
                max={100} 
                size={56}
                strokeWidth={5}
                color={stats.summary.progressPercent >= 50 ? "#22c55e" : "#3b82f6"}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {Math.round(stats.summary.progressPercent)}%
              </span>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Starting → Goal</span>
              <span className="font-medium">
                {stats.summary.startingWeight} → {stats.summary.goalWeight} kg
              </span>
            </div>
            <MiniProgressBar 
              value={Math.abs(stats.summary.startingWeight - stats.summary.currentWeight)}
              max={Math.abs(stats.summary.startingWeight - stats.summary.goalWeight)}
              color={stats.summary.weightChange.direction === "lost" ? "bg-green-500" : "bg-blue-500"}
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-muted-foreground">
                {stats.summary.weightChange.direction === "lost" ? "Lost" : 
                 stats.summary.weightChange.direction === "gained" ? "Gained" : "Change"}
              </span>
              <span className={`font-semibold text-lg ${
                stats.summary.weightChange.direction === "lost" ? "text-green-600" :
                stats.summary.weightChange.direction === "gained" ? "text-red-600" : ""
              }`}>
                {stats.summary.weightChange.direction === "unchanged"
                  ? "0 kg"
                  : `${stats.summary.weightChange.direction === "lost" ? "-" : "+"}${stats.summary.weightChange.value.toFixed(1)} kg`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>{stats.summary.daysLogged} days logged</span>
              <span>{stats.summary.daysElapsed} days elapsed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points Card - Enhanced */}
      <Card className="border border-white/30 shadow-sm bg-white/20 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Points
              </p>
              <p className="text-3xl font-light tracking-tight">
                {stats.points.collected.toFixed(1)}
                <span className="text-lg text-muted-foreground ml-1">
                  / {stats.points.totalNeeded.toFixed(0)}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Remaining</p>
              <p className="text-2xl font-semibold text-primary">
                {stats.points.remaining.toFixed(1)}
              </p>
            </div>
          </div>
          
          <MiniProgressBar 
            value={stats.points.collected}
            max={stats.points.totalNeeded}
            color="bg-primary"
          />
          
          <p className="text-center text-sm text-muted-foreground mt-3">
            {stats.points.progressPercent.toFixed(1)}% of goal achieved
          </p>
        </CardContent>
      </Card>

      {/* Pace Card - Enhanced with visual indicator */}
      <Card className="border border-white/30 shadow-sm bg-white/20 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Daily Pace
              </p>
              <p className="text-3xl font-light tracking-tight">
                {stats.pace.actualAvgPointsPerDay.toFixed(2)}
                <span className="text-lg text-muted-foreground ml-1">pts/day</span>
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              stats.pace.onTrack 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {stats.pace.onTrack ? "On Track" : "Behind"}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target</span>
              <span className="font-medium">{stats.pace.targetPointsPerDay.toFixed(2)} pts/day</span>
            </div>
            
            {/* Visual pace indicator */}
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              {/* Target marker */}
              <div 
                className="absolute top-0 h-full w-0.5 bg-gray-400 z-10"
                style={{ left: `${Math.min(100, 100)}%` }}
              />
              {/* Actual pace bar */}
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.pace.onTrack ? "bg-green-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(150, pacePercent)}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Performance</span>
              <span className={`text-lg font-semibold ${
                stats.pace.onTrack ? "text-green-600" : "text-amber-600"
              }`}>
                {stats.pace.paceDifferencePercent > 0 ? "+" : ""}
                {stats.pace.paceDifferencePercent.toFixed(0)}%
              </span>
            </div>
            
            {stats.pace.daysToGoal && (
              <p className="text-xs text-center text-muted-foreground pt-2 border-t">
                {stats.pace.daysToGoal} days to goal at current pace
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calories Card - Enhanced */}
      <Card className="border border-white/30 shadow-sm bg-white/20 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Daily Deficit
              </p>
              <p className="text-3xl font-light tracking-tight">
                {stats.calories.avgDailyDeficit.toLocaleString()}
                <span className="text-lg text-muted-foreground ml-1">cal</span>
              </p>
            </div>
            <div className="relative">
              <CircularProgress 
                value={Math.abs(stats.calories.deficitCreated)}
                max={stats.calories.totalDeficitNeeded}
                size={56}
                strokeWidth={5}
                color="#22c55e"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="text-green-600 text-xs">🔥</span>
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">TDEE</span>
              <span className="font-medium">{stats.calories.tdee.toLocaleString()} cal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Intake</span>
              <span className="font-medium">{stats.calories.targetCalories.toLocaleString()} cal</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Burned</span>
                <span className="text-lg font-semibold text-green-600">
                  {stats.calories.deficitCreated.toLocaleString()} cal
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
