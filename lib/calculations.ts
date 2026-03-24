/**
 * Calpoint Core Calculations
 * 
 * All formulas for TDEE, points, and projections.
 */

// =============================================================================
// TDEE CALCULATION (Mifflin-St Jeor Equation)
// =============================================================================

export type Sex = "male" | "female";

interface TDEEParams {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
}

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * Men: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
 * Women: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
 */
export function calculateBMR({ weightKg, heightCm, age, sex }: TDEEParams): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/**
 * Calculate Total Daily Energy Expenditure (sedentary multiplier = 1.2)
 */
export function calculateTDEE(params: TDEEParams): number {
  const bmr = calculateBMR(params);
  return Math.round(bmr * 1.2);
}

// =============================================================================
// POINTS CALCULATION
// =============================================================================

interface DailyPointsParams {
  tdee: number;
  caloriesConsumed: number;
  workoutCalories: number;
}

/**
 * Calculate diet points: (TDEE - calories consumed) / 1000
 * Positive = deficit, negative = surplus
 */
export function calculateDietPoints(tdee: number, caloriesConsumed: number): number {
  return (tdee - caloriesConsumed) / 1000;
}

/**
 * Calculate workout points: workout calories / 1000
 */
export function calculateWorkoutPoints(workoutCalories: number): number {
  return workoutCalories / 1000;
}

/**
 * Calculate total points for a day
 */
export function calculateDailyPoints({ tdee, caloriesConsumed, workoutCalories }: DailyPointsParams) {
  const dietPoints = calculateDietPoints(tdee, caloriesConsumed);
  const workoutPoints = calculateWorkoutPoints(workoutCalories);
  const totalPoints = dietPoints + workoutPoints;

  return {
    dietPoints: Number(dietPoints.toFixed(3)),
    workoutPoints: Number(workoutPoints.toFixed(3)),
    totalPoints: Number(totalPoints.toFixed(3)),
  };
}

// =============================================================================
// GOAL CALCULATIONS
// =============================================================================

const CALORIES_PER_KG = 7700; // Standard calories per kg of fat

interface GoalParams {
  startingWeight: number;
  goalWeight: number;
}

/**
 * Calculate total points needed to reach goal
 */
export function calculateTotalPointsNeeded({ startingWeight, goalWeight }: GoalParams): number {
  const weightToLose = startingWeight - goalWeight;
  const totalCalorieDeficit = weightToLose * CALORIES_PER_KG;
  return totalCalorieDeficit / 1000;
}

/**
 * Calculate weight lost based on points collected
 */
export function calculateWeightLost(pointsCollected: number): number {
  const calorieDeficit = pointsCollected * 1000;
  return calorieDeficit / CALORIES_PER_KG;
}

// =============================================================================
// PROJECTION CALCULATIONS
// =============================================================================

interface ProjectionParams {
  startDate: Date;
  pointsCollected: number;
  totalPointsNeeded: number;
}

/**
 * Calculate days elapsed since start
 */
export function calculateDaysElapsed(startDate: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate average points per day
 */
export function calculateAveragePointsPerDay(pointsCollected: number, daysElapsed: number): number {
  if (daysElapsed === 0) return 0;
  return pointsCollected / daysElapsed;
}

/**
 * Calculate projected completion date based on current pace
 */
export function calculateProjectedCompletion({ startDate, pointsCollected, totalPointsNeeded }: ProjectionParams): Date | null {
  const daysElapsed = calculateDaysElapsed(startDate);
  if (daysElapsed === 0 || pointsCollected <= 0) return null;

  const avgPointsPerDay = calculateAveragePointsPerDay(pointsCollected, daysElapsed);
  const pointsRemaining = totalPointsNeeded - pointsCollected;
  const daysRemaining = pointsRemaining / avgPointsPerDay;

  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + Math.ceil(daysRemaining));
  return projectedDate;
}

/**
 * Calculate target points per day based on planned deficit
 */
export function calculateTargetPointsPerDay(tdee: number, targetCalories: number): number {
  const plannedDeficit = tdee - targetCalories;
  return plannedDeficit / 1000;
}

/**
 * Check if user is on track (actual pace >= target pace)
 */
export function isOnTrack(actualAvgPointsPerDay: number, targetPointsPerDay: number): boolean {
  return actualAvgPointsPerDay >= targetPointsPerDay;
}

/**
 * Calculate pace difference as percentage
 */
export function calculatePaceDifference(actualAvg: number, targetAvg: number): number {
  if (targetAvg === 0) return 0;
  return ((actualAvg - targetAvg) / targetAvg) * 100;
}

// =============================================================================
// CALORIE STATISTICS
// =============================================================================

interface CalorieStatsParams {
  tdee: number;
  targetCalories: number;
  startingWeight: number;
  goalWeight: number;
  pointsCollected: number;
}

export function calculateCalorieStats({
  tdee,
  targetCalories,
  startingWeight,
  goalWeight,
  pointsCollected,
}: CalorieStatsParams) {
  const totalDeficitNeeded = (startingWeight - goalWeight) * CALORIES_PER_KG;
  const deficitCreated = pointsCollected * 1000;
  const deficitRemaining = totalDeficitNeeded - deficitCreated;
  const plannedDailyDeficit = tdee - targetCalories;

  return {
    totalDeficitNeeded: Math.round(totalDeficitNeeded),
    deficitCreated: Math.round(deficitCreated),
    deficitRemaining: Math.round(deficitRemaining),
    plannedDailyDeficit,
    tdee,
    targetCalories,
  };
}

// =============================================================================
// PROTEIN TRACKING
// =============================================================================

/**
 * Protein rating scale based on grams per kg of body weight:
 *   < 0.8 g/kg  → "poor"
 *   0.8–1.2 g/kg → "below_average"  
 *   1.2–1.6 g/kg → "average"
 *   1.6–2.0 g/kg → "good"
 *   ≥ 2.0 g/kg  → "excellent"
 *
 * Target is set at 1.6 g/kg (the lower bound of "good").
 */

export type ProteinRating = "poor" | "below_average" | "average" | "good" | "excellent";

const PROTEIN_TARGET_GRAMS_PER_KG = 1.6;

export function getProteinTarget(bodyWeightKg: number): number {
  return Math.round(bodyWeightKg * PROTEIN_TARGET_GRAMS_PER_KG);
}

export function rateProteinIntake(proteinGrams: number, bodyWeightKg: number): ProteinRating {
  if (bodyWeightKg <= 0) return "poor";
  const ratio = proteinGrams / bodyWeightKg;
  if (ratio >= 2.0) return "excellent";
  if (ratio >= 1.6) return "good";
  if (ratio >= 1.2) return "average";
  if (ratio >= 0.8) return "below_average";
  return "poor";
}

export function getProteinRatingColor(rating: ProteinRating): string {
  switch (rating) {
    case "excellent": return "#22c55e"; // green
    case "good": return "#3b82f6"; // blue
    case "average": return "#eab308"; // yellow
    case "below_average": return "#f97316"; // orange
    case "poor": return "#ef4444"; // red
  }
}

export function getProteinRatingLabel(rating: ProteinRating): string {
  switch (rating) {
    case "excellent": return "Excellent";
    case "good": return "Good";
    case "average": return "Average";
    case "below_average": return "Below Avg";
    case "poor": return "Poor";
  }
}
