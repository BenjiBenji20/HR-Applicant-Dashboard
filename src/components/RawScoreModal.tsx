import React, { useEffect, useState } from "react";
import { X, Cpu, BarChart3, AlertCircle, Award, Brain, FileText, Timer, Pencil, Save, Loader2, Download } from "lucide-react";
import { ApplicantSummary, ApplicantDetail } from "../types/types";

interface RawScoreModalProps {
  summary: ApplicantSummary | null;
  detail: ApplicantDetail | null;
  onClose: () => void;
  onUpdateCompany?: (applicantId: string, newCompany: string) => void;
}

export default function RawScoreModal({ summary, detail, onClose, onUpdateCompany }: RawScoreModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [companyInput, setCompanyInput] = useState("");
  const [companyValue, setCompanyValue] = useState(summary?.metadata.company || "");
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companyError, setCompanyError] = useState("");
  const [isDownloadingForm, setIsDownloadingForm] = useState(false);
  const [formAlertModalOpen, setFormAlertModalOpen] = useState(false);

  const handleDownloadEmploymentForm = async () => {
    if (!summary) return;
    setIsDownloadingForm(true);
    try {
      const res = await fetch(`/api/applicants?action=employment_form&id=${encodeURIComponent(summary.id)}`);
      const json = await res.json();
      if (json.success && json.documentUrl) {
        window.open(json.documentUrl, "_blank");
      } else {
        setFormAlertModalOpen(true);
      }
    } catch (err) {
      setFormAlertModalOpen(true);
    } finally {
      setIsDownloadingForm(false);
    }
  };

  // Keep local companyValue in sync with summary prop
  useEffect(() => {
    if (summary) {
      setCompanyValue(summary.metadata.company || "");
    }
  }, [summary]);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditModalOpen) {
          setIsEditModalOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isEditModalOpen]);

  if (!summary) return null;

  const handleSaveCompany = async () => {
    if (!summary) return;
    try {
      setIsSavingCompany(true);
      setCompanyError("");
      const response = await fetch("/api/applicants?action=edit_company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: summary.id, company: companyInput.trim() }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "Failed to update company");
      }
      const updated = companyInput.trim() || "No Company Yet";
      setCompanyValue(updated);
      if (onUpdateCompany) {
        onUpdateCompany(summary.id, updated);
      }
      setIsEditModalOpen(false);
    } catch (err: any) {
      setCompanyError(err.message || "Error updating company");
    } finally {
      setIsSavingCompany(false);
    }
  };

  // Dynamic Section Numbering
  let sectionIdx = 3;
  const supervisorySectionNumber = summary.metadata.supervisoryTest ? sectionIdx++ : null;
  const personalitySectionNumber = sectionIdx++;
  const timeConsumedSectionNumber = sectionIdx++;

  const renderTimeTable = (title: string, testTimes: { [key: string]: any } | undefined) => {
    if (!testTimes) return null;
    const rows = Object.entries(testTimes);
    return (
      <div className="space-y-3 w-[90%] mx-auto">
        <h5 className="text-[11px] font-bold text-center text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mt-4">
          {title}
        </h5>
        <div className="overflow-hidden rounded-xl bg-slate-50/40 dark:bg-slate-950/20">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-900 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-3 text-left font-semibold">Test No.</th>
                <th className="p-3 text-left font-semibold">Consumed Time</th>
                <th className="p-3 text-right font-semibold">Time Limit</th>
                <th className="p-3 text-center font-semibold">Test Answered</th>
                <th className="p-3 text-center font-semibold">Item</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300 font-medium">
              {rows.map(([key, val]: [string, any]) => (
                <tr key={key} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                  <td className="p-3 text-left capitalize">{key.replace("test", "Test ")}</td>
                  <td className="p-3 text-left font-mono font-semibold text-slate-900 dark:text-slate-100">{val.consumedTime}</td>
                  <td className="p-3 text-right font-mono">{val.timeFrame}</td>
                  <td className="p-3 text-center font-mono">{val.testAnswered ?? "-"}</td>
                  <td className="p-3 text-center font-mono">{val.testItem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div
      id="raw-score-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        id="raw-score-modal-content"
        className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 transition-all duration-300 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/10">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Detailed Applicant Psychometric Profile
              </h3>
            </div>
          </div>
          <button
            id="close-raw-score-modal"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-450 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 cursor-pointer" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-6 space-y-6">
          {/* Top 3-Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
            {/* Grid 1: Full Name & Position */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                Applicant & Position
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                {summary.metadata.fullName} &bull; {summary.intent.positionAppliedFor}
              </h2>
            </div>

            {/* Grid 2: Company + Edit Icon */}
            <div className="flex items-center justify-between sm:justify-start gap-3 md:border-l border-slate-200 dark:border-slate-800 md:pl-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Company
                </span>
                <p className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {companyValue || "No Company Yet"}
                </p>
              </div>
              <button
                id="edit-company-btn"
                onClick={() => {
                  setCompanyInput(companyValue || "");
                  setIsEditModalOpen(true);
                  setCompanyError("");
                }}
                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Edit Company"
              >
                <Pencil className="h-3.5 w-3.5 cursor-pointer" />
                <span>Edit</span>
              </button>
            </div>

            {/* Grid 3: Applicant Employment Form */}
            <div className="flex items-center justify-between sm:justify-start gap-3 md:border-l border-slate-200 dark:border-slate-800 md:pl-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Employment Form
                </span>
                <button
                  id="download-employment-form-btn"
                  onClick={handleDownloadEmploymentForm}
                  disabled={isDownloadingForm}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs disabled:opacity-50"
                  title="Download Applicant Employment Form"
                >
                  {isDownloadingForm ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span>{isDownloadingForm ? "Checking..." : "Download Form"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Metadata Block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60 text-xs">
            <div>
              <span className="text-slate-450 dark:text-slate-500 block mb-0.5 font-medium">Email Address</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{summary.metadata.emailAddress}</p>
            </div>
            <div>
              <span className="text-slate-450 dark:text-slate-500 block mb-0.5 font-medium">Submitted On</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {new Date(summary.metadata.timestamp).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-450 dark:text-slate-500 block mb-0.5 font-medium">Assessment Track</span>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                {summary.metadata.supervisoryTest ? "Supervisory" : "Standard"}
              </p>
            </div>
            <div>
              <span className="text-slate-450 dark:text-slate-500 block mb-0.5 font-medium">Age</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{summary.metadata.age}</p>
            </div>
            <div>
              <span className="text-slate-450 dark:text-slate-500 block mb-0.5 font-medium">Education</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{summary.metadata.education}</p>
            </div>
            <div>
              <span className="text-slate-450 dark:text-slate-500 block mb-0.5 font-medium">Contact Number</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{summary.metadata.contactNumber}</p>
            </div>
          </div>

          {/* Section 1: Cognitive Performance */}
          <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              1. Cognitive Performance Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-white/70 dark:bg-slate-950/40 p-3.5 shadow-2xs">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-bold">CFIT Fluid Intelligence</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{summary.scores.cfit}</p>
              </div>
              <div className="rounded-lg bg-white/70 dark:bg-slate-950/40 p-3.5 shadow-2xs">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-bold">Verbal Comprehension</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{summary.scores.comprehension}</p>
              </div>
              <div className="rounded-lg bg-white/70 dark:bg-slate-950/40 p-3.5 shadow-2xs">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-bold">Planning & Organization</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{summary.scores.planning}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Personality (16PF Table & Narrative) */}
          {detail && (
            <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-1">
                <Cpu className="h-4 w-4 text-purple-500" />
                2. Detailed Personality Profile (16PF Table)
              </h4>

              {/* 16PF detailed tables split into 2 grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left 6 Dimensions */}
                <div className="overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/60 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        <th className="p-2.5 font-bold">Dimension</th>
                        <th className="p-2.5 font-bold">Classification Rating</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-900 dark:text-slate-100 font-bold">
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Emotional Stability</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.emotionalStability}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Sense of Responsibility</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.senseOfResponsibility}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Conscientiousness</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.conscientiousness}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Assertiveness</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.assertiveness}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Confidence</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.confidence}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Flexibility</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.flexibility}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Right 6 Dimensions */}
                <div className="overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/60 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        <th className="p-2.5 font-bold">Dimension</th>
                        <th className="p-2.5 font-bold">Classification Rating</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-900 dark:text-slate-100 font-bold">
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Open-Mindedness</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.openMindedness}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Self-Reliance</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.selfReliance}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Sociability</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.sociability}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Trust & Acceptance</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.trustAcceptance}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Objectivity</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.objectivity}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold">Optimism & Liveliness</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.optimismLiveliness}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Narrative Psychological Assessment - Full Width text box card inside Section 2 */}
              {detail.mentalAbility && (
                <div className="pt-4 border-t border-slate-150/40 dark:border-slate-850/50">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Narrative Psychological Assessment
                  </h5>
                  <div className="max-h-32 overflow-y-auto text-xs text-slate-700 dark:text-slate-400 bg-indigo-50/1 p-4 rounded-xl leading-relaxed font-bold">
                    {detail.mentalAbility}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Supervisory Leadership Capabilities (Supervisory Track Only) */}
          {summary.metadata.supervisoryTest && detail && (
            <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-emerald-500" />
                {supervisorySectionNumber}. Supervisory Leadership Capabilities
              </h4>

              {/* Grid with 4 competencies layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Management */}
                <div className="rounded-xl bg-white/70 dark:bg-slate-950/40 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Management</span>
                  <p className="text-slate-655 dark:text-slate-400 text-xs italic font-medium leading-relaxed">
                    "{detail.supervisoryIndexesAI.index1Assessment}"
                  </p>
                  <div className="text-xs text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center gap-1">
                    <span>•</span>
                    <span>{detail.supervisory.management}</span>
                  </div>
                </div>

                {/* Supervision */}
                <div className="rounded-xl bg-white/70 dark:bg-slate-950/40 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Supervision</span>
                  <p className="text-slate-655 dark:text-slate-400 text-xs italic font-medium leading-relaxed">
                    "{detail.supervisoryIndexesAI.index2Assessment}"
                  </p>
                  <div className="text-xs text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center gap-1">
                    <span>•</span>
                    <span>{detail.supervisory.supervision}</span>
                  </div>
                </div>

                {/* Employee Relations */}
                <div className="rounded-xl bg-white/70 dark:bg-slate-950/40 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Employee Relations</span>
                  <p className="text-slate-655 dark:text-slate-400 text-xs italic font-medium leading-relaxed">
                    "{detail.supervisoryIndexesAI.index3Assessment}"
                  </p>
                  <div className="text-xs text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center gap-1">
                    <span>•</span>
                    <span>{detail.supervisory.employeeRelations}</span>
                  </div>
                </div>

                {/* Human Relations Practices */}
                <div className="rounded-xl bg-white/70 dark:bg-slate-950/40 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Human Relations Practices</span>
                  <p className="text-slate-655 dark:text-slate-400 text-xs italic font-medium leading-relaxed">
                    "{detail.supervisoryIndexesAI.index4Assessment}"
                  </p>
                  <div className="text-xs text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center gap-1">
                    <span>•</span>
                    <span>{detail.supervisory.humanRelationsPractices}</span>
                  </div>
                </div>

                {/* Overall Evaluation Assessment (Separate Alone Grid) */}
                {detail.overAllAssessment && (
                  <div className="col-span-1 md:col-span-2 rounded-xl bg-white/70 dark:bg-slate-950/40 p-4 space-y-2 border border-emerald-100/60 dark:border-emerald-900/30">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                      Overall Evaluation Assessment
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {detail.overAllAssessment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: AI Generated Personality Assessment (Both Tracks) */}
          {detail?.aiGenPersonalityAssessment && (
            <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-purple-500" />
                {personalitySectionNumber}. AI Generated Personality Assessment
              </h4>
              <div className="max-h-32 overflow-y-auto text-xs text-slate-700 dark:text-slate-400 p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl leading-relaxed font-bold">
                {detail.aiGenPersonalityAssessment}
              </div>
            </div>
          )}

          {/* Section: Applicant Consumed Time Analysis (No changes) */}
          {detail?.allTestTimeConsumed && (
            <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-4">
                <Timer className="h-4 w-4 text-indigo-555" />
                {timeConsumedSectionNumber}. Applicant Consumed Time Analysis
              </h4>
              <div className="flex flex-col gap-6">
                {renderTimeTable("CFIT Test Time", detail.allTestTimeConsumed.cfitTestTime)}
                {renderTimeTable("Judgement & Comprehension Test Time", detail.allTestTimeConsumed.jcTestTime)}
                {renderTimeTable("FIT Planning Test Time", detail.allTestTimeConsumed.fitPlanningTestTime)}
                {renderTimeTable("16PF Test Time", detail.allTestTimeConsumed["16pfTestTime"])}
                {summary.metadata.supervisoryTest &&
                  renderTimeTable("Supervisory Test Time", detail.allTestTimeConsumed.supervTestTime)}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800/40">
          <button
            id="close-raw-score-modal-btn"
            onClick={onClose}
            className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 px-4.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-500 transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Company Edit Pop-up Modal */}
      {isEditModalOpen && (
        <div
          id="company-edit-modal-overlay"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => !isSavingCompany && setIsEditModalOpen(false)}
        >
          <div
            id="company-edit-modal-content"
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-indigo-500" />
                Edit Company
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSavingCompany}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold block text-slate-700 dark:text-slate-300">
                    {summary.metadata.fullName} &bull; {summary.intent.positionAppliedFor}
                  </span>
                  <span className="font-mono text-[10px]">ID: {summary.id}</span>
                </div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  placeholder="Enter company name..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  disabled={isSavingCompany}
                  autoFocus
                />
              </div>

              {companyError && (
                <p className="text-xs text-rose-500 font-medium">{companyError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingCompany}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCompany}
                  disabled={isSavingCompany}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {isSavingCompany ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save Company
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal when Employment Form is not available */}
      {formAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Form Unavailable
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Applicant Form Not Submitted
              </p>
            </div>
            <div className="pt-2">
              <button
                id="close-form-alert-btn"
                onClick={() => setFormAlertModalOpen(false)}
                className="w-full rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 py-2 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
