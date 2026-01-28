"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Stats, DailyLog, ChartData } from "@/components/dashboard";
import {
  ProgressChart,
  WeightChart,
  PointsBreakdownChart,
  ActivityHeatmap,
} from "@/components/charts";

// Get today's date in local timezone
function getLocalDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatProjectedDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  const suffix =
    day === 1 || day === 21 || day === 31 ? "st" :
    day === 2 || day === 22 ? "nd" :
    day === 3 || day === 23 ? "rd" : "th";
  return `${day}${suffix} ${month} ${year}`;
}

// Circular progress component
function CircularProgress({ value, max, size = 56, color = "#22c55e" }: { value: number; max: number; size?: number; color?: string }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
    </svg>
  );
}

// Mini progress bar
function MiniProgressBar({ value, max, color = "bg-green-500" }: { value: number; max: number; color?: string }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [, setRecentLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  
  // Form state
  const [logDate, setLogDate] = useState(getLocalDateString());
  const [logCalories, setLogCalories] = useState("");
  const [logWorkout, setLogWorkout] = useState("");
  const [logWeight, setLogWeight] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    try {
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      if (!profileData.profile) {
        router.push("/onboarding");
        return;
      }
      const [statsRes, logsRes, chartsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/logs"),
        fetch("/api/charts"),
      ]);
      const statsData = await statsRes.json();
      const logsData = await logsRes.json();
      const chartsData = await chartsRes.json();
      setStats(statsData);
      setRecentLogs(logsData.logs?.slice(0, 5) || []);
      setChartData(chartsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: logDate,
          caloriesConsumed: Number(logCalories),
          workoutCalories: Number(logWorkout) || 0,
          weight: logWeight ? Number(logWeight) : undefined,
          notes: logNotes || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error || "Failed to save entry");
        return;
      }
      setLogCalories("");
      setLogWorkout("");
      setLogWeight("");
      setLogNotes("");
      setLogDate(getLocalDateString());
      setShowLogForm(false);
      fetchData();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-white/70">Loading...</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Row 1: Add Entry + Progress Bar - 50/50 split */}
      <div className="grid grid-cols-2 gap-4 h-[140px]">
        {/* Add Entry Button / Form - 50% width */}
        <div className="h-full">
          {!showLogForm ? (
            <Button
              onClick={() => setShowLogForm(true)}
              variant="ghost"
              className="w-full h-full rounded-none text-sm font-medium gap-2 bg-black/60 backdrop-blur border-white/20 text-white hover:bg-black/70 hover:text-white"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </Button>
          ) : (
            <div className="h-full bg-black/60 backdrop-blur border border-white/20 p-4 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/70 uppercase tracking-wider">New Entry</span>
                <button type="button" onClick={() => setShowLogForm(false)} className="text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {formError && <div className="text-xs text-red-400 mb-2">{formError}</div>}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* All 5 fields in one row */}
                <div className="flex gap-2">
                  <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="flex-1 h-8 text-xs px-2 bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert" />
                  <Input type="number" placeholder="Calories" value={logCalories} onChange={(e) => setLogCalories(e.target.value)} required className="flex-1 h-8 text-xs px-2 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                  <Input type="number" placeholder="Workout" value={logWorkout} onChange={(e) => setLogWorkout(e.target.value)} className="flex-1 h-8 text-xs px-2 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                  <Input type="number" step="0.1" placeholder="Weight" value={logWeight} onChange={(e) => setLogWeight(e.target.value)} className="flex-1 h-8 text-xs px-2 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                  <Input placeholder="Notes" value={logNotes} onChange={(e) => setLogNotes(e.target.value)} className="flex-1 h-8 text-xs px-2 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </div>
                <Button type="submit" disabled={isSubmitting} size="sm" className="h-8 text-xs w-full">
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Progress Bar Card - 50% width */}
        <Card className="bg-black/60 backdrop-blur border-white/20 rounded-none h-[140px]">
          <CardContent className="p-4 flex items-center h-full">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wider">Progress</p>
                  <p className="text-2xl font-light text-white">
                    {stats.points.collected.toFixed(1)}
                    <span className="text-base text-white/70 ml-1">/ {stats.points.totalNeeded.toFixed(0)} pts</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70 uppercase tracking-wider">Remaining</p>
                  <p className="text-xl font-light text-white">{stats.points.remaining.toFixed(1)} pts</p>
                </div>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${Math.min(100, stats.points.progressPercent)}%` }} />
              </div>
              <p className="text-xs text-white/70 text-center">{stats.points.progressPercent.toFixed(1)}% complete</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Three cards - Weight, Pace, Deficit */}
      <div className="grid grid-cols-3 gap-4">
        {/* Weight Journey Card */}
        <Card className="bg-black/60 backdrop-blur border-white/20 rounded-none">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Weight Journey</p>
                <p className="text-3xl font-light text-white">
                  {stats.summary.currentWeight}
                  <span className="text-lg text-white/70 ml-1">kg</span>
                </p>
              </div>
              <div className="relative">
                <CircularProgress value={stats.summary.progressPercent} max={100} color={stats.summary.progressPercent >= 50 ? "#22c55e" : "#3b82f6"} />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {Math.round(stats.summary.progressPercent)}%
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Starting → Goal</span>
                <span className="text-white">{stats.summary.startingWeight} → {stats.summary.goalWeight} kg</span>
              </div>
              <MiniProgressBar 
                value={Math.abs(stats.summary.startingWeight - stats.summary.currentWeight)}
                max={Math.abs(stats.summary.startingWeight - stats.summary.goalWeight)}
                color={stats.summary.weightChange.direction === "lost" ? "bg-green-500" : "bg-blue-500"}
              />
              <div className="flex justify-between pt-1">
                <span className="text-white/70">
                  {stats.summary.weightChange.direction === "lost" ? "Lost" : 
                   stats.summary.weightChange.direction === "gained" ? "Gained" : "Change"}
                </span>
                <span className={`font-semibold ${stats.summary.weightChange.direction === "lost" ? "text-green-500" : stats.summary.weightChange.direction === "gained" ? "text-red-500" : "text-white"}`}>
                  {stats.summary.weightChange.direction === "unchanged" ? "0 kg" : `${stats.summary.weightChange.direction === "lost" ? "-" : "+"}${stats.summary.weightChange.value.toFixed(1)} kg`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-white/50 pt-2 border-t border-white/10">
                <span>{stats.summary.daysLogged} days logged</span>
                <span>{stats.summary.daysElapsed} days elapsed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pace Card */}
        <Card className="bg-black/60 backdrop-blur border-white/20 rounded-none">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Daily Pace</p>
                <p className="text-3xl font-light text-white">
                  {stats.pace.actualAvgPointsPerDay.toFixed(2)}
                  <span className="text-lg text-white/70 ml-1">pts/day</span>
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                stats.pace.onTrack 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {stats.pace.onTrack ? "On Track" : "Behind"}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Target</span>
                <span className="text-white">{stats.pace.targetPointsPerDay.toFixed(2)} pts/day</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${stats.pace.onTrack ? "bg-green-500" : "bg-amber-500"}`}
                  style={{ width: `${Math.min(150, (stats.pace.actualAvgPointsPerDay / stats.pace.targetPointsPerDay) * 100)}%` }} />
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-white/70">Performance</span>
                <span className={`font-semibold ${stats.pace.onTrack ? "text-green-500" : "text-amber-500"}`}>
                  {stats.pace.paceDifferencePercent > 0 ? "+" : ""}{stats.pace.paceDifferencePercent.toFixed(0)}%
                </span>
              </div>
              {stats.pace.daysToGoal && (
                <p className="text-xs text-white/50 text-center pt-2 border-t border-white/10">
                  {stats.pace.daysToGoal} days to goal at current pace
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Deficit Card */}
        <Card className="bg-black/60 backdrop-blur border-white/20 rounded-none">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Daily Deficit</p>
                <p className="text-3xl font-light text-white">
                  {stats.calories.avgDailyDeficit.toLocaleString()}
                  <span className="text-lg text-white/70 ml-1">cal</span>
                </p>
              </div>
              <div className="relative">
                <CircularProgress 
                  value={Math.abs(stats.calories.deficitCreated)}
                  max={stats.calories.totalDeficitNeeded}
                  color="#22c55e"
                />
                <span className="absolute inset-0 flex items-center justify-center text-lg">🔥</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">TDEE</span>
                <span className="text-white">{stats.calories.tdee.toLocaleString()} cal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Target Intake</span>
                <span className="text-white">{stats.calories.targetCalories.toLocaleString()} cal</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-white/70">Total Burned</span>
                <span className="text-green-500 font-semibold">{stats.calories.deficitCreated.toLocaleString()} cal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Four charts */}
      {chartData && (
        <div className="grid grid-cols-4 gap-4">
          <ActivityHeatmap data={chartData.heatmapData} daysToGoal={stats.pace.daysToGoal} />
          <ProgressChart data={chartData.progressData} />
          <WeightChart data={chartData.weightData} />
          <PointsBreakdownChart data={chartData.pointsBreakdown} />
        </div>
      )}

      {/* Row 4: Projected Completion - Full Width */}
      {stats.pace.projectedCompletionDate && (
        <Card className="bg-black/60 backdrop-blur border-white/20 rounded-none">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-white/70 uppercase tracking-wider mb-2">Projected Completion</p>
            <p className="text-4xl md:text-5xl font-light tracking-tight text-white">
              {formatProjectedDate(stats.pace.projectedCompletionDate)}
            </p>
            {stats.pace.daysToGoal && (
              <p className="text-sm text-white/70 mt-2">{stats.pace.daysToGoal} days from now</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
