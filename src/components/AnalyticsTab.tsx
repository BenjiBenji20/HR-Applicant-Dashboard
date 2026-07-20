import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Users,
  Award,
  TrendingDown,
  RefreshCw,
  Maximize2,
  X,
  BarChart3,
  CheckCircle2,
  FileText,
  ChevronRight,
  MessageSquare,
  UserCheck
} from "lucide-react";
import { ApplicantFinalResult } from "../types/types";
import { AnalyticsSummary, CategoryCount, CategoryCountPair, FunnelStage } from "../types/analytics.types";
import { cardConfigs } from "../data/mockData";

interface AnalyticsTabProps {
  finalResults: ApplicantFinalResult[];
}

// Deterministic hash helper to generate mock properties (e.g. completion/interview states not in row data)
const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const CLASSIFICATION_VALUES: Record<string, number> = {
  "Low": 1,
  "Below Average": 2,
  "Low Average": 3,
  "Average": 4,
  "High Average": 5,
  "Above Average": 6,
  "Superior": 7
};

// Converts the applicant list to the strict AnalyticsSummary format
function mapResultsToSummary(results: ApplicantFinalResult[]): AnalyticsSummary {
  const totalApplicants = results.length;

  // 1. Applications by Position
  const positionMap = new Map<string, number>();
  results.forEach(app => {
    const pos = app.intent.positionAppliedFor || "Other";
    positionMap.set(pos, (positionMap.get(pos) || 0) + 1);
  });
  const applyCountByPosition: CategoryCount[] = Array.from(positionMap.entries()).map(
    ([label, count]) => ({ label, count })
  );

  // 2. Application Outcome (derived from composite rating scores)
  let successful = 0;
  let failed = 0;
  let pending = 0;
  results.forEach(app => {
    const cfitVal = CLASSIFICATION_VALUES[app.scores.cfit] || 4;
    const compVal = CLASSIFICATION_VALUES[app.scores.comprehension] || 4;
    const planVal = CLASSIFICATION_VALUES[app.scores.planning] || 4;
    const avg = (cfitVal + compVal + planVal) / 3;

    if (avg >= 5.0) {
      successful++;
    } else if (avg < 3.0) {
      failed++;
    } else {
      pending++;
    }
  });

  const applicationOutcome: CategoryCount[] = [
    { label: "Successful", count: successful },
    { label: "Failed", count: failed }
  ];
  if (pending > 0) {
    applicationOutcome.push({ label: "Pending", count: pending });
  }

  // 3. Test Completion
  let completed = 0;
  let notCompleted = 0;
  results.forEach(app => {
    const isCompleted = getHash(app.id) % 8 !== 0;
    if (isCompleted) {
      completed++;
    } else {
      notCompleted++;
    }
  });
  const testCompletion = { completed, notCompleted };

  // 4. Interviews & No-Shows by Position
  const interviewMap = new Map<string, { interviewed: number; noShow: number }>();
  results.forEach(app => {
    const pos = app.intent.positionAppliedFor || "Other";
    if (!interviewMap.has(pos)) {
      interviewMap.set(pos, { interviewed: 0, noShow: 0 });
    }
    const counts = interviewMap.get(pos)!;
    const hashVal = getHash(app.id);

    const isNoShow = hashVal % 9 === 0;
    const reachedInterview = hashVal % 2 === 0 || app.metadata.supervisoryTest;

    if (reachedInterview) {
      if (isNoShow) {
        counts.noShow++;
      } else {
        counts.interviewed++;
      }
    }
  });

  let totalInterviewed = 0;
  let totalNoShow = 0;
  const byPosition: CategoryCountPair[] = [];
  interviewMap.forEach((val, key) => {
    byPosition.push({
      label: key,
      primary: val.interviewed,
      secondary: val.noShow
    });
    totalInterviewed += val.interviewed;
    totalNoShow += val.noShow;
  });

  const interviews = {
    totalInterviewed,
    totalNoShow,
    byPosition
  };

  // 5. Hiring Funnel (sequential drop-off)
  const appliedCount = totalApplicants;
  const testFinishedCount = Math.min(appliedCount, completed);
  const interviewedCount = Math.min(testFinishedCount, totalInterviewed);

  let hiredCount = results.filter(app => {
    const cfitVal = CLASSIFICATION_VALUES[app.scores.cfit] || 4;
    const compVal = CLASSIFICATION_VALUES[app.scores.comprehension] || 4;
    const planVal = CLASSIFICATION_VALUES[app.scores.planning] || 4;
    const avg = (cfitVal + compVal + planVal) / 3;
    return avg >= 5.5;
  }).length;
  hiredCount = Math.min(interviewedCount, hiredCount);

  const hiringFunnel: FunnelStage[] = [
    { stage: "Applied", count: appliedCount },
    { stage: "Test Finished", count: testFinishedCount },
    { stage: "Interviewed", count: interviewedCount },
    { stage: "Hired", count: hiredCount }
  ];

  return {
    totalApplicants,
    applyCountByPosition,
    applicationOutcome,
    testCompletion,
    interviews,
    hiringFunnel,
    generatedAt: new Date().toISOString()
  };
}

