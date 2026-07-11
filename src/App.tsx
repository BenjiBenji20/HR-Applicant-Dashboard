import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DashboardTab from "./components/DashboardTab";
import AnalyticsTab from "./components/AnalyticsTab";
import RawScoreModal from "./components/RawScoreModal";
import AIPsychometricModal from "./components/AIPsychometricModal";
import PrintPreview from "./components/PrintPreview";
import { initialSummaryResults, initialDetailedProfiles } from "./data/mockData";
import { ApplicantSummary, ApplicantDetail, ApplicantFinalResult } from "./types";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? saved === "true" : false;
  });
  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved ? saved === "true" : true;
  });
  
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics">("dashboard");

  // Load summary results from localStorage or mockData
  const [summaryResults, setSummaryResults] = useState<ApplicantSummary[]>(() => {
    const saved = localStorage.getItem("summaryResults");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && (!parsed[0].scores || "16pf" in parsed[0].scores)) {
          localStorage.removeItem("summaryResults");
          localStorage.removeItem("detailedProfiles");
          return initialSummaryResults;
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved summary results:", e);
      }
    }
    return initialSummaryResults;
  });

  // Load detailed profiles from localStorage or mockData
  const [detailedProfiles, setDetailedProfiles] = useState<Record<string, ApplicantDetail>>(() => {
    const saved = localStorage.getItem("detailedProfiles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const firstKey = Object.keys(parsed)[0];
        if (firstKey && !parsed[firstKey].allTestTimeConsumed) {
          localStorage.removeItem("detailedProfiles");
          return initialDetailedProfiles;
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved detailed profiles:", e);
      }
    }
    return initialDetailedProfiles;
  });

  // Modal / Drawer Active States
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [activeAIPsychometricApplicant, setActiveAIPsychometricApplicant] = useState<ApplicantSummary | null>(null);
  const [printingApplicant, setPrintingApplicant] = useState<ApplicantSummary | null>(null);

  // Sync Dark Mode state to root document
  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", String(sidebarOpen));
  }, [sidebarOpen]);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem("summaryResults", JSON.stringify(summaryResults));
  }, [summaryResults]);

  useEffect(() => {
    localStorage.setItem("detailedProfiles", JSON.stringify(detailedProfiles));
  }, [detailedProfiles]);

  // Handlers for App level actions
  const handleDeleteRows = (ids: string[]) => {
    const updated = summaryResults.filter((app) => !ids.includes(app.id));
    setSummaryResults(updated);
  };

  const handleDownloadRows = (ids: string[]) => {
    const selectedSummary = summaryResults.filter((app) => ids.includes(app.id));
    const selectedDetailed = ids.map(id => detailedProfiles[id]).filter(Boolean);
    const downloadData = {
      summaries: selectedSummary,
      details: selectedDetailed
    };
    const blob = new Blob([JSON.stringify(downloadData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `HR_Assessment_Selected_Applicants_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenRawScores = (id: string) => {
    setActiveDetailId(id);
  };

  const handleOpenAIModal = (applicant: ApplicantSummary) => {
    setActiveAIPsychometricApplicant(applicant);
  };

  const handleSavePsychometric = (id: string, updatedPsychometric: string) => {
    setDetailedProfiles((prev) => {
      const existing = prev[id];
      if (existing) {
        return {
          ...prev,
          [id]: {
            ...existing,
            mentalAbility: updatedPsychometric,
          },
        };
      }
      return prev;
    });
  };

  const handlePrintApplicant = (applicant: ApplicantSummary) => {
    setPrintingApplicant(applicant);
    // Give state a short delay to render before firing native browser print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Map the new schemas to ApplicantFinalResult compatibility type for the unmodified AnalyticsTab
  const analyticsResults = summaryResults.map((app) => {
    const detail = detailedProfiles[app.id];
    
    // Map classification rating to a numeric-like Sten string that AnalyticsTab parses:
    // AnalyticsTab: app.scores["16pf"].match(/\d+/)?.[0] || "5"
    const mapToSten = (rating?: string) => {
      if (!rating) return "Sten 5";
      const r = rating.toLowerCase();
      if (r === "superior") return "Sten 10 (Superior)";
      if (r === "above average") return "Sten 8 (Above Average)";
      if (r === "high average") return "Sten 7 (High Average)";
      if (r === "average") return "Sten 5 (Average)";
      if (r === "low average") return "Sten 4 (Low Average)";
      if (r === "below average") return "Sten 2 (Below Average)";
      return "Sten 1 (Low)";
    };
    
    const pfStenString = mapToSten(detail?.detailed16pf?.emotionalStability);
    
    return {
      ...app,
      scores: {
        ...app.scores,
        "16pf": pfStenString,
        supervisory: {
          management: detail?.supervisory?.management || "Average",
          supervision: detail?.supervisory?.supervision || "Average",
          employee: detail?.supervisory?.employeeRelations || "Average",
          humanRels: detail?.supervisory?.humanRelationsPractices || "Average",
          totalEvaluation: app.scores.supervisoryTotalEvaluation || "Average"
        }
      },
      psychometric: detail?.mentalAbility || ""
    } as ApplicantFinalResult;
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Printable Area - Rendered outside main layout, visible only on @media print */}
      <PrintPreview 
        applicant={printingApplicant || (summaryResults.length > 0 ? summaryResults[0] : null)} 
        details={printingApplicant ? (detailedProfiles[printingApplicant.id] || null) : (summaryResults.length > 0 ? (detailedProfiles[summaryResults[0].id] || null) : null)} 
      />

      {/* Main App Canvas */}
      <div className="flex h-screen flex-col print:hidden">
        
        {/* Sticky Top Header */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <div className="flex flex-1 overflow-hidden">
          
          {/* Collapsible Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />

          {/* Main Workspace Frame */}
          <main className="flex-1 overflow-y-auto bg-[#F1F5F9] p-6 dark:bg-slate-900/40">
            {activeTab === "dashboard" ? (
              <DashboardTab
                finalResults={summaryResults}
                onDeleteRows={handleDeleteRows}
                onDownloadRows={handleDownloadRows}
                onOpenAIModal={handleOpenAIModal}
                onOpenRawScores={handleOpenRawScores}
                onPrintApplicant={handlePrintApplicant}
              />
            ) : (
              <AnalyticsTab finalResults={analyticsResults} />
            )}
          </main>
        </div>
      </div>

      {/* Pop-up Modals Portal */}

      {/* Detailed Profile View Modal */}
      {activeDetailId && (
        <RawScoreModal
          summary={summaryResults.find((r) => r.id === activeDetailId) || null}
          detail={detailedProfiles[activeDetailId] || null}
          onClose={() => setActiveDetailId(null)}
        />
      )}

      {/* AI Generate / Edit Psychometric Report Modal (approx 60vh layout) */}
      {activeAIPsychometricApplicant && (
        <AIPsychometricModal
          applicant={activeAIPsychometricApplicant}
          details={detailedProfiles[activeAIPsychometricApplicant.id] || null}
          onClose={() => setActiveAIPsychometricApplicant(null)}
          onSave={handleSavePsychometric}
        />
      )}
    </div>
  );
}
