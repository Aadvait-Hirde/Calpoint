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

const COLORS = ["#22c55e", "#3b82f6"];

export function ProgressChart({ data }: { data: ChartData["progressData"] }) {
  if (data.length === 0) return null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <p className="font-medium text-sm">Progress</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} />
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
        <p className="font-medium text-sm">Weight</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
            <Tooltip />
            <ReferenceLine y={data[0]?.goal} stroke="#22c55e" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Weight" />
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
        <p className="font-medium text-sm">Daily Points</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <ReferenceLine y={0} stroke="#000" />
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
    <Card className="border shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <p className="font-medium text-sm">Points Breakdown</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-4">
          <div className="w-[100px] h-[100px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  dataKey="value"
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full shrink-0" />
              <span className="truncate">Diet: {data.diet.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full shrink-0" />
              <span className="truncate">Workout: {data.workout.toFixed(2)}</span>
            </div>
          </div>
        </div>
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
    <Card className="border shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <p className="font-medium text-sm">Activity</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-wrap gap-1 max-h-[80px] overflow-hidden">
          {data.slice(-28).map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.points.toFixed(2)} pts`}
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: getColor(day.level) }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-red-500" /> -
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-green-200" /> Low
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-green-500" /> Good
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-green-800" /> Great
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartsProps {
  data: ChartData;
}

export function Charts({ data }: ChartsProps) {
  return (
    <div className="space-y-4">
      <ProgressChart data={data.progressData} />
      <WeightChart data={data.weightData} />
      <PointsBreakdownChart data={data.pointsBreakdown} />
      <ActivityHeatmap data={data.heatmapData} />
    </div>
  );
}
