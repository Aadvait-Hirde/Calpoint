"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { calculateTDEE, calculateTotalPointsNeeded, type Sex } from "@/lib/calculations";

type Step = "personal" | "weight" | "calories" | "review";

interface FormData {
  heightCm: string;
  age: string;
  sex: Sex;
  startingWeight: string;
  goalWeight: string;
  targetCalories: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    heightCm: "170",
    age: "30",
    sex: "male",
    startingWeight: "80",
    goalWeight: "70",
    targetCalories: "",
  });

  // Parse to numbers for calculations (default to 0 if empty)
  const heightCm = Number(formData.heightCm) || 0;
  const age = Number(formData.age) || 0;
  const startingWeight = Number(formData.startingWeight) || 0;
  const goalWeight = Number(formData.goalWeight) || 0;
  const targetCalories = Number(formData.targetCalories) || 0;

  const tdee = heightCm > 0 && age > 0 && startingWeight > 0
    ? calculateTDEE({
        weightKg: startingWeight,
        heightCm,
        age,
        sex: formData.sex,
      })
    : 0;

  const totalPointsNeeded = startingWeight > goalWeight
    ? calculateTotalPointsNeeded({ startingWeight, goalWeight })
    : 0;

  const dailyDeficit = tdee - targetCalories;
  const expectedDailyPoints = dailyDeficit / 1000;
  const weightToLose = startingWeight - goalWeight;

  // Calorie target presets
  const caloriePresets = tdee > 0
    ? [
        { label: "Aggressive", calories: Math.round(tdee - 750), deficit: 750 },
        { label: "Moderate", calories: Math.round(tdee - 500), deficit: 500 },
        { label: "Slow & Steady", calories: Math.round(tdee - 300), deficit: 300 },
      ]
    : [];

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm,
          age,
          sex: formData.sex,
          startingWeight,
          goalWeight,
          targetCalories,
          tdee,
          startDate: new Date().toISOString().split("T")[0],
          currentWeight: startingWeight,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedFromPersonal = heightCm >= 100 && heightCm <= 250 && age >= 16 && age <= 100;
  const canProceedFromWeight = startingWeight > goalWeight && goalWeight > 0;
  const canProceedFromCalories = targetCalories > 0 && targetCalories < tdee;

  const renderStep = () => {
    switch (step) {
      case "personal":
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-medium block">Height (cm)</label>
              <Input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                placeholder="170"
                min={100}
                max={250}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium block">Age</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="30"
                min={16}
                max={100}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium block">Sex</label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={formData.sex === "male" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, sex: "male" })}
                  className="flex-1"
                >
                  Male
                </Button>
                <Button
                  type="button"
                  variant={formData.sex === "female" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, sex: "female" })}
                  className="flex-1"
                >
                  Female
                </Button>
              </div>
            </div>
            <Button 
              onClick={() => setStep("weight")} 
              className="w-full"
              disabled={!canProceedFromPersonal}
            >
              Continue
            </Button>
          </div>
        );

      case "weight":
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-medium block">Current Weight (kg)</label>
              <Input
                type="number"
                value={formData.startingWeight}
                onChange={(e) => setFormData({ ...formData, startingWeight: e.target.value })}
                placeholder="80"
                min={30}
                max={300}
                step={0.1}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium block">Goal Weight (kg)</label>
              <Input
                type="number"
                value={formData.goalWeight}
                onChange={(e) => setFormData({ ...formData, goalWeight: e.target.value })}
                placeholder="70"
                min={30}
                max={300}
                step={0.1}
              />
            </div>
            {canProceedFromWeight && (
              <div className="p-5 bg-muted/50 border text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">Weight to lose:</span>{" "}
                  <span className="font-medium">{weightToLose.toFixed(1)} kg</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Points needed:</span>{" "}
                  <span className="font-medium">{totalPointsNeeded.toFixed(1)} pts</span>
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("personal")} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep("calories")} 
                className="flex-1"
                disabled={!canProceedFromWeight}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case "calories":
        return (
          <div className="space-y-8">
            <div className="p-5 bg-muted/50 border text-sm space-y-2">
              <p>
                <span className="text-muted-foreground">Your sedentary TDEE:</span>{" "}
                <span className="font-medium">{tdee} cal/day</span>
              </p>
              <p className="text-xs text-muted-foreground">
                This is your maintenance level with little/no exercise
              </p>
            </div>

            {/* Calorie Presets */}
            <div className="space-y-3">
              <label className="text-sm font-medium block">Recommended Targets</label>
              <div className="grid grid-cols-3 gap-3">
                {caloriePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetCalories: preset.calories.toString() })}
                    className={`p-4 border text-center transition-colors hover:bg-muted/50 ${
                      targetCalories === preset.calories ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">{preset.label}</p>
                    <p className="font-medium">{preset.calories}</p>
                    <p className="text-xs text-muted-foreground">-{preset.deficit}/day</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium block">Daily Calorie Target</label>
              <Input
                type="number"
                value={formData.targetCalories}
                onChange={(e) => setFormData({ ...formData, targetCalories: e.target.value })}
                placeholder={Math.round(tdee - 500).toString()}
                min={1000}
                max={5000}
              />
              <p className="text-xs text-muted-foreground">
                How many calories you plan to eat per day
              </p>
            </div>
            
            {dailyDeficit > 0 && targetCalories > 0 && (
              <div className="p-5 bg-muted/50 border text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">Daily deficit:</span>{" "}
                  <span className="font-medium">{dailyDeficit} cal</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Points/day:</span>{" "}
                  <span className="font-medium">{expectedDailyPoints.toFixed(2)} pts</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Est. days to goal:</span>{" "}
                  <span className="font-medium">
                    {Math.ceil(totalPointsNeeded / expectedDailyPoints)} days
                  </span>
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("weight")} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep("review")} 
                className="flex-1"
                disabled={!canProceedFromCalories}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-muted/50 border">
                  <p className="text-muted-foreground">Height</p>
                  <p className="font-medium">{heightCm} cm</p>
                </div>
                <div className="p-4 bg-muted/50 border">
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{age} years</p>
                </div>
                <div className="p-4 bg-muted/50 border">
                  <p className="text-muted-foreground">Starting Weight</p>
                  <p className="font-medium">{startingWeight} kg</p>
                </div>
                <div className="p-4 bg-muted/50 border">
                  <p className="text-muted-foreground">Goal Weight</p>
                  <p className="font-medium">{goalWeight} kg</p>
                </div>
                <div className="p-4 bg-muted/50 border">
                  <p className="text-muted-foreground">TDEE</p>
                  <p className="font-medium">{tdee} cal</p>
                </div>
                <div className="p-4 bg-muted/50 border">
                  <p className="text-muted-foreground">Target Calories</p>
                  <p className="font-medium">{targetCalories} cal</p>
                </div>
              </div>
              <div className="p-5 bg-primary/5 border border-primary/20 text-sm space-y-2">
                <p className="font-medium">Your Goal</p>
                <p>
                  Collect <span className="font-bold">{totalPointsNeeded.toFixed(1)} points</span> to
                  reach your goal weight
                </p>
                <p className="text-muted-foreground">
                  At {expectedDailyPoints.toFixed(2)} pts/day, that&apos;s about{" "}
                  {Math.ceil(totalPointsNeeded / expectedDailyPoints)} days
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("calories")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Start Tracking"}
              </Button>
            </div>
          </div>
        );
    }
  };

  const stepLabels = {
    personal: "Personal Info",
    weight: "Weight Goals",
    calories: "Calorie Target",
    review: "Review",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      {/* Dotted grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(210, 10%, 50%) 0.5px, transparent 0.5px)`,
          backgroundSize: "8px 8px",
          opacity: 0.15,
        }}
      />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-light tracking-tight text-foreground font-instrument-serif">
            Calpoint
          </h1>
          <h2 className="text-2xl font-light tracking-tight text-foreground">
            {stepLabels[step]}
          </h2>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2">
          {(["personal", "weight", "calories", "review"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 transition-colors ${
                i <= ["personal", "weight", "calories", "review"].indexOf(step)
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Form */}
        <Card className="shadow-xl border">
          <CardHeader className="pb-4">
            <p className="text-sm text-muted-foreground tracking-tight">
              Step {["personal", "weight", "calories", "review"].indexOf(step) + 1} of 4
            </p>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
