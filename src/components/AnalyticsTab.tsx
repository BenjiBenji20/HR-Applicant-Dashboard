import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Users,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  CheckCircle2,
  PieChart as PieIcon
} from "lucide-react";
import { ApplicantFinalResult } from "../types";

interface AnalyticsTabProps {
  finalResults: ApplicantFinalResult[];
}

export default function AnalyticsTab({ finalResults }: AnalyticsTabProps) {
  // Aggregate 1: Position Distribution
  const positionCounts = finalResults.reduce((acc, app) => {
    const pos = app.intent.positionAppliedFor;
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const positionData = Object.entries(positionCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Aggregate 2: Comprehension vs Planning Cognitive Scores
  const cognitiveData = finalResults.map((app) => {
    const mapRating = (rating: string) => {
      const r = rating.toLowerCase();
      if (r.includes("outstanding") || r.includes("superior")) return 95;
      if (r.includes("excellent") || r.includes("highly satisfactory") || r.includes("strategic")) return 85;
      if (r.includes("highly organized") || r.includes("above average")) return 80;
      if (r.includes("satisfactory") || r.includes("methodical")) return 70;
      if (r.includes("average") || r.includes("flexible")) return 60;
      return 50; // default average/developing
    };

    return {
      name: app.metadata.fullName,
      Comprehension: mapRating(app.scores.comprehension),
      Planning: mapRating(app.scores.planning),
    };
  });

  // Aggregate 3: CFIT Distribution
  const cfitCounts = finalResults.reduce((acc, app) => {
    const c = app.scores.cfit.split(" ")[0] || "Average";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cfitData = Object.entries(cfitCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Premium professional colors for charts
  const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#6366f1", "#3b82f6", "#8b5cf6"];

  // Average 16PF Sten score
  const avg16pf = finalResults.length
    ? (
        finalResults.reduce((sum, app) => {
          const scoreStr = app.scores["16pf"].match(/\d+/)?.[0] || "5";
          return sum + parseInt(scoreStr, 10);
        }, 0) / finalResults.length
      ).toFixed(1)
    : "0";

  // Supervisory total recommendations
  const supervisoryResults = finalResults.filter((app) => app.metadata.supervisoryTest);
  const recommendedCount = supervisoryResults.filter(
    (app) => app.scores.supervisory?.totalEvaluation.includes("Recommended")
  ).length;

  return (
    <div className="space-y-6">
      {/* Intro section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Applicant Analytics Insights</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">High-level visual intelligence metrics aggregating cognitive levels, supervisory tracks, and position matching parameters.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4 shadow-xs">
          <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Audited</span>
            <span className="text-xl font-bold text-slate-800 dark:text-white mt-0.5 block">{finalResults.length}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4 shadow-xs">
          <div className="rounded-lg bg-cyan-50 p-2.5 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Positions Target</span>
            <span className="text-xl font-bold text-slate-800 dark:text-white mt-0.5 block">
              {Object.keys(positionCounts).length} Roles
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4 shadow-xs">
          <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg 16PF Sten</span>
            <span className="text-xl font-bold text-slate-800 dark:text-white mt-0.5 block">Sten {avg16pf}</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4 shadow-xs">
          <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supervisory Rate</span>
            <span className="text-xl font-bold text-slate-800 dark:text-white mt-0.5 block">
              {supervisoryResults.length > 0
                ? `${((recommendedCount / supervisoryResults.length) * 100).toFixed(0)}% Rec`
                : "0% Standard"}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Cognitive Score index */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex flex-col shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Cognitive Aptitude Index (Qualitative Mapped)
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Aptitude rating converted to indicative percentage scale (Outstanding ~95%, Strategic ~85%)
              </p>
            </div>
          </div>
          <div className="h-72 w-full text-xs">
            {cognitiveData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cognitiveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#64748b" />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Comprehension" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Planning" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                No active metrics to draw
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Position distribution Pie */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex flex-col shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="h-4.5 w-4.5 text-cyan-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Role Application Shares
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Breakdown of applicant positions applied
              </p>
            </div>
          </div>
          <div className="relative flex-1 h-60 w-full flex items-center justify-center text-xs">
            {positionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {positionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400">No role data available</div>
            )}
            
            {/* Custom Pie legend inside sidebar */}
            <div className="absolute flex flex-col justify-center text-[10px] font-medium pointer-events-none text-center">
              <span className="text-slate-400 dark:text-slate-500 uppercase text-[8px] font-semibold tracking-wider">TOTAL ROLES</span>
              <span className="text-base font-bold text-slate-800 dark:text-white">
                {Object.keys(positionCounts).length}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-900 pt-3">
            {positionData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="truncate">{item.name}: <b>{item.value}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CFIT distribution card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
          General Cognitive Intelligence (CFIT Categorization)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
          {["Very High", "High", "High Average", "Average"].map((tier) => {
            const count = finalResults.filter((app) => app.scores.cfit.includes(tier)).length;
            const percentage = finalResults.length ? ((count / finalResults.length) * 100).toFixed(0) : "0";

            return (
              <div
                key={tier}
                className="rounded-xl bg-slate-50/50 p-4 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800"
              >
                <span className="text-slate-400 dark:text-slate-500 block font-semibold text-[10px] uppercase tracking-wider">{tier}</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">{count}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">{percentage}% of candidates</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
