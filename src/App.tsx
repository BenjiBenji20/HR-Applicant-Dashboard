import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DashboardTab, { PaginationInfo } from "./components/DashboardTab";
import AnalyticsTab from "./components/AnalyticsTab";
import RawScoreModal from "./components/RawScoreModal";
import AIPsychometricModal from "./components/AIPsychometricModal";
import PrintPreview from "./components/PrintPreview";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { initialSummaryResults, initialDetailedProfiles } from "./data/mockData";
import { ApplicantSummary, ApplicantDetail, ApplicantFinalResult } from "./types/types";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? saved === "true" : false;
  });

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved ? saved === "true" : true;
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics">(() => {
    const path = window.location.pathname;
    if (path === "/analytics") return "analytics";
    return "dashboard";
  });

  const handleTabChange = (tab: "dashboard" | "analytics") => {
    setActiveTab(tab);
    window.history.pushState(null, "", "/" + tab);
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (path !== "/dashboard" && path !== "/analytics") {
      window.history.replaceState(null, "", "/dashboard");
      setActiveTab("dashboard");
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/analytics") {
        setActiveTab("analytics");
      } else {
        setActiveTab("dashboard");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Load summary results and detailed profiles from localStorage with unified cache invalidation check
  const [summaryResults, setSummaryResults] = useState<ApplicantSummary[]>(() => {
    const savedSummary = localStorage.getItem("summaryResults");
    const savedDetail = localStorage.getItem("detailedProfiles");
    
    let isOutdated = false;
    
    if (savedSummary) {
      try {
        const parsed = JSON.parse(savedSummary);
        if (parsed.length === 0 || !parsed[0].scores || "16pf" in parsed[0].scores || !parsed[0].metadata || !("age" in parsed[0].metadata)) {
          isOutdated = true;
        }
      } catch (e) {
        isOutdated = true;
      }
    } else {
      isOutdated = true;
    }
    
    if (savedDetail) {
      try {
        const parsed = JSON.parse(savedDetail);
        const firstKey = Object.keys(parsed)[0];
        if (firstKey) {
          const profile = parsed[firstKey];
          const timeConsumed = profile.allTestTimeConsumed;
          const hasTestAnswered = timeConsumed && (
            (timeConsumed.cfitTestTime?.test1 && 'testAnswered' in timeConsumed.cfitTestTime.test1) ||
            (timeConsumed.jcTestTime?.test1 && 'testAnswered' in timeConsumed.jcTestTime.test1)
          );
          const detailOutdated = !profile || !("aiGenPersonalityAssessment" in profile) || !("overAllAssessment" in profile);
          if (!timeConsumed || !hasTestAnswered || detailOutdated) {
            isOutdated = true;
          }
        } else {
          isOutdated = true;
        }
      } catch (e) {
        isOutdated = true;
      }
    } else {
      isOutdated = true;
    }
    
    if (isOutdated) {
      localStorage.removeItem("summaryResults");
      localStorage.removeItem("detailedProfiles");
      return initialSummaryResults;
    }
    
    return savedSummary ? JSON.parse(savedSummary) : initialSummaryResults;
  });

  const [detailedProfiles, setDetailedProfiles] = useState<Record<string, ApplicantDetail>>(() => {
    const savedSummary = localStorage.getItem("summaryResults");
    const savedDetail = localStorage.getItem("detailedProfiles");
    
    if (!savedSummary || !savedDetail) {
      return initialDetailedProfiles;
    }
    
    try {
      return JSON.parse(savedDetail);
    } catch (e) {
      return initialDetailedProfiles;
    }
  });

  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: summaryResults.length,
    totalPages: 1,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load live data from the proxy endpoint on mount with mock fallback
  const fetchLiveRecords = async (limit: number = 20) => {
    try {
      setIsLoadingMore(true);
      const response = await fetch(`/api/applicants?action=list&page=1&limit=${limit}`);
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setSummaryResults(result.data);
        if (result.details) {
          setDetailedProfiles(result.details);
        }
        if (result.pagination) {
          setPaginationInfo(result.pagination);
        } else {
          setPaginationInfo({
            page: 1,
            limit: limit,
            totalCount: result.data.length,
            totalPages: 1,
          });
        }
      }
    } catch (err) {
      console.warn("Could not load database records from server proxy. Operating in local mock cache mode.", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLiveRecords(20);
  }, []);

  const handleUpdateCompany = (applicantId: string, newCompany: string) => {
    setSummaryResults((prev) =>
      prev.map((app) =>
        app.id === applicantId
          ? { ...app, metadata: { ...app.metadata, company: newCompany } }
          : app
      )
    );
  };

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

  const handleDownloadRows = (ids: string[]) => {
    const id = ids[0];
    if (!id) return;
    const applicant = summaryResults.find((app) => app.id === id);
    if (!applicant) return;

    setPrintingApplicant(applicant);

    // Wait two frames for React to commit + paint the new applicant before capturing.
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        const element = document.getElementById("print-area");
        if (!element) {
          setPrintingApplicant(null);
          return;
        }

        try {
          const pageElements = element.querySelectorAll<HTMLElement>(".pdf-page");
          const pdf = new jsPDF({ unit: "in", format: "letter", orientation: "portrait" });

          if (pageElements.length > 0) {
            for (let i = 0; i < pageElements.length; i++) {
              const pageEl = pageElements[i];
              const canvas = await html2canvas(pageEl, {
                scale: 2,
                useCORS: true,
                logging: false,
              });
              const imgData = canvas.toDataURL("image/jpeg", 0.98);
              if (i > 0) {
                pdf.addPage();
              }
              pdf.addImage(imgData, "JPEG", 0, 0, 8.5, 11);
            }
          } else {
            const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              logging: false,
            });
            const imgData = canvas.toDataURL("image/jpeg", 0.98);
            pdf.addImage(imgData, "JPEG", 0, 0, 8.5, 11);
          }

          pdf.save(
            `HR_Assessment_${applicant.metadata.fullName.replace(/\s+/g, "_")}_${new Date()
              .toISOString()
              .slice(0, 10)}.pdf`
          );
        } catch (err) {
          console.error("PDF generation error:", err);
        } finally {
          setPrintingApplicant(null);
        }
      });
    });
  };

  const handleOpenRawScores = (id: string) => {
    setActiveDetailId(id);
  };

  const handleOpenAIModal = (applicant: ApplicantSummary) => {
    setActiveAIPsychometricApplicant(applicant);
  };

  const handleSavePsychometric = (id: string, updatedFields: Partial<ApplicantDetail>) => {
    setDetailedProfiles((prev) => {
      const existing = prev[id];
      if (existing) {
        return {
          ...prev,
          [id]: {
            ...existing,
            ...updatedFields,
            supervisoryIndexesAI: updatedFields.supervisoryIndexesAI
              ? {
                  ...existing.supervisoryIndexesAI,
                  ...updatedFields.supervisoryIndexesAI,
                }
              : existing.supervisoryIndexesAI,
          },
        };
      }
      return prev;
    });
  };

  const handlePrintApplicant = (applicant: ApplicantSummary) => {
    setPrintingApplicant(applicant);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
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
            setActiveTab={handleTabChange}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />

          {/* Main Workspace Frame */}
          <main className="flex-1 overflow-y-auto bg-[#F1F5F9] p-6 dark:bg-slate-900/40">
            {activeTab === "dashboard" ? (
              <DashboardTab
                finalResults={summaryResults}
                onDownloadRows={handleDownloadRows}
                onOpenAIModal={handleOpenAIModal}
                onOpenRawScores={handleOpenRawScores}
                onPrintApplicant={handlePrintApplicant}
                pagination={paginationInfo}
                onFetchMoreRecords={fetchLiveRecords}
                isLoadingMore={isLoadingMore}
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
          onUpdateCompany={handleUpdateCompany}
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