export default function AnalyticsTab({ finalResults }: AnalyticsTabProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModalCard, setActiveModalCard] = useState<string | null>(null);
  const [apiSummary, setApiSummary] = useState<AnalyticsSummary | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setApiSummary(json.data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch analytics from API proxy:", err);
    }
    setLoading(false);
  };

  // Initial loading & analytics API call
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Handle closing modal when Esc key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalCard(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const summary = apiSummary || mapResultsToSummary(finalResults);

  // Computations for small KPI cards
  const testCompletionPercent = summary.totalApplicants > 0
    ? Math.round((summary.testCompletion.completed / summary.totalApplicants) * 100)
    : 0;

  const totalInterviewsScheduled = summary.interviews.totalInterviewed + summary.interviews.totalNoShow;
  const noShowPercent = totalInterviewsScheduled > 0
    ? Math.round((summary.interviews.totalNoShow / totalInterviewsScheduled) * 100)
    : 0;

  const hiredCount = summary.hiringFunnel.find(f => f.stage === "Hired")?.count || 0;

  // Visual Colors & Styling variables
  const COLORS_PRIMARY = ["#4F46E5", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"];
  const OUTCOME_COLORS = {
    Successful: "#10B981",
    Failed: "#EF4444",
    Pending: "#F59E0B"
  };
  const COMPLETION_COLORS = {
    Completed: "#4F46E5",
    "Not Completed": "#94A3B8"
  };


  // Renders the stage flow chart layout for the funnel stage grid
  const renderFunnelFlow = (isModal: boolean = false) => {
    const steps = [
      { id: "applied", label: "Applied", count: summary.hiringFunnel[0].count, icon: Users, bg: "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400" },
      { id: "testing", label: "Test Finished", count: summary.hiringFunnel[1].count, icon: CheckCircle2, bg: "bg-violet-50 border-violet-100 text-violet-600 dark:bg-violet-950/40 dark:border-violet-900/60 dark:text-violet-400" },
      { id: "interviewed", label: "Interviewed", count: summary.hiringFunnel[2].count, icon: MessageSquare, bg: "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-400" },
      { id: "hired", label: "Hired", count: summary.hiringFunnel[3].count, icon: UserCheck, bg: "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-400" }
    ];

    if (isModal) {
      // Vertical layout for pop-up modal to prevent horizontal crowding
      return (
        <div className="w-full max-w-sm flex flex-col items-center gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const prevStep = steps[idx - 1];
            const conversionRate = prevStep && prevStep.count > 0
              ? Math.round((step.count / prevStep.count) * 100)
              : 100;

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <div className="flex items-center gap-2 text-slate-350 dark:text-slate-700 py-1">
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-800">↓</span>
                    <div className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                      {conversionRate}% Pass
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-800">↓</span>
                  </div>
                )}
                <div className="flex items-center gap-4 bg-white rounded-xl shadow-2xs dark:bg-slate-950 dark:border-slate-850 p-4 w-full">
                  <div className={`p-3 rounded-lg shrink-0 ${step.bg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{step.label}</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white mt-0.5 block">{step.count} candidates</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      );
    }

    // Horizontal layout for card view
    const gap = "gap-3 sm:gap-4";
    const boxSize = "py-3.5 px-3 flex-1 min-w-[130px]";

    return (
      <div className={`w-full flex flex-col sm:flex-row sm:items-center justify-between ${gap} p-4 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-slate-100 dark:border-slate-900`}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const prevStep = steps[idx - 1];
          const conversionRate = prevStep && prevStep.count > 0
            ? Math.round((step.count / prevStep.count) * 100)
            : 100;

          return (
            <React.Fragment key={step.id}>
              {/* Connector between steps */}
              {idx > 0 && (
                <div className="flex flex-row sm:flex-col items-center justify-center text-slate-350 dark:text-slate-700 py-1 sm:py-0 select-none">
                  <div className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap shadow-2xs">
                    {conversionRate}%
                  </div>
                  <ChevronRight className="h-4 w-4 hidden sm:block mt-1 text-slate-400 dark:text-slate-650" />
                  <span className="block sm:hidden text-[10px] font-bold leading-none my-0.5 text-slate-300 dark:text-slate-800 font-mono">↓</span>
                </div>
              )}

              {/* Stage Box Card */}
              <div className={`flex items-center gap-3 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm dark:bg-slate-950 dark:border-slate-850 transition-all ${boxSize}`}>
                <div className={`p-2.5 rounded-lg shrink-0 ${step.bg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">{step.label}</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 block leading-none">{step.count}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Helper to render the specific Recharts chart inside a card or modal
  const renderChart = (key: string, isModal: boolean = false) => {
    const height = isModal ? "h-80 md:h-[450px]" : "h-64";

    switch (key) {
      case "pos":
        return (
          <div className={`${height} w-full`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.applyCountByPosition} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-900" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px"
                  }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={isModal ? 48 : 28}>
                  {summary.applyCountByPosition.map((_, idx) => (
                    <Cell key={idx} fill={COLORS_PRIMARY[idx % COLORS_PRIMARY.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "outcome":
        return (
          <div className={`${height} w-full relative flex items-center justify-center`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.applicationOutcome}
                  cx="50%"
                  cy="50%"
                  innerRadius={isModal ? 80 : 65}
                  outerRadius={isModal ? 110 : 85}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="label"
                >
                  {summary.applicationOutcome.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={OUTCOME_COLORS[entry.label as keyof typeof OUTCOME_COLORS] || "#cbd5e1"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col justify-center text-center pointer-events-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SUCCESS RATE</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {summary.totalApplicants > 0
                  ? Math.round(
                    ((summary.applicationOutcome.find(o => o.label === "Successful")?.count || 0) /
                      summary.totalApplicants) *
                    100
                  )
                  : 0}
                %
              </span>
            </div>
          </div>
        );
      case "comp":
        return (
          <div className={`${height} w-full relative flex items-center justify-center`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Completed", value: summary.testCompletion.completed },
                    { name: "Not Completed", value: summary.testCompletion.notCompleted }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={isModal ? 80 : 65}
                  outerRadius={isModal ? 110 : 85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill={COMPLETION_COLORS.Completed} />
                  <Cell fill={COMPLETION_COLORS["Not Completed"]} />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col justify-center text-center pointer-events-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">COMPLETED</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {summary.testCompletion.completed}
              </span>
            </div>
          </div>
        );
      case "interview":
        return (
          <div className={`${height} w-full`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.interviews.byPosition} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-900" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px"
                  }}
                />
                <Bar dataKey="primary" name="Interviewed" fill="#10B981" radius={[3, 3, 0, 0]} barSize={isModal ? 24 : 14} />
                <Bar dataKey="secondary" name="No-Show" fill="#EF4444" radius={[3, 3, 0, 0]} barSize={isModal ? 24 : 14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  // Helper to render the specific table inside the modal
  const renderTable = (key: string) => {
    switch (key) {
      case "pos":
        return (
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-900 text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-400 font-sans">Position Name</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">Total Applied</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-sans">
              {summary.applyCountByPosition.map((item, idx) => {
                const pct = summary.totalApplicants > 0 ? Math.round((item.count / summary.totalApplicants) * 100) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 font-sans">
                    <td className="px-3 py-2 text-slate-850 dark:text-slate-200 font-medium font-sans">{item.label}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-sans">{item.count}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-sans">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      case "outcome":
        return (
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-900 text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900 font-sans">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-400 font-sans">Classification</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">Count</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-sans">
              {summary.applicationOutcome.map((item, idx) => {
                const pct = summary.totalApplicants > 0 ? Math.round((item.count / summary.totalApplicants) * 100) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 font-sans">
                    <td className="px-3 py-2 text-slate-850 dark:text-slate-200 font-medium font-sans">{item.label}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-sans">{item.count}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-sans">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      case "comp":
        return (
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-900 text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900 font-sans">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-400 font-sans">Status</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">Total Count</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-sans">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 font-sans">
                <td className="px-3 py-2 text-slate-850 dark:text-slate-200 font-medium font-sans">Completed</td>
                <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-sans">{summary.testCompletion.completed}</td>
                <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-sans">{testCompletionPercent}%</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 font-sans">
                <td className="px-3 py-2 text-slate-850 dark:text-slate-200 font-medium font-sans font-sans">Not Completed</td>
                <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-sans">{summary.testCompletion.notCompleted}</td>
                <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-sans">{100 - testCompletionPercent}%</td>
              </tr>
            </tbody>
          </table>
        );
      case "interview":
        return (
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-900 text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900 font-sans">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-400 font-sans">Position</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">Interviewed</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">No-Show</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">Show Rate %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-sans">
              {summary.interviews.byPosition.map((item, idx) => {
                const total = item.primary + item.secondary;
                const showRate = total > 0 ? Math.round((item.primary / total) * 100) : 100;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 font-sans">
                    <td className="px-3 py-2 text-slate-850 dark:text-slate-200 font-medium font-sans">{item.label}</td>
                    <td className="px-3 py-2 text-right text-emerald-600 dark:text-emerald-400 font-semibold font-sans">{item.primary}</td>
                    <td className="px-3 py-2 text-right text-rose-500 font-sans">{item.secondary}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-sans">{showRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      case "funnel":
        return (
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-900 text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900 font-sans">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-400 font-sans">Stage</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">Active Candidates</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans">% of Total Pool</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-400 font-sans font-sans">Stage Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-sans font-sans">
              {summary.hiringFunnel.map((stage, idx) => {
                const pctOfTotal = summary.totalApplicants > 0 ? Math.round((stage.count / summary.totalApplicants) * 100) : 0;
                const prevCount = idx > 0 ? summary.hiringFunnel[idx - 1].count : stage.count;
                const conversion = prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="px-3 py-2 text-slate-850 dark:text-slate-200 font-semibold">{stage.stage}</td>
                    <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300 font-medium">{stage.count}</td>
                    <td className="px-3 py-2 text-right text-slate-500 dark:text-slate-400">{pctOfTotal}%</td>
                    <td className="px-3 py-2 text-right text-indigo-600 dark:text-indigo-400 font-bold">{idx === 0 ? "Initial" : `${conversion}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  // Skeleton UI components
  const StatSkeleton = () => (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4 shadow-sm animate-pulse">
      <div className="rounded-lg bg-slate-100 dark:bg-slate-900 p-3 h-12 w-12 animate-pulse" />
      <div className="space-y-2 flex-1 animate-pulse">
        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-900 rounded animate-pulse" />
        <div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
  );

  const ChartSkeleton = () => (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex flex-col h-[350px] shadow-sm animate-pulse justify-between">
      <div className="flex justify-between items-center animate-pulse">
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-48 bg-slate-100 dark:bg-slate-900 rounded animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-900 rounded animate-pulse" />
      </div>
      <div className="flex-1 flex items-center justify-center py-6 animate-pulse">
        <div className="h-full w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg animate-pulse" />
      </div>
      <div className="h-6 w-full bg-slate-100 dark:bg-slate-900 rounded animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">Applicant Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-sans">
            Simplified visualization of candidate yields, psychometric checkouts, and process drop-off rates.
          </p>
        </div>

        <div className="flex items-center gap-2 font-sans">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors disabled:opacity-50 cursor-pointer font-sans"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync GAS Data
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans font-sans">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            {/* Total Applied */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4 shadow-sm relative overflow-hidden font-sans">
              <div className="absolute top-0 left-0 h-full w-1.5 bg-indigo-500" />
              <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-sans">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Total Applied</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5 block font-sans">
                  {summary.totalApplicants}
                </span>
              </div>
            </div>

            {/* Test Completion % */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4 shadow-sm relative overflow-hidden font-sans font-sans">
              <div className="absolute top-0 left-0 h-full w-1.5 bg-emerald-500" />
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-sans font-sans">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans font-sans">Test Completion %</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5 block font-sans font-sans">
                  {testCompletionPercent}%
                </span>
              </div>
            </div>

            {/* No-Show % */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4 shadow-sm relative overflow-hidden font-sans">
              <div className="absolute top-0 left-0 h-full w-1.5 bg-rose-500" />
              <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-sans">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">No-Show %</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5 block font-sans">
                  {noShowPercent}%
                </span>
              </div>
            </div>

            {/* Hired */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4 shadow-sm relative overflow-hidden font-sans">
              <div className="absolute top-0 left-0 h-full w-1.5 bg-cyan-500" />
              <div className="rounded-lg bg-cyan-50 p-2.5 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 font-sans">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Hired</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5 block font-sans">
                  {hiredCount}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Row 1: Applications by Position & Application Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Card: Applications by Position */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex flex-col shadow-sm font-sans font-sans">
              <div className="flex items-center justify-between gap-4 mb-4 font-sans">
                <div className="flex items-center gap-2 font-sans">
                  <BarChart3 className="h-4.5 w-4.5 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">Applications by Position</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Distribution of candidate applications across vacancies</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalCard("pos")}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer font-sans"
                  title="Expand Graph & View Data"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center font-sans font-sans">
                {renderChart("pos")}
              </div>
            </div>

            {/* Card: Application Outcome */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex flex-col shadow-sm font-sans">
              <div className="flex items-center justify-between gap-4 mb-4 font-sans">
                <div className="flex items-center gap-2 font-sans">
                  <FileText className="h-4.5 w-4.5 text-emerald-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">Application Outcome</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Visualization of successful vs failed candidates</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalCard("outcome")}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer font-sans"
                  title="Expand Graph & View Data"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center font-sans">
                {renderChart("outcome")}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Row 2: Test Completion & Interview & No-Show */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Card: Test Completion */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex flex-col shadow-sm font-sans font-sans font-sans">
              <div className="flex items-center justify-between gap-4 mb-4 font-sans">
                <div className="flex items-center gap-2 font-sans">
                  <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans font-sans">Test Completion</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Comparison between completed vs incomplete test profiles</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalCard("comp")}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer font-sans"
                  title="Expand Graph & View Data"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center font-sans">
                {renderChart("comp")}
              </div>
            </div>

            {/* Card: Interview & No-Show */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex flex-col shadow-sm font-sans">
              <div className="flex items-center justify-between gap-4 mb-4 font-sans font-sans">
                <div className="flex items-center gap-2 font-sans">
                  <TrendingDown className="h-4.5 w-4.5 text-rose-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">Interview & No-Show</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Attendance comparison side-by-side grouped by role</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalCard("interview")}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer font-sans"
                  title="Expand Graph & View Data"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center font-sans">
                {renderChart("interview")}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Row 3: Hiring Process stage/level flow chart */}
      <div className="w-full font-sans">
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex flex-col shadow-sm font-sans">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2 font-sans">
                <Users className="h-5 w-5 text-cyan-500 font-sans" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">Hiring Process</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Pipeline stages progression with dynamic drop-off rates</p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalCard("funnel")}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer font-sans"
                title="Expand Graph & View Data"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 py-4 font-sans">
              {renderFunnelFlow(false)}
            </div>
          </div>
        )}
      </div>

      {/* Generation Timestamp display */}
      {!loading && summary.generatedAt && (
        <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right italic font-medium font-sans">
          Analytics snapshot updated: {new Date(summary.generatedAt).toLocaleString()}
        </div>
      )}

      {/* Pop-up Modal Overlay */}
      {activeModalCard && (() => {
        const config = cardConfigs[activeModalCard as keyof typeof cardConfigs];
        const Icon = config.icon;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto font-sans"
            onClick={() => setActiveModalCard(null)}
          >
            <div
              className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-scaleIn font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-900 pb-4 mb-5 font-sans">
                <div className="flex items-center gap-2.5 font-sans">
                  <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-900 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">{config.title} Details</h2>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">{config.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalCard(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer font-sans"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-stretch font-sans">
                {/* Visual Chart Panel (Left) */}
                <div className={`${activeModalCard === "funnel" ? "md:col-span-5" : "md:col-span-7"} bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 flex items-center justify-center border border-slate-100 dark:border-slate-900/60 min-h-[300px]`}>
                  {activeModalCard === "funnel" ? (
                    <div className="w-full flex items-center justify-center">
                      {renderFunnelFlow(true)}
                    </div>
                  ) : (
                    renderChart(activeModalCard, true)
                  )}
                </div>

                {/* Info and Data Table Panel (Right) */}
                <div className={`${activeModalCard === "funnel" ? "md:col-span-7" : "md:col-span-5"} flex flex-col justify-between space-y-4 font-sans`}>
                  <div className="space-y-3 font-sans">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Analysis Insight</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-sans">{config.explanation}</p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-900 pt-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-sans">Raw Numbers breakdown</h4>
                      <div className="border border-slate-100 dark:border-slate-900 rounded-lg overflow-hidden font-sans">
                        {renderTable(activeModalCard)}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-900">
                    <button
                      onClick={() => setActiveModalCard(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer font-sans"
                    >
                      Close Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
