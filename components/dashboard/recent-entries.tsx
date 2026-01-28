"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DailyLog } from "./types";

interface RecentEntriesProps {
  logs: DailyLog[];
}

export function RecentEntries({ logs }: RecentEntriesProps) {
  if (logs.length === 0) return null;

  return (
    <Card className="border shadow-sm bg-card/95 backdrop-blur">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <p className="font-medium">Recent Entries</p>
        <Link href="/logs" className="text-sm text-muted-foreground hover:text-foreground">
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
                <th className="text-left py-2 pl-4 font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="py-2">{log.date}</td>
                  <td className="py-2 text-right">{log.caloriesConsumed}</td>
                  <td className="py-2 text-right">{log.workoutCalories || "—"}</td>
                  <td className="py-2 text-right">
                    <span className={log.totalPoints >= 0 ? "text-green-600" : "text-red-600"}>
                      {log.totalPoints >= 0 ? "+" : ""}
                      {log.totalPoints.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 text-right font-medium">{log.runningTotal.toFixed(2)}</td>
                  <td className="py-2 pl-4 max-w-[120px]">
                    {log.notes ? (
                      <span className="truncate block text-muted-foreground" title={log.notes}>
                        {log.notes.length > 25 ? `${log.notes.slice(0, 25)}...` : log.notes}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
