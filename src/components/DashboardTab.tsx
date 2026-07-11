import React, { useState } from "react";
import {
  Search,
  Filter,
  Sparkles,
  Printer,
  Trash2,
  Download,
  Eye,
  AlertTriangle,
  Database
} from "lucide-react";
import { ApplicantSummary } from "../types";

interface DashboardTabProps {
  finalResults: ApplicantSummary[];
  onDeleteRows: (ids: string[]) => void;
  onDownloadRows: (ids: string[]) => void;
  onOpenAIModal: (applicant: ApplicantSummary) => void;
  onOpenRawScores: (id: string) => void;
  onPrintApplicant: (applicant: ApplicantSummary) => void;
}

export default function DashboardTab({
  finalResults,
  onDeleteRows,
  onDownloadRows,
  onOpenAIModal,
  onOpenRawScores,
  onPrintApplicant,
}: DashboardTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrack, setFilterTrack] = useState<"all" | "supervisory" | "standard">("all");
  
  // Delete warning states
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

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

  // Trigger single delete
  const triggerSingleDelete = (id: string) => {
    setIdsToDelete([id]);
    setIsDeleteWarningOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = () => {
    onDeleteRows(idsToDelete);
    setIsDeleteWarningOpen(false);
    setIdsToDelete([]);
  };

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
                            title="Download JSON"
                          >
                            <Download className="h-4 w-4 cursor-pointer" />
                          </button>
                          <button
                            onClick={() => triggerSingleDelete(app.id)}
                            className="p-1.5 text-red-550 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 cursor-pointer" />
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
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          app.metadata.supervisoryTest 
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

      {/* Delete Confirmation Warning Box */}
      {isDeleteWarningOpen && (
        <div
          id="delete-warning-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div
            id="delete-warning-modal"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Confirm Deletion of Record
                </h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you absolutely sure you want to delete this applicant response entry?
                  This action is irreversible and will remove all scores, psychometric reports, and metadata from active state memory.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 text-xs">
              <button
                id="cancel-delete-btn"
                onClick={() => {
                  setIsDeleteWarningOpen(false);
                  setIdsToDelete([]);
                }}
                className="rounded-lg bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-4.5 py-2 font-semibold text-white hover:bg-red-500 shadow-xs transition-colors cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
