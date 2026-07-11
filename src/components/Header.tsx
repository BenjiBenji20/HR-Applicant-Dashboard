import React from "react";
import { Briefcase } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Header({
  darkMode,
  setDarkMode,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950 transition-colors duration-200 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-100 dark:bg-indigo-950 dark:text-indigo-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base tracking-tight">
              HR Portal
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-full p-1 border border-slate-200/50 dark:border-slate-850">
          <button
            id="theme-light-btn"
            onClick={() => setDarkMode(false)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !darkMode
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Light
          </button>
          <button
            id="theme-dark-btn"
            onClick={() => setDarkMode(true)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              darkMode
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Dark
          </button>
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
        <div className="flex flex-col items-end text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100">Jane Doe</span>
          <span className="text-slate-500 dark:text-slate-400 text-[10px]">Senior HR Lead</span>
        </div>
      </div>
    </header>
  );
}
