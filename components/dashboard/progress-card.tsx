"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Stats } from "./types";

interface ProgressCardProps {
  stats: Stats;
}

export function ProgressCard({ stats }: ProgressCardProps) {
  return (
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
  );
}
