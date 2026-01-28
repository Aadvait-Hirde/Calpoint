// Dashboard types
export interface Stats {
  mode: "cutting" | "bulking" | "maintenance";
  summary: {
    startDate: string;
    daysElapsed: number;
    daysLogged: number;
    startingWeight: number;
    goalWeight: number;
    currentWeight: number;
    weightChange: { value: number; direction: "lost" | "gained" | "unchanged" };
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

export interface DailyLog {
  id: number;
  date: string;
  caloriesConsumed: number;
  workoutCalories: number;
  weight: number | null;
  notes?: string | null;
  dietPoints: number;
  workoutPoints: number;
  totalPoints: number;
  runningTotal: number;
}

export interface ChartData {
  progressData: { date: string; actual: number; target: number }[];
  weightData: { date: string; weight: number | null; goal: number }[];
  dailyPointsData: { date: string; points: number; target: number }[];
  deficitData: { date: string; deficit: number; target: number }[];
  weeklyData: { week: string; avgPoints: number; onTrack: boolean }[];
  heatmapData: { date: string; points: number; level: number }[];
  pointsBreakdown: { diet: number; workout: number };
}
