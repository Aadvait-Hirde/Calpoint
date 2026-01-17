"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { ChartData } from "@/components/dashboard/types";

interface ChartsProps {
  data: ChartData;
}

const COLORS = ["#22c55e", "#3b82f6"];

export function ProgressChart({ data }: { data: ChartData["progressData"] }) {
  if (data.length === 0) return null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <p className="font-medium">Progress Chart</p>
        <p className="text-xs text-muted-foreground">Cumulative points vs target trajectory</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Target" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function WeightChart({ data }: { data: ChartData["weightData"] }) {
  if (data.length === 0) return null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <p className="font-medium">Weight Trend</p>
        <p className="text-xs text-muted-foreground">Your weight over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
            <Tooltip />
            <ReferenceLine y={data[0]?.goal} stroke="#22c55e" strokeDasharray="5 5" label={{ value: "Goal", fontSize: 10 }} />
            <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Weight" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DailyPointsChart({ data }: { data: ChartData["dailyPointsData"] }) {
  if (data.length === 0) return null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <p className="font-medium">Daily Points</p>
        <p className="text-xs text-muted-foreground">Points earned each day</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <ReferenceLine y={0} stroke="#000" />
            <ReferenceLine y={data[0]?.target} stroke="#9ca3af" strokeDasharray="5 5" />
            <Bar dataKey="points" name="Points" fill="#22c55e" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PointsBreakdownChart({ data }: { data: ChartData["pointsBreakdown"] }) {
  if (data.diet === 0 && data.workout === 0) return null;

  const pieData = [
    { name: "Diet", value: Math.abs(data.diet) },
    { name: "Workout", value: data.workout },
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <p className="font-medium">Points Breakdown</p>
        <p className="text-xs text-muted-foreground">Diet vs Workout contribution</p>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="ml-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Diet: {data.diet.toFixed(2)} pts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>Workout: {data.workout.toFixed(2)} pts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyChart({ data }: { data: ChartData["weeklyData"] }) {
  if (data.length === 0) return null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <p className="font-medium">Weekly Average</p>
        <p className="text-xs text-muted-foreground">Average points per day by week</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="avgPoints" name="Avg Points" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.onTrack ? "#22c55e" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ActivityHeatmap({ data }: { data: ChartData["heatmapData"] }) {
  if (data.length === 0) return null;

  const getColor = (level: number) => {
    switch (level) {
      case 4: return "#166534";
      case 3: return "#22c55e";
      case 2: return "#86efac";
      case 1: return "#fecaca";
      default: return "#ef4444";
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <p className="font-medium">Activity Calendar</p>
        <p className="text-xs text-muted-foreground">Your consistency over time</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {data.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.points.toFixed(2)} pts`}
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: getColor(day.level) }}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500" /> Surplus
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-200" /> Low
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-500" /> Good
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-800" /> Great
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function Charts({ data }: ChartsProps) {
  return (
    <div className="space-y-6">
      <ProgressChart data={data.progressData} />
      <WeightChart data={data.weightData} />
      <DailyPointsChart data={data.dailyPointsData} />
      <PointsBreakdownChart data={data.pointsBreakdown} />
      <WeeklyChart data={data.weeklyData} />
      <ActivityHeatmap data={data.heatmapData} />
    </div>
  );
}
