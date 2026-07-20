import React from "react";
import { ApplicantSummary, ApplicantDetail } from "../types/types";

interface PrintPreviewProps {
  applicant: ApplicantSummary | null;
  details: ApplicantDetail | null;
}

const RATINGS = ["L", "BA", "LA", "A", "HA", "AA", "S"] as const;

const getAbbr = (val?: string): string => {
  if (!val) return "";
  const lower = val.trim().toLowerCase();
  if (lower === "low") return "L";
  if (lower === "below average") return "BA";
  if (lower === "low average") return "LA";
  if (lower === "average") return "A";
  if (lower === "high average") return "HA";
  if (lower === "above average") return "AA";
  if (lower === "superior") return "S";
  return "";
};

export default function PrintPreview({ applicant, details }: PrintPreviewProps) {
  if (!applicant) return null;

  const isSupervisory = Boolean(applicant.metadata.supervisoryTest);

  const renderRatingTable = (title: string, rows: { label: string; rating?: string }[]) => (
    <div className="mb-5">
      <div className="bg-slate-800/90 text-white font-bold text-xs px-3 py-1 uppercase tracking-wider">
        {title}
      </div>
      <table className="w-full border-collapse border border-slate-400 text-[11px] bg-white/90">
        <thead>
          <tr className="bg-slate-100/90 border-b border-slate-400">
            <th className="p-1.5 text-left font-bold text-slate-800 border-r border-slate-400 w-1/2">
              Parameter
            </th>
            {RATINGS.map((r, i) => (
              <th
                key={r}
                className={`p-1 text-center font-bold text-slate-800 border-r border-slate-400 ${i === RATINGS.length - 1 ? "border-r-0" : ""
                  } w-[7%]`}
              >
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const abbr = getAbbr(row.rating);
            return (
              <tr key={idx} className="border-b border-slate-300">
                <td className="p-1.5 font-medium text-slate-800 border-r border-slate-400">
                  {row.label}
                </td>
                {RATINGS.map((r, i) => {
                  const isMatched = abbr === r;
                  return (
                    <td
                      key={r}
                      className={`p-1 text-center font-bold text-xs border-r border-slate-400 ${i === RATINGS.length - 1 ? "border-r-0" : ""
                        } ${isMatched ? "bg-slate-800 text-white font-extrabold" : "text-slate-300"
                        }`}
                    >
                      {isMatched ? "✓" : ""}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderTimeTable = (title: string, testTimes: { [key: string]: any } | undefined) => {
    if (!testTimes) return null;
    const rows = Object.entries(testTimes);
    return (
      <div className="mb-4">
        <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
          {title}
        </h5>
        <div className="overflow-hidden border border-slate-400 bg-white/90 text-[10px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-800 font-bold uppercase border-b border-slate-400">
                <th className="p-1.5 text-left border-r border-slate-400">Test No.</th>
                <th className="p-1.5 text-left border-r border-slate-400">Consumed Time</th>
                <th className="p-1.5 text-right border-r border-slate-400">Time Limit</th>
                <th className="p-1.5 text-center border-r border-slate-400">Test Answered</th>
                <th className="p-1.5 text-center">Item</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 font-medium divide-y divide-slate-300">
              {rows.map(([key, val]: [string, any]) => (
                <tr key={key} className="border-b border-slate-300">
                  <td className="p-1.5 capitalize border-r border-slate-400">{key.replace("test", "Test ")}</td>
                  <td className="p-1.5 font-mono font-semibold border-r border-slate-400">{val.consumedTime}</td>
                  <td className="p-1.5 text-right font-mono border-r border-slate-400">{val.timeFrame}</td>
                  <td className="p-1.5 text-center font-mono border-r border-slate-400">{val.testAnswered ?? "-"}</td>
                  <td className="p-1.5 text-center font-mono">{val.testItem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const mentalRows = [
    { label: "Culture Fair Intelligence Test", rating: applicant.scores.cfit },
    { label: "Judgement and Comprehension", rating: applicant.scores.comprehension },
    { label: "Planning", rating: applicant.scores.planning },
  ];

  const supervisoryRows = isSupervisory
    ? [
      { label: "Management", rating: details?.supervisory?.management },
      { label: "Supervision", rating: details?.supervisory?.supervision },
      { label: "Employee", rating: details?.supervisory?.employeeRelations },
      { label: "Human Relations Practices", rating: details?.supervisory?.humanRelationsPractices },
      { label: "Over-all", rating: applicant.scores.supervisoryTotalEvaluation },
    ]
    : [];

  const personalityRows = [
    { label: "Emotional Stability (C)", rating: details?.detailed16pf?.emotionalStability },
    { label: "Sense of Responsibility (Q3)", rating: details?.detailed16pf?.senseOfResponsibility },
    { label: "Conscientiousness (G)", rating: details?.detailed16pf?.conscientiousness },
    { label: "Assertiveness (E)", rating: details?.detailed16pf?.assertiveness },
    { label: "Confidence (O &Q4 Rev)", rating: details?.detailed16pf?.confidence },
    { label: "Flexibility(G & Q1)", rating: details?.detailed16pf?.flexibility },
    { label: "Open-mindedness (Q1)", rating: details?.detailed16pf?.openMindedness },
    { label: "Self-Reliance (Q2)", rating: details?.detailed16pf?.selfReliance },
    { label: "Sociability (A & F)", rating: details?.detailed16pf?.sociability },
    { label: "Trust and Acceptance of Others (L-Rev)", rating: details?.detailed16pf?.trustAcceptance },
    { label: "Objectivity (O-Rev)", rating: details?.detailed16pf?.objectivity },
    { label: "Optimism and Liveliness (F)", rating: details?.detailed16pf?.optimismLiveliness },
  ];

  const renderSignOff = () => (
    <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-800 space-y-1">
      <p className="font-bold">Evaluated by:</p>
      <div className="pt-5">
        <p className="font-bold text-sm">Chrisvee Alvarez</p>
        <p className="text-slate-600 font-medium">HR Assisstant</p>
      </div>
    </div>
  );

  return (
    <div className="fixed top-0 left-[-9999px] print:static print:left-0 z-[-1] print:z-auto space-y-6">
      {/* Strip browser header/footer margins on print */}
      <style>{`
        @page {
          margin: 0;
          size: letter portrait;
        }
        @media print {
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .pdf-page {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      <div id="print-area" className="flex flex-col gap-6">
        {/* ========================================================================= */}
        {/* PAGE 1: Personal Info, Header, Psychometric Tables */}
        {/* ========================================================================= */}
        <div
          className="pdf-page relative bg-white overflow-hidden text-slate-900 font-sans text-xs leading-normal box-border border border-slate-200"
          style={{
            width: "816px",
            height: "1056px",
            pageBreakAfter: "always",
            breakAfter: "page",
          }}
        >
          {/* Centered Background Image per page */}
          <img
            src="/test_result_bg.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none opacity-25"
            crossOrigin="anonymous"
          />

          <div className="relative z-10 p-8 flex flex-col justify-between h-full">
            <div>
              <div className="bg-white/90 p-5 rounded-xs border border-slate-300/80">
                {/* Personal Info Block */}
                <div className="grid grid-cols-2 gap-4 border border-slate-300 bg-white/90 p-4 mb-4 text-xs">
                  <div className="space-y-1.5">
                    <p><span className="font-bold text-slate-800">Name:</span> {applicant.metadata.fullName}</p>
                    <p><span className="font-bold text-slate-800">Age:</span> {applicant.metadata.age}</p>
                    <p><span className="font-bold text-slate-800">Education:</span> {applicant.metadata.education}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p><span className="font-bold text-slate-800">Company:</span> {applicant.metadata.company || "No Company Yet"}</p>
                    <p><span className="font-bold text-slate-800">Position:</span> {applicant.intent.positionAppliedFor}</p>
                    <p><span className="font-bold text-slate-800">Date Tested:</span> {applicant.intent.date}</p>
                  </div>
                </div>

                {/* Title Header Block */}
                <div className="my-4 space-y-0.5 text-left">
                  <div className="font-extrabold text-sm tracking-wider uppercase underline text-slate-900">
                    TEST RESULTS AND INTERPRETATION:
                  </div>
                  <div className="font-bold text-xs tracking-wider uppercase text-slate-700">
                    FACTORS MEASURED
                  </div>
                </div>

                {/* Rating Tables */}
                {renderRatingTable("Mental", mentalRows)}
                {isSupervisory && renderRatingTable("Supervisory Index", supervisoryRows)}
                {renderRatingTable("Work & Personal Adjustment", personalityRows)}
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-400 font-mono">
              Page 1 of {isSupervisory ? "3" : "2"}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 2: Narrative Interpretations & Sign-off (or Time Tables for Standard Track) */}
        {/* ========================================================================= */}
        <div
          className="pdf-page relative bg-white overflow-hidden text-slate-900 font-sans text-xs leading-normal box-border border border-slate-200"
          style={{
            width: "816px",
            height: "1056px",
            pageBreakAfter: isSupervisory ? "always" : "auto",
            breakAfter: isSupervisory ? "page" : "auto",
          }}
        >
          {/* Centered Background Image per page */}
          <img
            src="/test_result_bg.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none opacity-25"
            crossOrigin="anonymous"
          />

          <div className="relative z-10 p-8 flex flex-col justify-between h-full">
            <div>
              <div className="bg-white/90 p-5 rounded-xs border border-slate-300/80 space-y-4">
                {/* Mental Ability Narrative */}
                {details?.mentalAbility && (
                  <div>
                    <h4 className="font-bold text-xs uppercase text-slate-800 border-b border-slate-300 pb-1 mb-1.5">
                      Mental Ability
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed bg-slate-50/80 p-3 rounded-xs border border-slate-300">
                      {details.mentalAbility}
                    </p>
                  </div>
                )}

                {/* Supervisory Index Narrative (Supervisory Track Only) */}
                {isSupervisory && details && (
                  <div>
                    <h4 className="font-bold text-xs uppercase text-slate-800 border-b border-slate-300 pb-1 mb-2">
                      Supervisory Index
                    </h4>
                    <div className="space-y-2.5 bg-slate-50/80 p-3 rounded-xs border border-slate-300 text-xs">
                      {details.supervisoryIndexesAI?.index1Assessment && (
                        <div>
                          <p className="font-bold text-slate-900">Management</p>
                          <p className="text-slate-700 italic">{details.supervisoryIndexesAI.index1Assessment}</p>
                          <p className="font-bold text-indigo-700 mt-0.5">• {details.supervisory.management}</p>
                        </div>
                      )}
                      {details.supervisoryIndexesAI?.index2Assessment && (
                        <div>
                          <p className="font-bold text-slate-900">Supervision</p>
                          <p className="text-slate-700 italic">{details.supervisoryIndexesAI.index2Assessment}</p>
                          <p className="font-bold text-indigo-700 mt-0.5">• {details.supervisory.supervision}</p>
                        </div>
                      )}
                      {details.supervisoryIndexesAI?.index3Assessment && (
                        <div>
                          <p className="font-bold text-slate-900">Employees</p>
                          <p className="text-slate-700 italic">{details.supervisoryIndexesAI.index3Assessment}</p>
                          <p className="font-bold text-indigo-700 mt-0.5">• {details.supervisory.employeeRelations}</p>
                        </div>
                      )}
                      {details.supervisoryIndexesAI?.index4Assessment && (
                        <div>
                          <p className="font-bold text-slate-900">Human Relations Practices</p>
                          <p className="text-slate-700 italic">{details.supervisoryIndexesAI.index4Assessment}</p>
                          <p className="font-bold text-indigo-700 mt-0.5">• {details.supervisory.humanRelationsPractices}</p>
                        </div>
                      )}
                      {details.overAllAssessment && (
                        <div className="pt-2 border-t border-slate-300">
                          <p className="font-semibold text-slate-800 leading-relaxed">{details.overAllAssessment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Personality Narrative Summary */}
                {details?.aiGenPersonalityAssessment && (
                  <div>
                    <h4 className="font-bold text-xs uppercase text-slate-800 border-b border-slate-300 pb-1 mb-1.5">
                      Personality
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed bg-slate-50/80 p-3 rounded-xs border border-slate-300 font-medium">
                      {details.aiGenPersonalityAssessment}
                    </p>
                  </div>
                )}

                {/* For Standard Track (non-supervisory), include Time Consumed on Page 2 */}
                {!isSupervisory && details?.allTestTimeConsumed && (
                  <div>
                    <h4 className="font-bold text-xs uppercase text-slate-800 border-b border-slate-300 pb-1 mb-2">
                      TEST TIME CONSUMED ANALYSIS
                    </h4>
                    {renderTimeTable("CFIT Test Time", details.allTestTimeConsumed.cfitTestTime)}
                    {renderTimeTable("Judgement & Comprehension Test Time", details.allTestTimeConsumed.jcTestTime)}
                    {renderTimeTable("FIT Planning Test Time", details.allTestTimeConsumed.fitPlanningTestTime)}
                    {renderTimeTable("16PF Test Time", details.allTestTimeConsumed["16pfTestTime"])}
                  </div>
                )}

                {/* Sign Off on Page 2 for Standard Track */}
                {!isSupervisory && renderSignOff()}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 3: Time Consumed & Sign-off (Supervisory Track Only) */}
        {/* ========================================================================= */}
        {isSupervisory && (
          <div
            className="pdf-page relative bg-white overflow-hidden text-slate-900 font-sans text-xs leading-normal box-border border border-slate-200"
            style={{
              width: "816px",
              height: "1056px",
            }}
          >
            {/* Centered Background Image per page */}
            <img
              src="/test_result_bg.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none opacity-25"
              crossOrigin="anonymous"
            />

            <div className="relative z-10 p-8 flex flex-col justify-between h-full">
              <div>
                <div className="bg-white/90 p-5 rounded-xs border border-slate-300/80 space-y-4">
                  {details?.allTestTimeConsumed && (
                    <div>
                      <h4 className="font-bold text-xs uppercase text-slate-800 border-b border-slate-300 pb-1 mb-3">
                        TEST TIME CONSUMED ANALYSIS
                      </h4>
                      {renderTimeTable("CFIT Test Time", details.allTestTimeConsumed.cfitTestTime)}
                      {renderTimeTable("Judgement & Comprehension Test Time", details.allTestTimeConsumed.jcTestTime)}
                      {renderTimeTable("FIT Planning Test Time", details.allTestTimeConsumed.fitPlanningTestTime)}
                      {renderTimeTable("16PF Test Time", details.allTestTimeConsumed["16pfTestTime"])}
                      {renderTimeTable("Supervisory Test Time", details.allTestTimeConsumed.supervTestTime)}
                    </div>
                  )}

                  {/* Sign Off on Page 3 for Supervisory Track */}
                  {renderSignOff()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
