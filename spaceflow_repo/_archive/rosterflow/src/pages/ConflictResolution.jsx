import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConflictResolution() {
    const navigate = useNavigate();

    return (
        <div className="bg-background-dark font-display text-slate-100 antialiased overflow-hidden h-screen flex flex-col">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <div className="bg-amber-500 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <span className="material-icons text-slate-900">analytics</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white leading-tight">Conflict Resolution Center</h1>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">System Diagnostics • 02 Active Conflicts</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Coverage Impact</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="w-[92%] h-full bg-emerald-500"></div>
                                </div>
                                <span className="text-xs font-bold text-emerald-400">92%</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-slate-700"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Reliability Score</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-400">Low (Conflict)</span>
                            </div>
                        </div>
                    </div>
                    <button className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                        <span className="material-icons text-sm">done_all</span>
                        Resolve All Issues
                    </button>
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                        <span className="material-icons">close</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 flex bg-slate-950 p-6 gap-6 overflow-hidden">
                        {/* Center Content */}
                        <div className="flex-1 flex flex-col gap-6">
                            {/* Conflict Header */}
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <span className="bg-amber-500/10 text-amber-500 p-2 rounded-lg border border-amber-500/20">
                                        <span className="material-icons">person_off</span>
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-200">Double-Booking Detected</h2>
                                        <p className="text-xs text-slate-500">Personnel assigned to overlapping tasks in separate teams.</p>
                                    </div>
                                </div>
                                <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Conflict ID: </span>
                                    <span className="text-xs font-mono text-primary font-bold">#DB-4920</span>
                                </div>
                            </div>

                            {/* Source vs Conflict Comparison */}
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {/* Source Context */}
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                                <span className="material-icons text-blue-400">groups</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Context</p>
                                                <h3 className="font-bold text-slate-200">Team 01 (Water Maintenance)</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    alt="Alex Henderson"
                                                    className="h-12 w-12 rounded-full border-2 border-amber-500 shadow-lg shadow-amber-500/10"
                                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAAVaxqMMtg_hX28irbWcQrJ699OCiQXjM6pPSVy8RYSek9KGHyobZ8OO6gmMpVX3Ib_K1OKaFph9y-MqrHQMSbjG1vmAnmx9xLlWM5XmO6pe92fj9YRf_2f8FGvtxvoiS6UNSrefh-eOsOvGJY9umBBHZfP9lNOMOxA7LByXFcY52xCaBtYQV1NNTcQh5ithZaIfGT1nfs1UylZ9SWJLoTDlBqxMs1ogPuXtyZgp7JX1YUCXNChmJSpC2VOtnR9S--8vm0pNhxGGc"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="font-bold text-slate-100">Alex Henderson</p>
                                                        <span className="bg-amber-900/30 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase">Critical Role</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400">Lead Technician • 08:30 - 12:00</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Current Assignment</span>
                                                <span className="material-icons text-blue-400 text-sm">water_drop</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-1">Main Valve Repair #122</h4>
                                            <p className="text-[11px] text-slate-400 leading-relaxed">Required skill: Hydraulics Level 3. Alex is the only available specialist with this certification.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Conflicting Context */}
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                                <span className="material-icons text-amber-400">bolt</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conflicting Context</p>
                                                <h3 className="font-bold text-slate-200">Team 02 (Grid Operations)</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <div className="flex items-center gap-4 opacity-40">
                                                <img
                                                    alt="Alex Henderson"
                                                    className="h-12 w-12 rounded-full border-2 border-slate-700"
                                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAAVaxqMMtg_hX28irbWcQrJ699OCiQXjM6pPSVy8RYSek9KGHyobZ8OO6gmMpVX3Ib_K1OKaFph9y-MqrHQMSbjG1vmAnmx9xLlWM5XmO6pe92fj9YRf_2f8FGvtxvoiS6UNSrefh-eOsOvGJY9umBBHZfP9lNOMOxA7LByXFcY52xCaBtYQV1NNTcQh5ithZaIfGT1nfs1UylZ9SWJLoTDlBqxMs1ogPuXtyZgp7JX1YUCXNChmJSpC2VOtnR9S--8vm0pNhxGGc"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-100">Alex Henderson</p>
                                                    <p className="text-xs text-slate-400">Lead Technician • 10:30 - 14:00</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl border-2 border-red-500/30 bg-red-500/5 relative">
                                            <div className="absolute -top-3 -left-3 bg-red-500 text-white p-1 rounded-lg">
                                                <span className="material-icons text-sm">warning</span>
                                            </div>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Conflicting Assignment</span>
                                                <span className="material-icons text-red-400 text-sm">error</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-1">Emergency: Power Line 4</h4>
                                            <p className="text-[11px] text-slate-400 leading-relaxed">Task requires immediate response. Alex's location is 4.2 miles from this site.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Suggestions */}
                            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-icons text-primary text-lg">auto_fix_high</span>
                                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">AI Suggested Resolution</h3>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="col-span-2 space-y-3">
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-primary/50 transition-colors cursor-pointer group">
                                            <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">
                                                <span className="material-icons">swap_horiz</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-200 group-hover:text-primary transition-colors">Shift Resource Assignment</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Move <span className="text-slate-200 font-bold">Alex Henderson</span> to Team 02 (Priority) and reassign <span className="text-slate-200 font-bold">Sarah Jenkins</span> to Team 01 (Water).
                                                </p>
                                            </div>
                                            <button className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all">
                                                Apply Fix
                                            </button>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer opacity-70 group">
                                            <div className="bg-slate-700 text-slate-400 p-2 rounded-lg">
                                                <span className="material-icons">schedule</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-200">Postpone Grid Operations</p>
                                                <p className="text-xs text-slate-500 mt-1">Delay 'Power Line 4' start time to 12:30. Reduces city safety coverage by 14%.</p>
                                            </div>
                                            <button className="border border-slate-700 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-all">
                                                Select
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Resolution Impact</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-400">Coverage Score</span>
                                                <span className="text-xs font-bold text-emerald-500">+4.2%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-400">Response Delay</span>
                                                <span className="text-xs font-bold text-emerald-500">-12m</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-400">Staff Fatigue</span>
                                                <span className="text-xs font-bold text-amber-500">Stable</span>
                                            </div>
                                            <div className="pt-3 border-t border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Optimal Strategy</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Conflict Queue */}
                        <aside className="w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-slate-800 bg-slate-800/40">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-icons text-sm">history</span> Conflict Queue
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                <div className="p-3 rounded-xl bg-primary/10 border-2 border-primary/40 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-primary uppercase">Conflict 01</span>
                                        <span className="material-icons text-primary text-sm">check_circle</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-100">Double-Booking: Alex H.</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Teams 01 & 02 Overlap</p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Conflict 02</span>
                                        <span className="material-symbols-outlined text-slate-500 text-sm">engineering</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-300">Skill Gap: Team 03</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Missing 'Senior Inspector'</p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Conflict 03</span>
                                        <span className="material-icons text-slate-500 text-sm">hourglass_empty</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-300">Rest Compliance</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Marcus Vane • 11h break req.</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-950 border-t border-slate-800">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                                        <span>System Confidence</span>
                                        <span>98%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="w-[98%] h-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="h-14 border-t border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="material-icons text-slate-500 text-sm">info</span>
                        <span className="text-[11px] text-slate-400">Resolution changes will be published immediately after confirmation.</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">Discard Changes</button>
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all">
                        Confirm Resolution
                    </button>
                </div>
            </footer>
        </div>
    );
}
