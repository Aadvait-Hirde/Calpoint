import { pgTable, serial, text, integer, real, date, timestamp } from "drizzle-orm/pg-core";

// User profiles - stores onboarding data and settings
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  
  // Physical stats for TDEE calculation
  heightCm: integer("height_cm").notNull(),
  age: integer("age").notNull(),
  sex: text("sex").notNull(), // 'male' or 'female'
  
  // Weight tracking
  startingWeight: real("starting_weight").notNull(), // kg
  goalWeight: real("goal_weight").notNull(), // kg
  currentWeight: real("current_weight").notNull(), // kg, updated with latest log
  
  // Calorie targets
  tdee: integer("tdee").notNull(), // Calculated sedentary TDEE
  targetCalories: integer("target_calories").notNull(), // Daily intake target
  
  // Tracking period
  startDate: date("start_date").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily logs - one entry per user per day
export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userProfiles.id),
  
  // The date of this log entry (unique per user)
  date: date("date").notNull(),
  
  // User inputs
  caloriesConsumed: integer("calories_consumed").notNull(),
  workoutCalories: integer("workout_calories").notNull().default(0), // 0 if no workout
  weight: real("weight"), // Optional daily weight in kg
  notes: text("notes"), // Optional notes
  
  // Calculated points (stored for quick queries)
  dietPoints: real("diet_points").notNull(),
  workoutPoints: real("workout_points").notNull(),
  totalPoints: real("total_points").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type inference helpers
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type NewDailyLog = typeof dailyLogs.$inferInsert;
