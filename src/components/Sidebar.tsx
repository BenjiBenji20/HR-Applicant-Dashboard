import React from "react";
import { LayoutDashboard, BarChart2, ClipboardCheck, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: "dashboard" | "analytics";
  setActiveTab: (tab: "dashboard" | "analytics") => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
}: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard" as const,
      label: "Main Dashboard",
      icon: LayoutDashboard,
      description: "Applicant form submissions",
    },
    {
      id: "analytics" as const,
      label: "Analytics Insights",
      icon: BarChart2,
      description: "Applicant performance metrics",
    },
  ];

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div
          id="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:relative top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out shrink-0 border-r border-slate-200 dark:border-slate-800 overflow-visible ${
          isOpen ? "w-64" : "w-16 max-md:w-0 max-md:border-r-0"
        }`}
      >
        {/* Absolute Edge Toggle Button */}
        <button
          id="sidebar-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-1.5 -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-850 shadow-sm cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          {/* Desktop display */}
          <span className="hidden md:inline">
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
          {/* Mobile display */}
          <span className="md:hidden">
            {isOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
          </span>
        </button>

        <div className="flex flex-col justify-between h-full px-3 py-7 overflow-hidden">
          <div className="space-y-3">
            <nav className="space-y-1.5" aria-label="Sidebar Navigation">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-link-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      // Auto-close sidebar on mobile after clicking
                      if (window.innerWidth < 768) {
                        setIsOpen(false);
                      }
                    }}
                    className={`flex items-center rounded-lg transition-all duration-200 cursor-pointer ${
                      isOpen
                        ? "w-full px-3 py-3 gap-3 justify-start"
                        : "w-10 h-10 justify-center mx-auto"
                    } ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                    }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                    {isOpen && (
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold">{item.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5">
                          {item.description}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Appearance Mode toggle card - Mobile View Only when sidebar is open */}
            {isOpen && (
              <div className="md:hidden border-t border-slate-150/40 pt-4 dark:border-slate-900">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-150/40 dark:border-slate-850">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 text-center">
                    Appearance Mode
                  </span>
                  <div className="flex items-center bg-white dark:bg-slate-950 rounded-lg p-1 border border-slate-150/40 dark:border-slate-850 w-full justify-between">
                    <button
                      onClick={() => setDarkMode(false)}
                      className={`flex-1 text-center py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        !darkMode
                          ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-white"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setDarkMode(true)}
                      className={`flex-1 text-center py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        darkMode
                          ? "bg-slate-800 text-white dark:bg-slate-800 dark:text-white"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer branding details */}
          <div className="border-t border-slate-100 pt-4 dark:border-slate-900">
            {isOpen ? (
              <>
                <div className="flex items-center gap-2 px-2 text-slate-400 dark:text-slate-500">
                  <ClipboardCheck className="h-4 w-4 shrink-0 text-indigo-500" />
                  <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">
                    HRD | Continental Sales Inc.
                  </span>
                </div>
                <p className="mt-1.5 px-2 text-[10px] text-slate-400 dark:text-slate-600 font-medium">
                  Psychometric reporting. July 2026.
                </p>
              </>
            ) : (
              <div className="flex justify-center">
                <ClipboardCheck className="h-5 w-5 text-indigo-500" title="HRD | Continental Sales Inc. | Psychometric reporting" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
