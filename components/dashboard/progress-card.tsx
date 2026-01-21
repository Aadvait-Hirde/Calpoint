"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Stats } from "./types";

interface ProgressCardProps {
  stats: Stats;
}

function formatProjectedDate(dateString: string | null): string {
  if (!dateString) return "—";
  
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  
  // Add ordinal suffix
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";
  
  return `${day}${suffix} ${month} ${year}`;
}

export function ProgressCard({ stats }: ProgressCardProps) {
  const projectedDate = formatProjectedDate(stats.pace.projectedCompletionDate);
  const hasProjectedDate = stats.pace.projectedCompletionDate !== null;

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Top Row: Progress & Remaining */}
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
          <div className="space-y-2">
            <div className="h-4 bg-muted overflow-hidden rounded-full">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, stats.points.progressPercent)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {stats.points.progressPercent.toFixed(1)}% complete
            </p>
          </div>

          {/* Projected Date - Large & Prominent */}
          {hasProjectedDate && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center mb-2">
                Projected Completion
              </p>
              <p className="text-4xl md:text-5xl font-light tracking-tight text-center text-primary">
                {projectedDate}
              </p>
              {stats.pace.daysToGoal && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {stats.pace.daysToGoal} days from now
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
