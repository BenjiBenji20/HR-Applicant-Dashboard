import React from "react";
import { LayoutDashboard, BarChart2, Users, ClipboardCheck, ChevronLeft } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: "dashboard" | "analytics";
  setActiveTab: (tab: "dashboard" | "analytics") => void;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
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
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col justify-between h-full p-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Navigation
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 hover:bg-slate-50 dark:hover:bg-slate-900 md:hidden text-slate-400 dark:text-slate-500"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

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
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer branding details */}
          <div className="border-t border-slate-100 pt-4 dark:border-slate-900 text-center md:text-left">
            <div className="flex items-center gap-2 px-2 text-slate-400 dark:text-slate-500">
              <ClipboardCheck className="h-4 w-4 shrink-0 text-indigo-500" />
              <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">
                ISO-Psych Standards
              </span>
            </div>
            <p className="mt-1.5 px-2 text-[10px] text-slate-400 dark:text-slate-600 font-medium">
              Approved psychometric reporting engine. Version 1.4.0.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
