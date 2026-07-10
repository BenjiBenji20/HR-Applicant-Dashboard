import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DashboardTab from "./components/DashboardTab";
import AnalyticsTab from "./components/AnalyticsTab";
import RawScoreModal from "./components/RawScoreModal";
import AIPsychometricModal from "./components/AIPsychometricModal";
import PrintPreview from "./components/PrintPreview";
import { initialFinalResults, initialRawScores } from "./data/mockData";
import { ApplicantFinalResult, ApplicantRawScore } from "./types";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? saved === "true" : false;
  });
  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics">("dashboard");

  // Load final results from localStorage or mockData
  const [finalResults, setFinalResults] = useState<ApplicantFinalResult[]>(() => {
    const saved = localStorage.getItem("finalResults");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved final results:", e);
      }
    }
    return initialFinalResults;
  });

  // Keep track of raw scores in memory
  const [rawScores, setRawScores] = useState<ApplicantRawScore[]>(initialRawScores);

  // Modal / Drawer Active States
  const [activeRawScoreApplicant, setActiveRawScoreApplicant] = useState<ApplicantRawScore | null>(null);
  const [activeAIPsychometricApplicant, setActiveAIPsychometricApplicant] = useState<ApplicantFinalResult | null>(null);
  const [printingApplicant, setPrintingApplicant] = useState<ApplicantFinalResult | null>(null);

  // Sync Dark Mode state to root document
  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Sync finalResults to local storage on changes
  useEffect(() => {
    localStorage.setItem("finalResults", JSON.stringify(finalResults));
  }, [finalResults]);

  // Handlers for App level actions
  const handleDeleteRows = (ids: string[]) => {
    const updated = finalResults.filter((app) => !ids.includes(app.id));
    setFinalResults(updated);
  };

  const handleDownloadRows = (ids: string[]) => {
    const selectedData = finalResults.filter((app) => ids.includes(app.id));
    const blob = new Blob([JSON.stringify(selectedData, null, 2)], {
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
    const found = rawScores.find((r) => r.id === id);
    if (found) {
      setActiveRawScoreApplicant(found);
    }
  };

  const handleOpenAIModal = (applicant: ApplicantFinalResult) => {
    setActiveAIPsychometricApplicant(applicant);
  };

  const handleSavePsychometric = (id: string, updatedPsychometric: string) => {
    const updated = finalResults.map((app) => {
      if (app.id === id) {
        return { ...app, psychometric: updatedPsychometric };
      }
      return app;
    });
    setFinalResults(updated);
  };

  const handlePrintApplicant = (applicant: ApplicantFinalResult) => {
    setPrintingApplicant(applicant);
    // Give state a short delay to render before firing native browser print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Printable Area - Rendered outside main layout, visible only on @media print */}
      <PrintPreview applicant={printingApplicant || (finalResults.length > 0 ? finalResults[0] : null)} />

      {/* Main App Canvas */}
      <div className="flex h-screen flex-col print:hidden">
        
        {/* Sticky Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
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
          />

          {/* Main Workspace Frame */}
          <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 dark:bg-slate-900/40">
            {activeTab === "dashboard" ? (
              <DashboardTab
                finalResults={finalResults}
                onDeleteRows={handleDeleteRows}
                onDownloadRows={handleDownloadRows}
                onOpenAIModal={handleOpenAIModal}
                onOpenRawScores={handleOpenRawScores}
                onPrintApplicant={handlePrintApplicant}
              />
            ) : (
              <AnalyticsTab finalResults={finalResults} />
            )}
          </main>
        </div>
      </div>

      {/* Pop-up Modals Portal */}

      {/* Raw score detailed dialog */}
      {activeRawScoreApplicant && (
        <RawScoreModal
          rawScore={activeRawScoreApplicant}
          onClose={() => setActiveRawScoreApplicant(null)}
        />
      )}

      {/* AI Generate / Edit Psychometric Report Modal (approx 60vh layout) */}
      {activeAIPsychometricApplicant && (
        <AIPsychometricModal
          applicant={activeAIPsychometricApplicant}
          onClose={() => setActiveAIPsychometricApplicant(null)}
          onSave={handleSavePsychometric}
        />
      )}
    </div>
  );
}
