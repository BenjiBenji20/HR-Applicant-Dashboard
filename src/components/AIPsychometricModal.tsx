import React, { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, Save, RotateCw, ShieldAlert } from "lucide-react";
import { ApplicantSummary, ApplicantDetail } from "../types/types";

interface AIPsychometricModalProps {
  applicant: ApplicantSummary;
  details: ApplicantDetail | null;
  onClose: () => void;
  onSave: (id: string, updatedFields: Partial<ApplicantDetail>) => void;
}

// All GAS Web App credentials are proxied securely via /api/generate-psychometric?action=save

/**
 * Regex-based parser to extract JSON keys from an accumulating partial JSON stream.
 * This ensures that text fields stream live character-by-character.
 */
function parsePartialJson(jsonStr: string) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    const extractKey = (key: string) => {
      const regex = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"?`);
      const match = jsonStr.match(regex);
      if (match) {
        return match[1]
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\t/g, "\t");
      }
      return "";
    };
    return {
      mentalAbility: extractKey("mentalAbility"),
      index1Assessment: extractKey("index1Assessment"),
      index2Assessment: extractKey("index2Assessment"),
      index3Assessment: extractKey("index3Assessment"),
      index4Assessment: extractKey("index4Assessment"),
      aiGenPersonalityAssessment: extractKey("aiGenPersonalityAssessment"),
    };
  }
}

