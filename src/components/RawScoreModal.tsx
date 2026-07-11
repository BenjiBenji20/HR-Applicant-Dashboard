import React from "react";
import { X, Cpu, Clipboard, BarChart3, AlertCircle, Award, Brain, FileText } from "lucide-react";
import { ApplicantSummary, ApplicantDetail } from "../types";

interface RawScoreModalProps {
  summary: ApplicantSummary | null;
  detail: ApplicantDetail | null;
  onClose: () => void;
}

export default function RawScoreModal({ summary, detail, onClose }: RawScoreModalProps) {
  if (!summary) return null;

  return (
    <div
      id="raw-score-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        id="raw-score-modal-content"
        className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Detailed Applicant Psychometric Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {summary.metadata.fullName} &bull; {summary.intent.positionAppliedFor}
              </p>
            </div>
          </div>
          <button
            id="close-raw-score-modal"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-6 space-y-6">
          {/* Metadata Block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60 text-xs border border-slate-150/40 dark:border-slate-850">
            <div>
              <span className="text-slate-450 dark:text-slate-500 block mb-0.5">Email Address</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{summary.metadata.emailAddress}</p>
            </div>
            <div>
              <span className="text-slate-450 dark:text-slate-500 block mb-0.5">Submitted On</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {new Date(summary.metadata.timestamp).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-450 dark:text-slate-500 block mb-0.5">Assessment Track</span>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                {summary.metadata.supervisoryTest ? "Supervisory Track" : "Standard Track"}
              </p>
            </div>
          </div>

          {/* Section 1: Cognitive Performance */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Cognitive Aptitude Profile (Classifications)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-slate-50/50 dark:bg-slate-950/40 p-3.5 border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">CFIT Fluid Intelligence</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{summary.scores.cfit}</p>
              </div>
              <div className="rounded-lg bg-slate-50/50 dark:bg-slate-950/40 p-3.5 border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Verbal Comprehension</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{summary.scores.comprehension}</p>
              </div>
              <div className="rounded-lg bg-slate-50/50 dark:bg-slate-950/40 p-3.5 border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Planning & Organization</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{summary.scores.planning}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Personality (16PF Table) */}
          {detail && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 16PF detailed table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-3">
                  <Cpu className="h-4 w-4 text-purple-500" />
                  16PF Personality Dimensions
                </h4>
                <div className="overflow-hidden rounded-lg border border-slate-150 dark:border-slate-800 mt-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                        <th className="p-2.5">Dimension</th>
                        <th className="p-2.5">Classification Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                      <tr>
                        <td className="p-2.5 font-medium">Emotional Stability</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.emotionalStability}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Sense of Responsibility</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.senseOfResponsibility}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Conscientiousness</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.conscientiousness}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Assertiveness</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.assertiveness}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Confidence</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.confidence}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Flexibility</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.flexibility}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Open-Mindedness</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.openMindedness}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Self-Reliance</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.selfReliance}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Sociability</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.sociability}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Trust & Acceptance</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.trustAcceptance}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Objectivity</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.objectivity}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Optimism & Liveliness</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.detailed16pf.optimismLiveliness}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Supervisory Column */}
              <div className="space-y-6">
                {/* Supervisory competencies */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-emerald-500" />
                    Supervisory Leadership Capabilities
                  </h4>
                  {summary.metadata.supervisoryTest ? (
                    <div className="space-y-3">
                      <div className="overflow-hidden rounded-lg border border-slate-150 dark:border-slate-800 mt-2">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                              <th className="p-2.5">Competency Area</th>
                              <th className="p-2.5">Rating</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                            <tr>
                              <td className="p-2.5 font-medium">Management Logic</td>
                              <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.supervisory.management}</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-medium">Supervision Quality</td>
                              <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.supervisory.supervision}</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-medium">Employee Relations</td>
                              <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.supervisory.employeeRelations}</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-medium">Human Relations Practices</td>
                              <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-150">{detail.supervisory.humanRelationsPractices}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20 text-xs border border-emerald-100/30">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300">Composite Evaluation:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                          {summary.scores.supervisoryTotalEvaluation}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      <AlertCircle className="h-6 w-6 mb-2.5 text-slate-300" />
                      <span className="text-xs font-semibold">Standard Evaluation Only</span>
                      <p className="text-[10px] mt-1 max-w-xs px-4">This applicant did not take the supervisory test module (Rank-and-File Track).</p>
                    </div>
                  )}
                </div>

                {/* AI supervisory indexes (if applicable) */}
                {summary.metadata.supervisoryTest && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950/20 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-indigo-500" />
                      AI Supervisory Oversight Assessments
                    </h4>
                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">Management & Operational Oversight Index</span>
                        <p className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 leading-relaxed italic">
                          "{detail.supervisoryIndexesAI.index1Assessment}"
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">Consensus-Building & Team Dynamics Index</span>
                        <p className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 leading-relaxed italic">
                          "{detail.supervisoryIndexesAI.index2Assessment}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Narrative summary */}
          {detail?.mentalAbility && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-3.5">
                <FileText className="h-4 w-4 text-indigo-500" />
                Narrative Psychological Assessment
              </h4>
              <p className="text-xs text-slate-650 dark:text-slate-350 bg-indigo-50/15 p-4 rounded-xl border border-indigo-100/20 dark:border-indigo-950/25 leading-relaxed">
                {detail.mentalAbility}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            id="close-raw-score-modal-btn"
            onClick={onClose}
            className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
