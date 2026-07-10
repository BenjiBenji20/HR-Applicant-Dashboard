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
  HelpCircle,
  TrendingUp,
  Award,
  ChevronRight,
  Database
} from "lucide-react";
import { ApplicantFinalResult } from "../types";

interface DashboardTabProps {
  finalResults: ApplicantFinalResult[];
  onDeleteRows: (ids: string[]) => void;
  onDownloadRows: (ids: string[]) => void;
  onOpenAIModal: (applicant: ApplicantFinalResult) => void;
  onOpenRawScores: (id: string) => void;
  onPrintApplicant: (applicant: ApplicantFinalResult) => void;
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
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

  // Handle select-all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredApplicants.map((app) => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle single select checkbox
  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Trigger bulk delete
  const triggerBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIdsToDelete(selectedIds);
    setIsDeleteWarningOpen(true);
  };

  // Trigger single delete
  const triggerSingleDelete = (id: string) => {
    setIdsToDelete([id]);
    setIsDeleteWarningOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = () => {
    onDeleteRows(idsToDelete);
    // Clear selection if deleted rows were selected
    setSelectedIds(selectedIds.filter((id) => !idsToDelete.includes(id)));
    setIsDeleteWarningOpen(false);
    setIdsToDelete([]);
  };

  // Trigger bulk download
  const handleBulkDownload = () => {
    if (selectedIds.length === 0) return;
    onDownloadRows(selectedIds);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, Jane</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">You have {finalResults.length} applicant response records ready for review today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Applicants</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{finalResults.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pending AI Gen</p>
          <p className="text-2xl font-bold text-amber-600">
            {finalResults.filter(r => !r.psychometric).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">AI Assessed</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {finalResults.filter(r => r.psychometric).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Supervisory Track</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {finalResults.filter(r => r.metadata.supervisoryTest).length}
          </p>
        </div>
      </div>

      {/* Toolbar / Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 ? (
            <>
              <button
                onClick={handleBulkDownload}
                className="px-4 py-2 border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-slate-400" />
                Download Selected ({selectedIds.length})
              </button>
              <button
                onClick={triggerBulkDelete}
                className="px-4 py-2 border border-red-100 dark:border-red-950 bg-red-50 dark:bg-red-950/40 rounded-lg text-xs text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Selected
              </button>
            </>
          ) : (
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Review Records ({filteredApplicants.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
          
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden flex flex-col transition-all duration-200">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 border-b border-slate-200 dark:border-slate-850 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center border-r border-slate-100 dark:border-slate-850">
                  <input
                    type="checkbox"
                    checked={
                      filteredApplicants.length > 0 &&
                      selectedIds.length === filteredApplicants.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-4">Applicant & ID</th>
                <th className="p-4">Position</th>
                <th className="p-4">CFIT</th>
                <th className="p-4">Comprehension</th>
                <th className="p-4">Planning</th>
                <th className="p-4">16PF Sten</th>
                <th className="p-4">Supervisory Index</th>
                <th className="p-4 max-w-xs">AI Psychometric Summary</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((app) => {
                  const isSelected = selectedIds.includes(app.id);
                  const shortPsychometric = app.psychometric
                    ? app.psychometric.length > 50
                      ? `${app.psychometric.slice(0, 47)}...`
                      : app.psychometric
                    : "...";

                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors group ${
                        isSelected ? "bg-indigo-50/15 dark:bg-indigo-950/10" : ""
                      }`}
                    >
                      {/* Checkbox selector */}
                      <td className="p-4 text-center border-r border-slate-50 dark:border-slate-850">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(app.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Name / ID Click Action */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <button
                            onClick={() => onOpenRawScores(app.id)}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-left hover:underline flex items-center gap-1 group"
                            title="Click to view raw quantitative scores"
                          >
                            <span>{app.metadata.fullName}</span>
                            <Database className="h-3 w-3 text-slate-300 group-hover:text-indigo-500 dark:text-slate-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                          </button>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5" title="Final Result Key">
                            {app.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {app.intent.positionAppliedFor}
                      </td>

                      {/* CFIT */}
                      <td className="p-4">
                        <span className="inline-flex rounded-md bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-[10px] font-mono border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                          {app.scores.cfit}
                        </span>
                      </td>

                      {/* Comprehension */}
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">
                        {app.scores.comprehension}
                      </td>

                      {/* Planning */}
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {app.scores.planning}
                      </td>

                      {/* 16PF */}
                      <td className="p-4 font-mono text-purple-600 dark:text-purple-400 font-bold">
                        {app.scores["16pf"]}
                      </td>

                      {/* Supervisory total evaluation */}
                      <td className="p-4">
                        {app.metadata.supervisoryTest ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50">
                            {app.scores.supervisory?.totalEvaluation}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-600 italic">
                            Non-Supervisory
                          </span>
                        )}
                      </td>

                      {/* Truncated Psychometric summary */}
                      <td className="p-4 max-w-xs text-xs text-slate-500 dark:text-slate-400 font-medium italic truncate">
                        <span
                          className="hover:text-slate-700 dark:hover:text-slate-200 cursor-help"
                          title={app.psychometric || "Not generated yet"}
                        >
                          "{shortPsychometric}"
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAIModal(app)}
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                            title="AI Generate Report"
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onPrintApplicant(app)}
                            className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-100 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Print Form"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDownloadRows([app.id])}
                            className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-100 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Download JSON"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => triggerSingleDelete(app.id)}
                            className="p-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-4 py-12 text-center text-slate-400 dark:text-slate-500">
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
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 border border-red-50 dark:border-red-950/40"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Confirm Deletion of Record(s)
                </h3>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Are you absolutely sure you want to delete these applicant response entries?
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
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-4.5 py-2 font-semibold text-white hover:bg-red-500 shadow-sm transition-colors"
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