export default function AIPsychometricModal({
  applicant,
  details,
  onClose,
  onSave,
}: AIPsychometricModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states for assessments
  const [mentalAbilityText, setMentalAbilityText] = useState(details?.mentalAbility || "");
  const [index1Text, setIndex1Text] = useState(details?.supervisoryIndexesAI?.index1Assessment || "");
  const [index2Text, setIndex2Text] = useState(details?.supervisoryIndexesAI?.index2Assessment || "");
  const [index3Text, setIndex3Text] = useState(details?.supervisoryIndexesAI?.index3Assessment || "");
  const [index4Text, setIndex4Text] = useState(details?.supervisoryIndexesAI?.index4Assessment || "");
  const [personalityText, setPersonalityText] = useState(details?.aiGenPersonalityAssessment || "");

  // Detect if AI reports already exist
  const hasExistingAssessment = !!(
    details?.mentalAbility ||
    details?.aiGenPersonalityAssessment ||
    details?.supervisoryIndexesAI?.index1Assessment
  );

  // Sync state with details changes
  useEffect(() => {
    setMentalAbilityText(details?.mentalAbility || "");
    setIndex1Text(details?.supervisoryIndexesAI?.index1Assessment || "");
    setIndex2Text(details?.supervisoryIndexesAI?.index2Assessment || "");
    setIndex3Text(details?.supervisoryIndexesAI?.index3Assessment || "");
    setIndex4Text(details?.supervisoryIndexesAI?.index4Assessment || "");
    setPersonalityText(details?.aiGenPersonalityAssessment || "");
    setError(null);
    setSaveStatus(null);
  }, [applicant.id, details?.id]);

  // Streaming AI content generation
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSaveStatus(null);
    
    // Clear old values before generating
    setMentalAbilityText("");
    setIndex1Text("");
    setIndex2Text("");
    setIndex3Text("");
    setIndex4Text("");
    setPersonalityText("");

    try {
      const response = await fetch("/api/generate-psychometric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicant, details }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact the evaluation server.");
      }

      if (!response.body) {
        throw new Error("No response stream available.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: !done });
        accumulated += chunk;

        const parsed = parsePartialJson(accumulated);
        if (parsed.mentalAbility) setMentalAbilityText(parsed.mentalAbility);
        if (parsed.index1Assessment) setIndex1Text(parsed.index1Assessment);
        if (parsed.index2Assessment) setIndex2Text(parsed.index2Assessment);
        if (parsed.index3Assessment) setIndex3Text(parsed.index3Assessment);
        if (parsed.index4Assessment) setIndex4Text(parsed.index4Assessment);
        if (parsed.aiGenPersonalityAssessment) setPersonalityText(parsed.aiGenPersonalityAssessment);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during report generation.");
    } finally {
      setLoading(false);
    }
  };

  // Saves reports back to Google Sheets via secure Vercel/Express proxy and local React state
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);

    const payload = {
      id: applicant.id,
      mentalAbility: mentalAbilityText,
      index1Assessment: index1Text,
      index2Assessment: index2Text,
      index3Assessment: index3Text,
      index4Assessment: index4Text,
      aiGenPersonalityAssessment: personalityText,
    };

    try {
      const response = await fetch("/api/generate-psychometric?action=save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "Failed to save reports to Google Sheets.");
      }

      // Update parent component state and localStorage
      onSave(applicant.id, {
        mentalAbility: mentalAbilityText,
        aiGenPersonalityAssessment: personalityText,
        supervisoryIndexesAI: {
          index1Assessment: index1Text,
          index2Assessment: index2Text,
          index3Assessment: index3Text,
          index4Assessment: index4Text,
        },
      });

      setSaveStatus({ type: "success", message: "Report successfully saved to Google Sheets!" });
      
      // Auto close modal on success after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setSaveStatus({
        type: "error",
        message: err.message || "Failed to update spreadsheet. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="ai-psychometric-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        id="ai-psychometric-content"
        className="relative flex flex-col w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Sparkles className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                AI Psychometric & Leadership Report
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Augmented evaluation powered by Gemini AI Model
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Diagnostic status warnings */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-4 text-xs dark:border-red-950/30 dark:bg-red-950/20 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {saveStatus && (
            <div className={`flex items-start gap-3 rounded-lg border p-4 text-xs ${
              saveStatus.type === "success" 
                ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-950/30 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                : "border-red-100 bg-red-50/50 dark:border-red-950/30 dark:bg-red-950/20 text-red-600 dark:text-red-400"
            }`}>
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{saveStatus.type === "success" ? "Success" : "Error"}</p>
                <p className="mt-0.5">{saveStatus.message}</p>
              </div>
            </div>
          )}

          {/* Prompt Skip Logic State */}
          {hasExistingAssessment && !loading && (
            <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/30 dark:border-indigo-950/20 dark:bg-indigo-950/10 p-4 text-xs text-indigo-755 dark:text-indigo-300">
              <Sparkles className="h-4.5 w-4.5 shrink-0 text-indigo-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Existing AI Assessments Found</p>
                <p className="font-medium text-slate-500 dark:text-slate-400">
                  This candidate already has AI-generated profiles saved. Generating again will override current text fields.
                </p>
                <button
                  onClick={handleGenerate}
                  className="mt-1 flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <RotateCw className="h-3 w-3" /> Regenerate AI Report
                </button>
              </div>
            </div>
          )}

          {!hasExistingAssessment && !loading && !mentalAbilityText && (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 bg-slate-50/40 dark:bg-slate-950/10">
              <Sparkles className="h-8 w-8 text-indigo-500/80 animate-pulse" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No AI Assessment Generated Yet</p>
              <p className="text-xs text-slate-450 dark:text-slate-500 text-center max-w-sm">
                Generate professional cognitive, leadership indices, and personality summaries based on candidate's raw scores.
              </p>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate AI Assessment Report
              </button>
            </div>
          )}

          {/* 1. Cognitive Performance Profile */}
          <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-2 mb-4">
              <span>1. Cognitive Performance Profile</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-white dark:bg-slate-950/40 p-3.5 border border-slate-200/50 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-bold">CFIT Fluid Intelligence</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{applicant.scores.cfit}</p>
              </div>
              <div className="rounded-lg bg-white dark:bg-slate-950/40 p-3.5 border border-slate-200/50 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-bold">Verbal Comprehension</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{applicant.scores.comprehension}</p>
              </div>
              <div className="rounded-lg bg-white dark:bg-slate-950/40 p-3.5 border border-slate-200/50 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider font-bold">Planning & Organization</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{applicant.scores.planning}</p>
              </div>
            </div>
          </div>

          {/* 2. Detailed Personality Profile (16PF Table) */}
          {details && (
            <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20 space-y-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-2 mb-1">
                <span>2. Detailed Personality Profile (16PF Table)</span>
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                {/* Left 6 Dimensions */}
                <div className="overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/60 dark:bg-slate-900/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        <th className="p-2 font-bold">Dimension</th>
                        <th className="p-2 font-bold">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-900 dark:text-slate-100 font-bold">
                      <tr className="border-b border-slate-100 dark:border-slate-800/30">
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Emotional Stability</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.emotionalStability}</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/30">
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Sense of Responsibility</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.senseOfResponsibility}</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/30">
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Conscientiousness</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.conscientiousness}</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/30">
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Assertiveness</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.assertiveness}</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/30">
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Confidence</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.confidence}</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Flexibility</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.flexibility}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Right 6 Dimensions */}
                <div className="overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/60 dark:bg-slate-900/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        <th className="p-2 font-bold">Dimension</th>
                        <th className="p-2 font-bold">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-900 dark:text-slate-100 font-bold">
                      <tr className="border-b border-slate-100 dark:border-slate-800/30">
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Open-Mindedness</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.openMindedness}</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/30">
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Self-Reliance</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.selfReliance}</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/30">
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Sociability</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.sociability}</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/30">
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Trust & Acceptance</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.trustAcceptance}</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/30">
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Objectivity</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.objectivity}</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium text-slate-655 dark:text-slate-400">Optimism & Liveliness</td>
                        <td className="p-2 text-indigo-600 dark:text-indigo-400 font-extrabold">{details.detailed16pf.optimismLiveliness}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Generated Personality Assessment (Both Tracks) */}
              {(personalityText || loading) && (
                <div className="space-y-2.5">
                  <label htmlFor="ai-personality-textarea" className="text-xs font-bold text-slate-650 dark:text-slate-400 block">
                    AI Generated Personality Assessment
                  </label>
                  <textarea
                    id="ai-personality-textarea"
                    value={personalityText}
                    onChange={(e) => setPersonalityText(e.target.value)}
                    disabled={loading}
                    placeholder={loading ? "Synthesizing personality insights..." : "No personality summary generated yet."}
                    className="w-full h-24 rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-955 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none font-bold"
                  />
                </div>
              )}
            </div>
          )}

          {/* 3. Supervisory Leadership Capabilities (Supervisory Track Only) */}
          {applicant.metadata.supervisoryTest && details && (
            <div className="rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-2 mb-1">
                <span>3. Supervisory Leadership Capabilities</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Management */}
                <div className="rounded-xl bg-white dark:bg-slate-950/40 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Management</span>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-extrabold">{details.supervisory.management}</span>
                  </div>
                  <textarea
                    value={index1Text}
                    onChange={(e) => setIndex1Text(e.target.value)}
                    disabled={loading}
                    placeholder={loading ? "Analyzing Management index..." : "No assessment generated."}
                    className="w-full h-16 rounded-lg border border-slate-100 p-2.5 text-xs text-slate-655 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none resize-none font-medium italic leading-relaxed"
                  />
                </div>

                {/* Supervision */}
                <div className="rounded-xl bg-white dark:bg-slate-950/40 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Supervision</span>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-extrabold">{details.supervisory.supervision}</span>
                  </div>
                  <textarea
                    value={index2Text}
                    onChange={(e) => setIndex2Text(e.target.value)}
                    disabled={loading}
                    placeholder={loading ? "Analyzing Supervision index..." : "No assessment generated."}
                    className="w-full h-16 rounded-lg border border-slate-100 p-2.5 text-xs text-slate-655 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none resize-none font-medium italic leading-relaxed"
                  />
                </div>

                {/* Employee Relations */}
                <div className="rounded-xl bg-white dark:bg-slate-950/40 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Employee Relations</span>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-extrabold">{details.supervisory.employeeRelations}</span>
                  </div>
                  <textarea
                    value={index3Text}
                    onChange={(e) => setIndex3Text(e.target.value)}
                    disabled={loading}
                    placeholder={loading ? "Analyzing Employee Relations index..." : "No assessment generated."}
                    className="w-full h-16 rounded-lg border border-slate-100 p-2.5 text-xs text-slate-655 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none resize-none font-medium italic leading-relaxed"
                  />
                </div>

                {/* Human Relations Practices */}
                <div className="rounded-xl bg-white dark:bg-slate-950/40 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Human Relations Practices</span>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-extrabold">{details.supervisory.humanRelationsPractices}</span>
                  </div>
                  <textarea
                    value={index4Text}
                    onChange={(e) => setIndex4Text(e.target.value)}
                    disabled={loading}
                    placeholder={loading ? "Analyzing Human Relations practices..." : "No assessment generated."}
                    className="w-full h-16 rounded-lg border border-slate-100 p-2.5 text-xs text-slate-655 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none resize-none font-medium italic leading-relaxed"
                  />
                </div>

                {/* Overall Evaluation Assessment (Separate Alone Grid) */}
                {details.overAllAssessment && (
                  <div className="col-span-1 md:col-span-2 rounded-xl bg-white dark:bg-slate-950/40 p-4 space-y-2 border border-emerald-100/60 dark:border-emerald-900/30">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                      Overall Evaluation Assessment
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {details.overAllAssessment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Mental Ability Evaluation / Psychometric Summary */}
          {(mentalAbilityText || loading) && (
            <div className="space-y-2.5 rounded-xl p-5 bg-slate-50/55 dark:bg-slate-950/20">
              <label htmlFor="ai-textarea" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Cognitive & Mental Ability Summary
              </label>
              <textarea
                id="ai-textarea"
                value={mentalAbilityText}
                onChange={(e) => setMentalAbilityText(e.target.value)}
                disabled={loading}
                placeholder={loading ? "Analyzing CFIT fluid intelligence and planning profiles..." : "No mental ability assessment generated yet."}
                className="w-full h-24 rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-955 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none font-bold"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/30 rounded-b-xl">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span>* Saving will overwrite columns AF, AG-AJ, AL in "Final Results".</span>
          </div>
          <div className="flex gap-2">
            <button
              id="cancel-ai-modal"
              onClick={onClose}
              disabled={loading || saving}
              className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="save-ai-modal"
              onClick={handleSave}
              disabled={loading || saving || !mentalAbilityText}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              {saving ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? "Saving..." : "Save Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
