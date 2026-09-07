import React from 'react';

export default function AuditLogs() {
    return (
        <div className="bg-background-dark font-display text-slate-100 antialiased min-h-screen">
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
                        <span className="material-icons text-primary text-2xl">security</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">System Audit &amp; Activity Logs</h1>
                        <p className="text-xs text-slate-400">Security monitoring and accountability • <span className="text-primary font-medium">Dark Mode</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-slate-700 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                        <span className="material-icons text-sm">download</span>
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        <span className="material-icons text-sm">refresh</span>
                        Live Refresh
                    </button>
                </div>
            </header>
            <main className="p-6 max-w-[1600px] mx-auto space-y-6">
                <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                        <span className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                            <span className="material-icons text-sm text-primary">filter_list</span>
                            Advanced Filters
                        </span>
                        <button className="text-xs text-primary font-medium hover:text-primary/80">Clear all filters</button>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <div className="relative">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Search Logs</label>
                            <span className="material-icons absolute left-3 top-7 text-slate-500 text-lg leading-none">search</span>
                            <input className="w-full pl-10 pr-4 py-2 text-sm border-slate-700 bg-slate-800 text-slate-200 rounded-lg focus:ring-primary focus:border-primary placeholder-slate-500" placeholder="Object ID or User..." type="text" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Date Range</label>
                            <select className="w-full py-2 text-sm border-slate-700 bg-slate-800 text-slate-200 rounded-lg focus:ring-primary focus:border-primary">
                                <option>Last 24 Hours</option>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Custom Range</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">User Role</label>
                            <select className="w-full py-2 text-sm border-slate-700 bg-slate-800 text-slate-200 rounded-lg focus:ring-primary focus:border-primary">
                                <option>All Roles</option>
                                <option>Administrator</option>
                                <option>Editor</option>
                                <option>Viewer</option>
                                <option>System Service</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Action Type</label>
                            <select className="w-full py-2 text-sm border-slate-700 bg-slate-800 text-slate-200 rounded-lg focus:ring-primary focus:border-primary">
                                <option>All Actions</option>
                                <option>Status Change</option>
                                <option>Delete Resource</option>
                                <option>Access Grant</option>
                                <option>Login / Logout</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Quick Severity</label>
                            <div className="flex items-center gap-1.5 pt-1.5">
                                <button className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center hover:bg-blue-500/20" title="Info"><span className="material-icons text-sm">info</span></button>
                                <button className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center hover:bg-amber-500/20" title="Warning"><span className="material-icons text-sm">warning</span></button>
                                <button className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center hover:bg-rose-500/20" title="Critical"><span className="material-symbols-outlined text-sm">gavel</span></button>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl flex flex-col min-h-[600px]">
                    <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-400">Showing <span className="text-slate-200">1,248</span> total logs</span>
                            <div className="h-4 w-[1px] bg-slate-800"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">View:</span>
                                <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                                    <button className="px-3 py-1 text-[10px] font-bold uppercase rounded-md bg-slate-700 text-white shadow-sm">Compact</button>
                                    <button className="px-3 py-1 text-[10px] font-bold uppercase rounded-md text-slate-500 hover:text-slate-300">Normal</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Auto-update in 45s</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse table-fixed-header audit-table">
                            <thead className="bg-slate-800/80 backdrop-blur-sm text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 w-48 border-b border-slate-700">Timestamp</th>
                                    <th className="px-4 py-3 w-56 border-b border-slate-700">User</th>
                                    <th className="px-4 py-3 w-44 border-b border-slate-700">Action</th>
                                    <th className="px-4 py-3 w-32 border-b border-slate-700">Object ID</th>
                                    <th className="px-4 py-3 border-b border-slate-700">Details</th>
                                    <th className="px-4 py-3 w-32 border-b border-slate-700">Severity</th>
                                    <th className="px-4 py-3 w-16 border-b border-slate-700 text-center">...</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="hover:bg-rose-500/5 transition-colors border-b border-slate-800/50">
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">2023-11-24 14:22:10.452</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-rose-500/20">SM</div>
                                            <div>
                                                <p className="font-semibold text-slate-100 leading-none">Sarah Meyer</p>
                                                <p className="text-[10px] text-slate-500 mt-1">Super Admin</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-rose-400">User Deleted</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">USR-442</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-xs truncate text-slate-400" title="Removed permanent access for account: david.miller@corp.com">Removed permanent access for account: <span className="text-rose-400 font-medium">david.miller@corp.com</span></p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500 text-white shadow-lg shadow-rose-500/20">Critical</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button className="text-slate-500 hover:text-primary"><span className="material-icons text-lg">visibility</span></button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-800/80 transition-colors border-b border-slate-800/50">
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">2023-11-24 14:15:02.118</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-[10px] text-primary font-bold ring-2 ring-primary/20">JD</div>
                                            <div>
                                                <p className="font-semibold text-slate-100 leading-none">John Doe</p>
                                                <p className="text-[10px] text-slate-500 mt-1">Project Manager</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-200">Status Change</td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-primary">REC-005</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-500 line-through">New</span>
                                            <span className="material-icons text-[10px] text-slate-600">arrow_forward</span>
                                            <span class="text-primary font-semibold italic">In Progress</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary text-white shadow-lg shadow-primary/20">Info</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button className="text-slate-500 hover:text-primary"><span className="material-icons text-lg">visibility</span></button>
                                    </td>
                                </tr>
                                {/* Add more rows similarly if needed, or truncate for brevity if it's repeating pattern */}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
                        <p className="text-xs text-slate-500">Page 1 of 63 (Showing 50 results per page)</p>
                        <div className="flex items-center gap-1">
                            <button className="p-2 text-slate-600 hover:text-primary disabled:opacity-30" disabled>
                                <span className="material-icons text-lg">first_page</span>
                            </button>
                            <button className="p-2 text-slate-600 hover:text-primary disabled:opacity-30" disabled>
                                <span className="material-icons text-lg">chevron_left</span>
                            </button>
                            <div className="flex items-center px-2">
                                <button className="w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg bg-primary text-white shadow-lg shadow-primary/30">1</button>
                                <button className="w-8 h-8 flex items-center justify-center text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-lg">2</button>
                                <button className="w-8 h-8 flex items-center justify-center text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-lg">3</button>
                                <span className="px-2 text-slate-700">...</span>
                                <button className="w-8 h-8 flex items-center justify-center text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-lg">63</button>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-primary">
                                <span className="material-icons text-lg">chevron_right</span>
                            </button>
                            <button className="p-2 text-slate-400 hover:text-primary">
                                <span className="material-icons text-lg">last_page</span>
                            </button>
                        </div>
                    </div>
                </section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xl flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                            <span className="material-icons text-3xl">report_problem</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Critical Events</p>
                            <p className="text-3xl font-bold text-slate-100">12 <span className="text-xs font-normal text-rose-500 ml-1 inline-flex items-center"><span className="material-icons text-xs mr-1">trending_up</span>+2</span></p>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xl flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                            <span className="material-icons text-3xl">group</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Users</p>
                            <p className="text-3xl font-bold text-slate-100">1,042</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xl flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <span className="material-icons text-3xl">data_usage</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Retention</p>
                            <p className="text-3xl font-bold text-slate-100">89 / 90 <span className="text-xs font-normal text-slate-500 ml-1">Days</span></p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
