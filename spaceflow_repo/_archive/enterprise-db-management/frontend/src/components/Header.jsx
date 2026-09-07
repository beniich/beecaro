import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-panel-dark px-6 py-3 sticky top-0 z-10">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3 text-primary">
                    <div className="size-9 flex items-center justify-center bg-primary text-white rounded-lg shadow-lg">
                        <span className="material-symbols-outlined text-2xl">storage</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold">
                            EnterpriseDB
                        </h2>
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                            Database Management
                        </span>
                    </div>
                </div>

                {/* Navigation – cachée sur mobile */}
                <nav className="hidden md:flex gap-6">
                    <Link
                        to="/"
                        className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/audit-logs"
                        className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium"
                    >
                        Audit Logs
                    </Link>
                    <Link
                        to="/security-analytics"
                        className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium"
                    >
                        Security
                    </Link>
                    <Link
                        to="/retention-policy"
                        className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium"
                    >
                        Retention
                    </Link>
                    <Link
                        to="/forensic-detail"
                        className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium"
                    >
                        Forensics
                    </Link>
                    <Link
                        to="/scheduler"
                        className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium"
                    >
                        Scheduler
                    </Link>
                </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border-r border-slate-800 pr-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-slate-500">Region</span>
                        <span className="text-xs font-semibold text-slate-300">EU‑WEST‑1</span>
                    </div>
                    <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                <button className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined">notifications</span>
                </button>

                <div
                    className="size-10 rounded-full border-2 border-slate-800 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url("https://i.pravatar.cc/40?img=3")',
                    }}
                />
            </div>
        </header>
    );
}
