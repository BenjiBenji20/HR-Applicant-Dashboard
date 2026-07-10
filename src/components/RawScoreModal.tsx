import React from "react";
import { X, Cpu, Clipboard, BarChart3, AlertCircle } from "lucide-react";
import { ApplicantRawScore } from "../types";

interface RawScoreModalProps {
  rawScore: ApplicantRawScore | null;
  onClose: () => void;
}

export default function RawScoreModal({ rawScore, onClose }: RawScoreModalProps) {
  if (!rawScore) return null;

  const { cfit, comprehension, planning, "16pf": pf16, supervisory } = rawScore.scores;

  const totalCfit = cfit.test1 + cfit.test2 + cfit.test3 + cfit.test4;

  return (
    <div
      id="raw-score-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        id="raw-score-modal-content"
        className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Applicant Raw Score Details
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {rawScore.metadata.fullName} &bull; {rawScore.intent.positionAppliedFor}
              </p>
            </div>
          </div>
          <button
            id="close-raw-score-modal"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500">Email Address:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{rawScore.metadata.emailAddress}</p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Submission Timestamp:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {new Date(rawScore.metadata.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Section 1: CFIT Cognitive Performance */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-3">
              <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
              CFIT (Culture Fair Intelligence Test) Raw Scores
            </h4>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="rounded-md bg-slate-50/50 dark:bg-slate-950/40 p-2.5 border border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Series (T1)</span>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">{cfit.test1}</p>
              </div>
              <div className="rounded-md bg-slate-50/50 dark:bg-slate-950/40 p-2.5 border border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Classif. (T2)</span>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">{cfit.test2}</p>
              </div>
              <div className="rounded-md bg-slate-50/50 dark:bg-slate-950/40 p-2.5 border border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Matrices (T3)</span>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">{cfit.test3}</p>
              </div>
              <div className="rounded-md bg-slate-50/50 dark:bg-slate-950/40 p-2.5 border border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Topology (T4)</span>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">{cfit.test4}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Raw Score Sum:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalCfit} / 50</span>
            </div>
          </div>

          {/* Section 2: Core Cognitive Abilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Comprehension Test
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{comprehension}%</span>
                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  {comprehension >= 85 ? "Excellent" : comprehension >= 70 ? "Satisfactory" : "Review"}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${comprehension}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Tests comprehension of work standards, logical deduction, and verbal intelligence.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Planning Test
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{planning}%</span>
                <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                  {planning >= 85 ? "Strategic" : planning >= 70 ? "Methodical" : "Developing"}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${planning}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Measures capability to prioritize tasks, foresee risks, and design structured workflows.
              </p>
            </div>
          </div>

          {/* Section 3: 16PF & Supervisory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 16PF Personality Sten */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                16PF Sten Score
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{pf16}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500"> / 10 Sten</span>
                </div>
                <span className="text-[10px] font-medium bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 px-2 py-0.5 rounded-full">
                  {pf16 >= 8 ? "High Range" : pf16 >= 4 ? "Average Range" : "Low Range"}
                </span>
              </div>
              
              {/* Custom Sten range visualization */}
              <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 transition-all ${
                      i < pf16
                        ? "bg-purple-500 dark:bg-purple-400"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Sten 1-3 indicates highly reserved and reflective behavior; 4-7 average; 8-10 highly expressive, socially bold, or warm.
              </p>
            </div>

            {/* Supervisory Sub-section */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Supervisory Evaluation
              </h4>
              {supervisory ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1">
                      <span>Management:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{supervisory.management}/20</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1">
                      <span>Supervision:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{supervisory.supervision}/20</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1">
                      <span>Employee:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{supervisory.employee}/20</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1">
                      <span>Human Rels:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{supervisory.humanRels}/20</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded bg-indigo-50/50 p-2 dark:bg-indigo-950/20 text-xs">
                    <span className="font-medium text-indigo-700 dark:text-indigo-300">Composite Score:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {supervisory.scores.toFixed(2)} / 20
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-center text-slate-400 dark:text-slate-500">
                  <AlertCircle className="h-5 w-5 mb-1.5" />
                  <span className="text-[11px]">Supervisory Assessment Not Taken</span>
                  <p className="text-[9px] mt-0.5">Applied for non-supervisory rank-and-file track</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            id="close-raw-score-modal-btn"
            onClick={onClose}
            className="rounded-lg bg-slate-150 dark:bg-slate-800 px-4.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
