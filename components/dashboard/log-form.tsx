"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LogFormProps {
  onLogSubmit: () => void;
}

// Get today's date in local timezone (avoids UTC offset issues)
function getLocalDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function LogForm({ onLogSubmit }: LogFormProps) {
  const [logDate, setLogDate] = useState(getLocalDateString());
  const [logCalories, setLogCalories] = useState("");
  const [logWorkoutCalories, setLogWorkoutCalories] = useState("");
  const [logWeight, setLogWeight] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

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

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save entry");
        return;
      }

      // Reset form
      setLogCalories("");
      setLogWorkoutCalories("");
      setLogWeight("");
      setLogNotes("");
      setLogDate(getLocalDateString());
      onLogSubmit();
    } catch {
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border shadow-sm bg-card/95 backdrop-blur">
      <CardHeader className="pb-2">
        <p className="font-medium">New Log Entry</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
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
  );
}
