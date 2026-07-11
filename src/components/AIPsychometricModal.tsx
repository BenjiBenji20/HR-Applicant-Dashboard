import React, { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, Save, RotateCw } from "lucide-react";
import { ApplicantSummary, ApplicantDetail } from "../types";

interface AIPsychometricModalProps {
  applicant: ApplicantSummary;
  details: ApplicantDetail | null;
  onClose: () => void;
  onSave: (id: string, updatedPsychometric: string) => void;
}

export default function AIPsychometricModal({
  applicant,
  details,
  onClose,
  onSave,
}: AIPsychometricModalProps) {
  const [loading, setLoading] = useState(false);
  const [psychometricText, setPsychometricText] = useState(details?.mentalAbility || "");
  const [error, setError] = useState<string | null>(null);

  // Trigger AI generation if the mentalAbility field is currently empty or upon initial load of the modal
  useEffect(() => {
    if (!details?.mentalAbility) {
      handleGenerate();
    } else {
      setPsychometricText(details.mentalAbility);
    }
  }, [applicant.id, details?.id]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-psychometric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicant, details }),
      });
      if (!response.ok) {
        throw new Error("Failed to contact the evaluation server.");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setPsychometricText(data.text || "");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during report generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave(applicant.id, psychometricText);
    onClose();
  };

  const pf16Summary = details?.detailed16pf
    ? `Stability: ${details.detailed16pf.emotionalStability}, Responsibility: ${details.detailed16pf.senseOfResponsibility}, Conscientiousness: ${details.detailed16pf.conscientiousness}, Sociability: ${details.detailed16pf.sociability}`
    : "No detailed 16PF profile available";

  return (
    <div
      id="ai-psychometric-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        id="ai-psychometric-content"
        className="relative flex flex-col w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 h-[70vh] min-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 animate-pulse">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                AI Psychometric Evaluation Report
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Powered by Gemini AI model analysis
              </p>
            </div>
          </div>
          <button
            id="close-ai-modal"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Table display of current applicant's final results */}
          <div className="overflow-hidden rounded-lg border border-slate-250 dark:border-slate-800">
            <div className="bg-slate-50 px-4 py-2.5 dark:bg-slate-950/50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Candidate Core Scores
              </span>
            </div>
            
            <table className="w-full text-left border-collapse text-xs">
              <tbody>
                <tr className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="bg-slate-50/50 px-4 py-2.5 font-semibold text-slate-500 dark:bg-slate-950/20 dark:text-slate-400 w-1/3 border-r border-slate-100 dark:border-slate-800">
                    Full Name
                  </td>
                  <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100 font-bold">
                    {applicant.metadata.fullName}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="bg-slate-50/50 px-4 py-2.5 font-semibold text-slate-500 dark:bg-slate-950/20 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                    Position Applied For
                  </td>
                  <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100 font-semibold">
                    {applicant.intent.positionAppliedFor}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="bg-slate-50/50 px-4 py-2.5 font-semibold text-slate-500 dark:bg-slate-950/20 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                    CFIT Cognitive Grade
                  </td>
                  <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100 font-mono">
                    {applicant.scores.cfit}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="bg-slate-50/50 px-4 py-2.5 font-semibold text-slate-500 dark:bg-slate-950/20 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                    Comprehension / Planning
                  </td>
                  <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100 font-medium">
                    {applicant.scores.comprehension} Comprehension &bull; {applicant.scores.planning} Planning
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="bg-slate-50/50 px-4 py-2.5 font-semibold text-slate-500 dark:bg-slate-950/20 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                    16PF Profile Summary
                  </td>
                  <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100">
                    {pf16Summary}
                  </td>
                </tr>
                {applicant.metadata.supervisoryTest && details?.supervisory && (
                  <tr>
                    <td className="bg-slate-50/50 px-4 py-2.5 font-semibold text-slate-500 dark:bg-slate-950/20 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                      Supervisory Index
                    </td>
                    <td className="px-4 py-2.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {applicant.scores.supervisoryTotalEvaluation} (Mgt: {details.supervisory.management}, Supv: {details.supervisory.supervision}, Employee: {details.supervisory.employeeRelations})
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* AI generated section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="ai-textarea" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Psychometric Summary Description
              </label>
              <button
                id="regenerate-report-btn"
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
              >
                <RotateCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                Regenerate Report
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-7 w-7 bg-indigo-600 items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </span>
                </div>
                <span className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Formulating psychological assessment insights...
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Synthesizing CFIT & 16PF profiles
                </span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-4 text-xs dark:border-red-950/30 dark:bg-red-950/20 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Generation Failed</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            ) : (
              <textarea
                id="ai-textarea"
                value={psychometricText}
                onChange={(e) => setPsychometricText(e.target.value)}
                placeholder="No psychometric report generated yet. Click Regenerate to invoke the evaluator."
                className="w-full h-36 rounded-lg border border-slate-200 p-3.5 text-xs text-slate-800 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none font-medium"
              />
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/30 rounded-b-xl">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            * Changes made here will overwrite the final psychometric column.
          </span>
          <div className="flex gap-2">
            <button
              id="cancel-ai-modal"
              onClick={onClose}
              className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-ai-modal"
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <Save className="h-3.5 w-3.5" />
              Save Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
