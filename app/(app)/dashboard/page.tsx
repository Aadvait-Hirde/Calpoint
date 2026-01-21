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

  const isMaintenanceMode = stats.mode === "maintenance";

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

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        {/* Maintenance Mode Banner */}
        {isMaintenanceMode && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <strong>Maintenance Mode:</strong> You've reached your goal! Keep logging to maintain your weight.
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* Progress */}
            <ProgressCard stats={stats} />

            {/* Stats Grid */}
            <StatCards stats={stats} />

            {/* Recent Logs */}
            <RecentEntries logs={recentLogs} />

            {/* Quick Log Button - Now below Recent Entries */}
            <Button onClick={() => setShowLogForm(!showLogForm)} className="w-full" size="lg">
              {showLogForm ? "Cancel" : "Add Entry"}
            </Button>

            {/* Log Form */}
            {showLogForm && <LogForm onLogSubmit={handleLogSubmit} />}
          </div>

          {/* Right Column - Charts */}
          <div className="hidden lg:block">
            {chartData && <Charts data={chartData} />}
          </div>
        </div>

        {/* Mobile Charts (toggle) */}
        <div className="lg:hidden mt-6">
          {chartData && chartData.progressData.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Show Charts
              </summary>
              <div className="mt-4">
                <Charts data={chartData} />
              </div>
            </details>
          )}
        </div>
      </main>
    </div>
  );
}
