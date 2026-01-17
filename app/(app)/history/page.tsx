"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";
interface DailyLog {
  id: number;
  date: string;
  caloriesConsumed: number;
  workoutCalories: number;
  weight: number | null;
  notes: string | null;
  dietPoints: number;
  workoutPoints: number;
  totalPoints: number;
  runningTotal: number;
}
export default function HistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    caloriesConsumed: "",
    workoutCalories: "",
    weight: "",
    notes: "",
  });
  useEffect(() => {
    fetchLogs();
  }, []);
  const fetchLogs = async () => {
    try {
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      
      if (!profileData.profile) {
        router.push("/onboarding");
        return;
      }
      const response = await fetch("/api/logs");
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const startEditing = (log: DailyLog) => {
    setEditingId(log.id);
    setEditForm({
      caloriesConsumed: log.caloriesConsumed.toString(),
      workoutCalories: log.workoutCalories.toString(),
      weight: log.weight?.toString() || "",
      notes: log.notes || "",
    });
  };
  const handleUpdate = async (id: number) => {
    try {
      const response = await fetch("/api/logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          caloriesConsumed: Number(editForm.caloriesConsumed),
          workoutCalories: Number(editForm.workoutCalories) || 0,
          weight: editForm.weight ? Number(editForm.weight) : undefined,
          notes: editForm.notes || undefined,
        }),
      });
      if (response.ok) {
        setEditingId(null);
        fetchLogs();
      }
    } catch (error) {
      console.error("Error updating log:", error);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
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
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/history" className="text-sm font-medium text-foreground">
              History
            </Link>
            <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
              Settings
            </Link>
            <UserButton />
          </nav>
        </div>
      </header>
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <Card className="border shadow-sm">
          <CardHeader>
            <p className="text-xl font-light tracking-tight">Log History</p>
            <p className="text-sm text-muted-foreground">
              All your daily entries. Click a row to edit.
            </p>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No entries yet.</p>
                <Link href="/dashboard" className="text-sm hover:underline">
                  Go to dashboard to log your first entry →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Calories</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Workout</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Diet Pts</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Work Pts</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Daily</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Running</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Weight</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className={`border-b last:border-0 hover:bg-muted/50 cursor-pointer ${
                          editingId === log.id ? "bg-muted/50" : ""
                        }`}
                        onClick={() => editingId !== log.id && startEditing(log)}
                      >
                        {editingId === log.id ? (
                          <>
                            <td className="py-2 px-2">{log.date}</td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                value={editForm.caloriesConsumed}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, caloriesConsumed: e.target.value })
                                }
                                className="w-20 h-8 text-right"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                value={editForm.workoutCalories}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, workoutCalories: e.target.value })
                                }
                                className="w-20 h-8 text-right"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="py-2 px-2 text-right">—</td>
                            <td className="py-2 px-2 text-right">—</td>
                            <td className="py-2 px-2 text-right">—</td>
                            <td className="py-2 px-2 text-right">—</td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                step="0.1"
                                value={editForm.weight}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, weight: e.target.value })
                                }
                                className="w-16 h-8 text-right"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="py-2 px-2 flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdate(log.id);
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-2">{log.date}</td>
                            <td className="py-2 px-2 text-right">{log.caloriesConsumed}</td>
                            <td className="py-2 px-2 text-right">{log.workoutCalories || "—"}</td>
                            <td className="py-2 px-2 text-right">
                              <span className={log.dietPoints >= 0 ? "text-green-600" : "text-red-600"}>
                                {log.dietPoints >= 0 ? "+" : ""}{log.dietPoints.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right">
                              {log.workoutPoints > 0 ? `+${log.workoutPoints.toFixed(2)}` : "—"}
                            </td>
                            <td className="py-2 px-2 text-right">
                              <span className={log.totalPoints >= 0 ? "text-green-600" : "text-red-600"}>
                                {log.totalPoints >= 0 ? "+" : ""}{log.totalPoints.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right font-medium">{log.runningTotal.toFixed(2)}</td>
                            <td className="py-2 px-2 text-right">{log.weight || "—"}</td>
                            <td className="py-2 px-2 text-muted-foreground truncate max-w-[100px]">
                              {log.notes || "—"}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
