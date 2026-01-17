"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";
interface Stats {
  summary: {
    startDate: string;
    daysElapsed: number;
    startingWeight: number;
    goalWeight: number;
    currentWeight: number;
    weightLost: number;
    weightRemaining: number;
    progressPercent: number;
  };
  points: {
    totalNeeded: number;
    collected: number;
    remaining: number;
    progressPercent: number;
  };
  pace: {
    targetPointsPerDay: number;
    actualAvgPointsPerDay: number;
    daysToGoal: number | null;
    projectedCompletionDate: string | null;
    onTrack: boolean;
    paceDifferencePercent: number;
  };
  calories: {
    totalDeficitNeeded: number;
    deficitCreated: number;
    deficitRemaining: number;
    plannedDailyDeficit: number;
    tdee: number;
    targetCalories: number;
    avgDailyDeficit: number;
  };
}
interface DailyLog {
  id: number;
  date: string;
  caloriesConsumed: number;
  workoutCalories: number;
  weight: number | null;
  dietPoints: number;
  workoutPoints: number;
  totalPoints: number;
  runningTotal: number;
}
export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  
  // Log form state
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [logCalories, setLogCalories] = useState("");
  const [logWorkoutCalories, setLogWorkoutCalories] = useState("");
  const [logWeight, setLogWeight] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      // Check if profile exists
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      
      if (!profileData.profile) {
        router.push("/onboarding");
        return;
      }
      // Fetch stats and logs
      const [statsRes, logsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/logs"),
      ]);
      const statsData = await statsRes.json();
      const logsData = await logsRes.json();
      setStats(statsData);
      setRecentLogs(logsData.logs?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: logDate,
          caloriesConsumed: Number(logCalories),
          workoutCalories: Number(logWorkoutCalories) || 0,
          weight: logWeight ? Number(logWeight) : undefined,
          notes: logNotes || undefined,
        }),
      });
      if (response.ok) {
        setShowLogForm(false);
        setLogCalories("");
        setLogWorkoutCalories("");
        setLogWeight("");
        setLogNotes("");
        fetchData();
      }
    } catch (error) {
      console.error("Error submitting log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  if (!stats) {
    return null;
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Dotted grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(210, 10%, 50%) 0.5px, transparent 0.5px)`,
          backgroundSize: "8px 8px",
          opacity: 0.1,
        }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-light tracking-tight font-instrument-serif">Calpoint</h1>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-foreground">
              Dashboard
            </Link>
            <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground">
              History
            </Link>
            <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
              Settings
            </Link>
            <UserButton />
          </nav>
        </div>
      </header>
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Progress Section */}
        <section>
          <Card className="border shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-3xl font-light tracking-tight">
                      {stats.points.collected.toFixed(1)}{" "}
                      <span className="text-lg text-muted-foreground">
                        / {stats.points.totalNeeded.toFixed(1)} pts
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-light tracking-tight">
                      {stats.points.remaining.toFixed(1)} pts
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="h-3 bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(100, stats.points.progressPercent)}%` }}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  {stats.points.progressPercent.toFixed(1)}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
        {/* Quick Log Button */}
        <section>
          <Button onClick={() => setShowLogForm(!showLogForm)} className="w-full" size="lg">
            {showLogForm ? "Cancel" : "Log Today"}
          </Button>
        </section>
        {/* Log Form */}
        {showLogForm && (
          <section>
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <p className="font-medium">New Log Entry</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Calories Consumed</label>
                      <Input
                        type="number"
                        placeholder="1800"
                        value={logCalories}
                        onChange={(e) => setLogCalories(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Workout Calories</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={logWorkoutCalories}
                        onChange={(e) => setLogWorkoutCalories(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Weight (kg)</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Optional"
                        value={logWeight}
                        onChange={(e) => setLogWeight(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Input
                      placeholder="Optional notes..."
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Saving..." : "Save Entry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        )}
        {/* Stats Grid */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <span className="text-muted-foreground">Lost</span>
                <span className="font-medium text-green-600">-{stats.summary.weightLost} kg</span>
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
                <span className={`font-medium ${stats.pace.onTrack ? "text-green-600" : "text-red-600"}`}>
                  {stats.pace.onTrack ? "Yes" : "No"} ({stats.pace.paceDifferencePercent > 0 ? "+" : ""}
                  {stats.pace.paceDifferencePercent}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projected</span>
                <span className="font-medium">
                  {stats.pace.projectedCompletionDate || "—"}
                </span>
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
                <span className="font-medium">{stats.calories.deficitCreated.toLocaleString()} cal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Daily</span>
                <span className="font-medium">{stats.calories.avgDailyDeficit} cal</span>
              </div>
            </CardContent>
          </Card>
        </section>
        {/* Recent Logs */}
        {recentLogs.length > 0 && (
          <section>
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <p className="font-medium">Recent Entries</p>
                <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground">
                  View all →
                </Link>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Calories</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Workout</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Points</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLogs.map((log) => (
                        <tr key={log.id} className="border-b last:border-0">
                          <td className="py-2">{log.date}</td>
                          <td className="py-2 text-right">{log.caloriesConsumed}</td>
                          <td className="py-2 text-right">{log.workoutCalories || "—"}</td>
                          <td className="py-2 text-right">
                            <span className={log.totalPoints >= 0 ? "text-green-600" : "text-red-600"}>
                              {log.totalPoints >= 0 ? "+" : ""}{log.totalPoints.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-2 text-right font-medium">{log.runningTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
