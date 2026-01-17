"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DashboardHeader,
  StatCards,
  ProgressCard,
  LogForm,
  RecentEntries,
  type Stats,
  type DailyLog,
  type ChartData,
} from "@/components/dashboard";
import { Charts } from "@/components/charts";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

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

  const handleLogSubmit = () => {
    setShowLogForm(false);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!stats) return null;

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

      <DashboardHeader />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Progress */}
        <ProgressCard stats={stats} />

        {/* Quick Log Button */}
        <Button onClick={() => setShowLogForm(!showLogForm)} className="w-full" size="lg">
          {showLogForm ? "Cancel" : "Add Entry"}
        </Button>

        {/* Log Form */}
        {showLogForm && <LogForm onLogSubmit={handleLogSubmit} />}

        {/* Stats Grid */}
        <StatCards stats={stats} />

        {/* Charts Toggle */}
        <Button variant="outline" onClick={() => setShowCharts(!showCharts)} className="w-full">
          {showCharts ? "Hide Charts" : "Show Charts"}
        </Button>

        {/* Charts Section */}
        {showCharts && chartData && <Charts data={chartData} />}

        {/* Recent Logs */}
        <RecentEntries logs={recentLogs} />
      </main>
    </div>
  );
}
