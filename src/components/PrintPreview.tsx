import React from "react";
import { ApplicantSummary, ApplicantDetail } from "../types";
import { Briefcase, Calendar, Mail, FileText, Award, User, Layers } from "lucide-react";

interface PrintPreviewProps {
  applicant: ApplicantSummary | null;
  details: ApplicantDetail | null;
}

export default function PrintPreview({ applicant, details }: PrintPreviewProps) {
  if (!applicant) return null;

  return (
    <div className="fixed top-0 left-[-9999px] print:static print:left-0 z-[-1] print:z-auto">
      <div
        id="print-area"
        style={{ width: "816px" }} // fixed px width (8.5in @ 96dpi) instead of max-w-4xl/mx-auto,
        // which can collapse via shrink-to-fit once out of normal flow
        className="bg-white text-gray-900 p-8 font-sans text-xs leading-relaxed"
      >
        {/* Title Header */}
        <div className="flex justify-between items-center border-b-2 border-indigo-600 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-indigo-900">
              Official Psychometric Evaluation Profile
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Document Reference ID: PSY-EVAL-{applicant.id.toUpperCase().slice(0, 8)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              HR EVALUATION OFFICE
            </span>
            <span className="text-xs font-semibold text-gray-700">Talent Assessment Center</span>
          </div>
        </div>

        {/* Candidate Profile Details Block */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-500 font-medium">Candidate Name:</span>
              <span className="font-bold text-gray-800 text-sm">{applicant.metadata.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-500 font-medium">Email Address:</span>
              <span className="font-semibold text-gray-700">{applicant.metadata.emailAddress}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-500 font-medium">Position Applied:</span>
              <span className="font-bold text-gray-800 text-sm">{applicant.intent.positionAppliedFor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-500 font-medium">Evaluation Date:</span>
              <span className="font-semibold text-gray-700">{applicant.intent.date}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Cognitive Aptitude Scores */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1.5 mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            1. Cognitive Intelligence & Aptitude
          </h3>
          <table className="w-full text-left border border-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="p-2 font-semibold text-[10px] uppercase">Measurement Parameter</th>
                <th className="p-2 font-semibold text-[10px] uppercase">Evaluation Metric Rating</th>
                <th className="p-2 font-semibold text-[10px] uppercase">Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-2 font-medium">CFIT Fluid Intelligence</td>
                <td className="p-2 font-semibold text-indigo-900">{applicant.scores.cfit}</td>
                <td className="p-2 text-gray-500">Measures culture-fair fluid logic and non-verbal reasoning.</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Verbal Comprehension</td>
                <td className="p-2 font-semibold text-indigo-900">{applicant.scores.comprehension}</td>
                <td className="p-2 text-gray-500">Measures comprehension of work policies, standards, and directives.</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Planning & Organization</td>
                <td className="p-2 font-semibold text-indigo-900">{applicant.scores.planning}</td>
                <td className="p-2 text-gray-500">Measures capacity to prioritize tasks and organize complex workflows.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: 16PF Profile & Personality */}
        {details?.detailed16pf && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1.5 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              2. Personality Profile (16PF Dimensions)
            </h3>
            <div className="border border-gray-200 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50/50">
              {Object.entries(details.detailed16pf).map(([key, val]) => (
                <div key={key} className="border border-gray-150 rounded p-2 bg-white shadow-2xs">
                  <span className="text-gray-400 uppercase font-bold block text-[7px] tracking-wider leading-none mb-1">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-bold text-gray-800 text-xs">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Supervisory Leadership Assessments (if applicable) */}
        {applicant.metadata.supervisoryTest && details?.supervisory && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1.5 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              3. Supervisory Leadership & Management Performance
            </h3>
            <table className="w-full text-left border border-gray-200 border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="p-2 font-semibold text-[10px] uppercase">Management Component</th>
                  <th className="p-2 font-semibold text-[10px] uppercase">Assessed Rating</th>
                  <th className="p-2 font-semibold text-[10px] uppercase">Management Component</th>
                  <th className="p-2 font-semibold text-[10px] uppercase">Assessed Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-medium bg-gray-50/50">Management Logic</td>
                  <td className="p-2 font-semibold text-gray-800">{details.supervisory.management}</td>
                  <td className="p-2 font-medium bg-gray-50/50">Supervision Quality</td>
                  <td className="p-2 font-semibold text-gray-800">{details.supervisory.supervision}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-medium bg-gray-50/50">Employee Relationship</td>
                  <td className="p-2 font-semibold text-gray-800">{details.supervisory.employeeRelations}</td>
                  <td className="p-2 font-medium bg-gray-50/50">Human Relationship</td>
                  <td className="p-2 font-semibold text-gray-800">{details.supervisory.humanRelationsPractices}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="p-2 font-semibold text-indigo-900">
                    Total Leadership Composite Evaluation:
                  </td>
                  <td colSpan={2} className="p-2 font-bold text-indigo-600 text-sm text-right">
                    {applicant.scores.supervisoryTotalEvaluation}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Section 4: Narrative Summary Evaluation */}
        <div className="mb-10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1.5 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            {applicant.metadata.supervisoryTest ? "4" : "3"}. Psychological & Behavioral Assessment Narrative
          </h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-gray-800 leading-relaxed text-[11px] whitespace-pre-wrap">
            {details?.mentalAbility ||
              "No psychometric summary generated yet. Complete the AI-Assessed summary in the HR Dashboard."}
          </div>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-dashed border-gray-300">
          <div className="text-center space-y-1">
            <div className="h-10"></div>
            <p className="border-t border-gray-400 pt-1 font-semibold text-gray-800">HR Assessment System Evaluator</p>
            <span className="text-[10px] text-gray-400 block uppercase">Industrial Psychometrics Division</span>
          </div>
          <div className="text-center space-y-1">
            <div className="h-10"></div>
            <p className="border-t border-gray-400 pt-1 font-semibold text-gray-800">Date of Attestation</p>
            <span className="text-[10px] text-gray-400 block">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
