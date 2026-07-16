import React, { useEffect } from "react";
import { X, Cpu, BarChart3, AlertCircle, Award, Brain, FileText, Timer } from "lucide-react";
import { ApplicantSummary, ApplicantDetail } from "../types";

interface RawScoreModalProps {
  summary: ApplicantSummary | null;
  detail: ApplicantDetail | null;
  onClose: () => void;
}

export default function RawScoreModal({ summary, detail, onClose }: RawScoreModalProps) {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!summary) return null;

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
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Detailed Applicant Psychometric Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {summary.metadata.fullName} &bull; {summary.intent.positionAppliedFor}
              </p>
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
          {/* Metadata Block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60 text-xs border border-slate-100/50 dark:border-slate-850/50">
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
                {summary.metadata.supervisoryTest ? "Supervisory Track" : "Standard Track"}
              </p>
            </div>
          </div>

          {/* Section 1: Cognitive Performance */}
          <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              1. Cognitive Performance Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-white/70 dark:bg-slate-950/40 p-3.5 shadow-2xs border border-slate-100/50 dark:border-slate-850/30">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-bold">CFIT Fluid Intelligence</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{summary.scores.cfit}</p>
              </div>
              <div className="rounded-lg bg-white/70 dark:bg-slate-950/40 p-3.5 shadow-2xs border border-slate-100/50 dark:border-slate-850/30">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-bold">Verbal Comprehension</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{summary.scores.comprehension}</p>
              </div>
              <div className="rounded-lg bg-white/70 dark:bg-slate-950/40 p-3.5 shadow-2xs border border-slate-100/50 dark:border-slate-850/30">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-bold">Planning & Organization</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{summary.scores.planning}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Personality (16PF Table) */}
          {detail && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 16PF detailed table */}
              <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-3">
                  <Cpu className="h-4 w-4 text-purple-500" />
                  2. Detailed Personality Profile (16PF Table)
                </h4>
                <div className="overflow-hidden mt-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/60 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        <th className="p-2.5 font-bold">Dimension</th>
                        <th className="p-2.5 font-bold">Classification Rating</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-900 dark:text-slate-100 font-bold">
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Emotional Stability</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.emotionalStability}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Sense of Responsibility</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.senseOfResponsibility}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Conscientiousness</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.conscientiousness}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Assertiveness</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.assertiveness}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Confidence</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.confidence}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Flexibility</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.flexibility}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Open-Mindedness</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.openMindedness}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Self-Reliance</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.selfReliance}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Sociability</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.sociability}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Trust & Acceptance</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.trustAcceptance}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Objectivity</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.objectivity}</td>
                      </tr>
                      <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                        <td className="p-2.5">Optimism & Liveliness</td>
                        <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.detailed16pf.optimismLiveliness}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Supervisory Column */}
              <div className="space-y-6">
                {/* Supervisory competencies */}
                <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-emerald-500" />
                    Supervisory Leadership Capabilities
                  </h4>
                  {summary.metadata.supervisoryTest ? (
                    <div className="space-y-3">
                      <div className="overflow-hidden mt-2">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100/60 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                              <th className="p-2.5 font-bold">Competency Area</th>
                              <th className="p-2.5 font-bold">Rating</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-900 dark:text-slate-100 font-bold">
                            <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                              <td className="p-2.5">Management Logic</td>
                              <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.supervisory.management}</td>
                            </tr>
                            <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                              <td className="p-2.5">Supervision Quality</td>
                              <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.supervisory.supervision}</td>
                            </tr>
                            <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                              <td className="p-2.5">Employee Relations</td>
                              <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.supervisory.employeeRelations}</td>
                            </tr>
                            <tr className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                              <td className="p-2.5">Human Relations Practices</td>
                              <td className="p-2.5 text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.supervisory.humanRelationsPractices}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20 text-xs">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">Composite Evaluation:</span>
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                          {summary.scores.supervisoryTotalEvaluation}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      <AlertCircle className="h-6 w-6 mb-2.5 text-slate-300" />
                      <span className="text-xs font-semibold">Standard Evaluation Only</span>
                      <p className="text-[10px] mt-1 max-w-xs px-4 font-bold">This applicant did not take the supervisory test module (Rank-and-File Track).</p>
                    </div>
                  )}
                </div>

                {/* AI supervisory indexes (if applicable) */}
                {summary.metadata.supervisoryTest && (
                  <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-indigo-500" />
                      AI Supervisory Oversight Assessments
                    </h4>
                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Management & Operational Oversight Index</span>
                        <p className="text-slate-655 dark:text-slate-400 bg-white/70 dark:bg-slate-950/50 p-2.5 rounded-lg leading-relaxed italic font-bold">
                          "{detail.supervisoryIndexesAI.index1Assessment}"
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Consensus-Building & Team Dynamics Index</span>
                        <p className="text-slate-655 dark:text-slate-400 bg-white/70 dark:bg-slate-950/50 p-2.5 rounded-lg leading-relaxed italic font-bold">
                          "{detail.supervisoryIndexesAI.index2Assessment}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Applicant Consumed Time Analysis */}
          {detail?.allTestTimeConsumed && (
            <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-4">
                <Timer className="h-4 w-4 text-indigo-550" />
                3. Applicant Consumed Time Analysis
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

          {/* Section 4: Narrative Summary */}
          {detail?.mentalAbility && (
            <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-3.5">
                <FileText className="h-4 w-4 text-indigo-500" />
                4. Narrative Psychological Assessment
              </h4>
              <div className="h-32 overflow-y-auto text-xs text-slate-700 dark:text-slate-400 p-4 rounded-xl leading-relaxed font-semibold">
                {detail.mentalAbility}
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
    </div>
  );
}
