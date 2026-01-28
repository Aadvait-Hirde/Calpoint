"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateTDEE, type Sex } from "@/lib/calculations";

interface Profile {
  heightCm: number;
  age: number;
  sex: Sex;
  startingWeight: number;
  goalWeight: number;
  currentWeight: number;
  tdee: number;
  targetCalories: number;
  startDate: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (!data.profile) {
        router.push("/onboarding");
        return;
      }
      setProfile(data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const recalculateTDEE = () => {
    if (!profile) return;
    const newTDEE = calculateTDEE({
      weightKg: profile.currentWeight,
      heightCm: profile.heightCm,
      age: profile.age,
      sex: profile.sex,
    });
    setProfile({ ...profile, tdee: newTDEE });
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setMessage("Settings saved successfully!");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-white/70">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-black/60 backdrop-blur border-white/20 rounded-none">
        <CardHeader>
          <p className="text-xl font-light tracking-tight text-white">Profile Settings</p>
          <p className="text-sm text-white/70">
            Update your stats and goals. Changes will affect future calculations.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-white/70 uppercase tracking-tight">
              Personal Info
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Height (cm)</label>
                <Input
                  type="number"
                  value={profile.heightCm}
                  onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Age</label>
                <Input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Sex</label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={profile.sex === "male" ? "default" : "outline"}
                  onClick={() => setProfile({ ...profile, sex: "male" })}
                  className="flex-1"
                >
                  Male
                </Button>
                <Button
                  type="button"
                  variant={profile.sex === "female" ? "default" : "outline"}
                  onClick={() => setProfile({ ...profile, sex: "female" })}
                  className="flex-1"
                >
                  Female
                </Button>
              </div>
            </div>
          </div>

          {/* Weight Goals */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-white/70 uppercase tracking-tight">
              Weight Goals
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Starting Weight (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={profile.startingWeight}
                  onChange={(e) =>
                    setProfile({ ...profile, startingWeight: Number(e.target.value) })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Goal Weight (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={profile.goalWeight}
                  onChange={(e) => setProfile({ ...profile, goalWeight: Number(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </div>

          {/* Calorie Targets */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-white/70 uppercase tracking-tight">
              Calorie Targets
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">TDEE (cal)</label>
                <div className="flex gap-2">
                  <Input type="number" value={profile.tdee} readOnly className="bg-white/5 border-white/20 text-white/70" />
                  <Button variant="outline" onClick={recalculateTDEE}>
                    Recalc
                  </Button>
                </div>
                <p className="text-xs text-white/50">Based on current weight</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Target Calories (cal)</label>
                <Input
                  type="number"
                  value={profile.targetCalories}
                  onChange={(e) =>
                    setProfile({ ...profile, targetCalories: Number(e.target.value) })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          {message && (
            <div
              className={`p-3 text-sm border rounded ${
                message.includes("success")
                  ? "text-green-400 bg-green-500/10 border-green-500/30"
                  : "text-red-400 bg-red-500/10 border-red-500/30"
              }`}
            >
              {message}
            </div>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
