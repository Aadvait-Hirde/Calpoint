"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  LineChart,
  Line,
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
    <Card className="bg-black/60 backdrop-blur border-white/20 rounded-none overflow-hidden">
      <CardHeader className="pb-2">
        <p className="text-xs text-white/70 uppercase tracking-wider">Progress</p>
      </CardHeader>
      <CardContent className="px-2">
        <div className="w-full flex justify-center">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'white' }} tickFormatter={(v) => v.slice(5)} stroke="rgba(255,255,255,0.3)" />
              <YAxis tick={{ fontSize: 10, fill: 'white' }} width={35} stroke="rgba(255,255,255,0.3)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
              <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} dot={false} name="Actual" />
              <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeightChart({ data }: { data: ChartData["weightData"] }) {
  if (data.length === 0) return null;

  return (
    <Card className="bg-black/60 backdrop-blur border-white/20 rounded-none overflow-hidden">
      <CardHeader className="pb-2">
        <p className="text-xs text-white/70 uppercase tracking-wider">Weight</p>
      </CardHeader>
      <CardContent className="px-2">
        <div className="w-full flex justify-center">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'white' }} tickFormatter={(v) => v.slice(5)} stroke="rgba(255,255,255,0.3)" />
              <YAxis tick={{ fontSize: 10, fill: 'white' }} domain={["auto", "auto"]} width={35} stroke="rgba(255,255,255,0.3)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
              <ReferenceLine y={data[0]?.goal} stroke="#22c55e" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Weight" />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
    <Card className="bg-black/60 backdrop-blur border-white/20 rounded-none overflow-hidden">
      <CardHeader className="pb-2">
        <p className="text-xs text-white/70 uppercase tracking-wider">Points Breakdown</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-4">
          <div className="w-[140px] h-[140px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  dataKey="value"
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm min-w-0 text-white">
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

interface ActivityHeatmapProps {
  data: ChartData["heatmapData"];
  daysToGoal?: number | null;
}

export function ActivityHeatmap({ data, daysToGoal }: ActivityHeatmapProps) {
  // Calculate total squares: logged days + remaining days to goal
  const loggedDays = data.length;
  const remainingDays = daysToGoal && daysToGoal > 0 ? daysToGoal : 0;
  const totalSquares = loggedDays + remainingDays;

  // Color scheme: red (bad) -> orange (low) -> yellow (okay) -> green (good/great)
  const getColor = (level: number) => {
    switch (level) {
      case 4: return "#22c55e"; // green (great)
      case 3: return "#22c55e"; // green (good)
      case 2: return "#eab308"; // yellow (okay)
      case 1: return "#f97316"; // orange (low)
      default: return "#ef4444"; // red (bad)
    }
  };

  if (totalSquares === 0) return null;

  return (
    <Card className="bg-black/60 backdrop-blur border-white/20 rounded-none overflow-hidden">
      <CardHeader className="pb-2">
        <p className="text-xs text-white/70 uppercase tracking-wider">Activity</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-wrap gap-1.5">
          {/* Logged days - colored based on performance */}
          {data.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.points.toFixed(2)} pts`}
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: getColor(day.level) }}
            />
          ))}
          {/* Remaining days - gray */}
          {Array.from({ length: remainingDays }).map((_, i) => (
            <div
              key={`future-${i}`}
              title={`Day ${loggedDays + i + 1} (future)`}
              className="w-4 h-4 rounded-sm flex-shrink-0 bg-white/20"
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500" /> Bad
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-orange-500" /> Low
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-yellow-500" /> Okay
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-500" /> Good
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-white/20" /> Future
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartsProps {
  data: ChartData;
  daysToGoal?: number | null;
}

export function Charts({ data, daysToGoal }: ChartsProps) {
  return (
    <div className="space-y-4">
      <ProgressChart data={data.progressData} />
      <WeightChart data={data.weightData} />
      <PointsBreakdownChart data={data.pointsBreakdown} />
      <ActivityHeatmap data={data.heatmapData} daysToGoal={daysToGoal} />
    </div>
  );
}
