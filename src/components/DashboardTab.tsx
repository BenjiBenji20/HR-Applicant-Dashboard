import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Sparkles,
  Printer,
  Download,
  Eye,
  Database
} from "lucide-react";
import { ApplicantSummary } from "../types/types";

interface DashboardTabProps {
  finalResults: ApplicantSummary[];
  onDownloadRows: (ids: string[]) => void;
  onOpenAIModal: (applicant: ApplicantSummary) => void;
  onOpenRawScores: (id: string) => void;
  onPrintApplicant: (applicant: ApplicantSummary) => void;
}

export default function DashboardTab({
  finalResults,
  onDownloadRows,
  onOpenAIModal,
  onOpenRawScores,
  onPrintApplicant,
}: DashboardTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrack, setFilterTrack] = useState<"all" | "supervisory" | "standard">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filtered applicants
  const filteredApplicants = finalResults.filter((app) => {
    const matchesSearch =
      app.metadata.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.metadata.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.intent.positionAppliedFor.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterTrack === "supervisory") {
      return matchesSearch && app.metadata.supervisoryTest;
    }
    if (filterTrack === "standard") {
      return matchesSearch && !app.metadata.supervisoryTest;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Section Skeleton */}
        <div className="mb-8 space-y-2.5">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-900 rounded-lg" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="h-3.5 w-24 bg-slate-100 dark:bg-slate-900 rounded" />
            <div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="h-3.5 w-28 bg-slate-100 dark:bg-slate-900 rounded" />
            <div className="h-7 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="h-3.5 w-24 bg-slate-100 dark:bg-slate-900 rounded" />
            <div className="h-7 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>

        {/* Toolbar Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-4">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-48 sm:w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[400px]">
          <div className="h-12 bg-slate-50 dark:bg-slate-900/60 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-6">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded shrink-0" />
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded shrink-0" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded shrink-0" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded shrink-0 flex-1" />
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0 w-44" />
          </div>
          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-900 px-6 py-2 space-y-4">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="flex items-center gap-6 pt-4">
                <div className="h-7 w-28 bg-slate-100 dark:bg-slate-900 rounded-lg shrink-0" />
                <div className="h-3 w-12 bg-slate-100 dark:bg-slate-900 rounded shrink-0" />
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-900 rounded shrink-0" />
                <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded shrink-0 flex-1" />
                <div className="h-3 w-40 bg-slate-100 dark:bg-slate-900 rounded-lg shrink-0 w-44" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, Jane</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">You have {finalResults.length} applicant response records ready for review today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Applicants</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{finalResults.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Supervisory Track</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {finalResults.filter(r => r.metadata.supervisoryTest).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Standard Track</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {finalResults.filter(r => !r.metadata.supervisoryTest).length}
          </p>
        </div>
      </div>

      {/* Toolbar / Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Review Records ({filteredApplicants.length})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterTrack}
              onChange={(e: any) => setFilterTrack(e.target.value)}
              className="bg-transparent font-semibold text-slate-600 dark:text-slate-300 outline-none cursor-pointer text-xs"
            >
              <option value="all">All Tracks</option>
              <option value="supervisory">Supervisory</option>
              <option value="standard">Standard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container (scrollable-xy table) */}
      <div className="bg-white rounded-xl shadow-xs overflow-hidden flex flex-col transition-all duration-200 dark:bg-slate-950">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 text-left w-48 min-w-[180px] whitespace-nowrap">Actions</th>
                <th className="p-4 w-24 min-w-[90px] whitespace-nowrap">ID</th>
                <th className="p-4 w-28 min-w-[110px] whitespace-nowrap">Date</th>
                <th className="p-4 w-40 min-w-[160px] whitespace-nowrap">Full Name</th>
                <th className="p-4 w-56 min-w-[220px] whitespace-nowrap">Email</th>
                <th className="p-4 w-56 min-w-[220px] whitespace-nowrap">Position</th>
                <th className="p-4 w-28 min-w-[110px] whitespace-nowrap">Supervisory</th>
                <th className="p-4 w-24 min-w-[90px] whitespace-nowrap">CFIT</th>
                <th className="p-4 w-32 min-w-[130px] whitespace-nowrap">Comprehension</th>
                <th className="p-4 w-32 min-w-[130px] whitespace-nowrap">Planning</th>
                <th className="p-4 w-40 min-w-[160px] whitespace-nowrap">Total Evaluation</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((app, index) => {
                  const zebraBg = index % 2 === 0 ? "bg-white dark:bg-slate-950" : "bg-slate-50/40 dark:bg-slate-900/10";
                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors group ${zebraBg}`}
                    >
                      {/* Actions */}
                      <td className="p-4 w-48 min-w-[180px] whitespace-nowrap">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onOpenRawScores(app.id)}
                            className="p-1.5 text-slate-500 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 cursor-pointer" />
                          </button>
                          <button
                            onClick={() => onOpenAIModal(app)}
                            className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 rounded-lg transition-colors cursor-pointer"
                            title="AI Generate Report"
                          >
                            <Sparkles className="h-4 w-4 cursor-pointer" />
                          </button>
                          <button
                            onClick={() => onPrintApplicant(app)}
                            className="p-1.5 text-slate-500 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Print Form"
                          >
                            <Printer className="h-4 w-4 cursor-pointer" />
                          </button>
                          <button
                            onClick={() => onDownloadRows([app.id])}
                            className="p-1.5 text-slate-500 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4 cursor-pointer" />
                          </button>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="p-4 w-24 min-w-[90px] whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-450">
                        {app.id.slice(0, 8)}
                      </td>

                      {/* Date */}
                      <td className="p-4 w-28 min-w-[110px] whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {app.intent.date}
                      </td>

                      {/* Full Name */}
                      <td className="p-4 w-40 min-w-[160px] whitespace-nowrap text-slate-900 dark:text-slate-400">
                        {app.metadata.fullName}
                      </td>

                      {/* Email */}
                      <td className="p-4 w-56 min-w-[220px] whitespace-nowrap text-slate-650 dark:text-slate-400">
                        {app.metadata.emailAddress}
                      </td>

                      {/* Position */}
                      <td className="p-4 w-56 min-w-[220px] whitespace-nowrap text-slate-700 dark:text-slate-400">
                        {app.intent.positionAppliedFor}
                      </td>

                      {/* Supervisory */}
                      <td className="p-4 w-28 min-w-[110px] whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${app.metadata.supervisoryTest
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                          }`}>
                          {app.metadata.supervisoryTest ? "Yes" : "No"}
                        </span>
                      </td>

                      {/* CFIT */}
                      <td className="p-4 w-24 min-w-[90px] whitespace-nowrap text-slate-800 dark:text-slate-400">
                        {app.scores.cfit}
                      </td>

                      {/* Comprehension */}
                      <td className="p-4 w-32 min-w-[130px] whitespace-nowrap text-slate-750 dark:text-slate-400">
                        {app.scores.comprehension}
                      </td>

                      {/* Planning */}
                      <td className="p-4 w-32 min-w-[130px] whitespace-nowrap text-slate-700 dark:text-slate-400">
                        {app.scores.planning}
                      </td>

                      {/* Total Evaluation */}
                      <td className="p-4 w-40 min-w-[160px] whitespace-nowrap">
                        {app.metadata.supervisoryTest ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                            {app.scores.supervisoryTotalEvaluation}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-600 italic">
                            Non-Supervisory
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="p-4 py-12 text-center text-slate-400 dark:text-slate-500">
                    <Database className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-2.5" />
                    <p className="text-sm font-medium">No candidate responses found</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Try adjusting your search criteria or filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
