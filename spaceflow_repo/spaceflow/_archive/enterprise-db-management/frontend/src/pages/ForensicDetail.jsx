import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForensicDetail() {
    const navigate = useNavigate();
    return (
        <div className="bg-background-dark font-display text-slate-100 antialiased min-h-screen">
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                        <span className="material-icons">arrow_back</span>
                    </button>
                    <div className="h-8 w-[1px] bg-slate-800"></div>
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500/20 p-2 rounded-lg border border-amber-500/30">
                            <span className="material-symbols-outlined text-amber-500 text-2xl">fingerprint</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">Audit Event Forensic Detail</h1>
                            <p className="text-xs text-slate-400">Event ID: <span className="font-mono text-primary">evt_9k2m8Lp20xZ</span> • Security Forensics</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-slate-700 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                        <span className="material-icons text-sm">download</span>
                        Download Report
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        <span className="material-icons text-sm">share</span>
                        Share Investigation
                    </button>
                </div>
            </header>
            <main className="p-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3 inline-block">High Severity Warning</span>
                                    <h2 className="text-2xl font-bold text-white mb-1">Permission Change: Elevated Access</h2>
                                    <p className="text-slate-400 text-sm">System Engine modified roles for <span className="text-slate-200 font-semibold">AP-EAST-1 (Node 91)</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Timestamp</p>
                                    <p className="text-sm font-mono text-slate-200">2023-11-24 13:58:44.901 UTC</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-800/50">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Actor</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-bold">SY</div>
                                        <span className="text-sm font-semibold">System Engine</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Action Type</p>
                                    <span className="text-sm font-semibold text-slate-200">IAM_POLICY_UPDATE</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Request Status</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span className="text-sm font-semibold text-emerald-500">Success (200 OK)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <span className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                                <span className="material-icons text-sm text-primary">code</span>
                                Data Delta Change
                            </span>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">- 2 deletions</span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">+ 3 additions</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 bg-slate-950 font-mono text-xs leading-relaxed overflow-hidden">
                            <div className="p-2 border-r border-slate-800 text-slate-500 bg-slate-900/20">Old Value (Previous State)</div>
                            <div className="p-2 text-slate-500 bg-slate-900/20">New Value (Modified State)</div>
                        </div>
                        {/* Diff View */}
                        <div className="grid grid-cols-2 bg-slate-950 font-mono text-xs leading-relaxed min-h-[300px]" style={{
                            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)",
                            backgroundSize: "50% 100%"
                        }}>
                            <div className="p-4 border-r border-slate-800 overflow-x-auto">
                                <div className="text-slate-400 whitespace-pre">{"{"}</div>
                                <div className="text-slate-400 whitespace-pre">  "resource": "SRV-091",</div>
                                <div className="text-slate-400 whitespace-pre">  "permissions": [</div>
                                <div className="bg-red-900/30 -mx-4 px-4 text-slate-300 whitespace-pre"><span className="text-red-500 mr-2">-</span>    "read_only",</div>
                                <div className="bg-red-900/30 -mx-4 px-4 text-slate-300 whitespace-pre"><span className="text-red-500 mr-2">-</span>    "audit_logs"</div>
                                <div className="text-slate-400 whitespace-pre">  ],</div>
                                <div className="text-slate-400 whitespace-pre">  "mfa_required": false,</div>
                                <div className="text-slate-400 whitespace-pre">  "trust_score": 0.98</div>
                                <div className="text-slate-400 whitespace-pre">{"}"}</div>
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <div className="text-slate-400 whitespace-pre">{"{"}</div>
                                <div className="text-slate-400 whitespace-pre">  "resource": "SRV-091",</div>
                                <div className="text-slate-400 whitespace-pre">  "permissions": [</div>
                                <div className="bg-emerald-900/30 -mx-4 px-4 text-slate-100 whitespace-pre"><span className="text-emerald-500 mr-2">+</span>    "full_access",</div>
                                <div className="bg-emerald-900/30 -mx-4 px-4 text-slate-100 whitespace-pre"><span className="text-emerald-500 mr-2">+</span>    "admin_write",</div>
                                <div className="bg-emerald-900/30 -mx-4 px-4 text-slate-100 whitespace-pre"><span className="text-emerald-500 mr-2">+</span>    "delete_resource"</div>
                                <div className="text-slate-400 whitespace-pre">  ],</div>
                                <div className="text-slate-400 whitespace-pre">  "mfa_required": true,</div>
                                <div className="text-slate-400 whitespace-pre">  "trust_score": 0.98</div>
                                <div className="text-slate-400 whitespace-pre">{"}"}</div>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="space-y-6">
                    <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                            <span className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                                <span className="material-icons text-sm text-primary">analytics</span>
                                Network Forensics
                            </span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Request ID</p>
                                <p className="text-sm font-mono text-slate-200 select-all">req_6692_az_west_f92</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Originating IP Address</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-mono text-primary font-bold">52.191.24.118</p>
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">Internal VPC</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Geographical Location</p>
                                <div className="flex items-center gap-2">
                                    <span className="material-icons text-sm text-slate-400">location_on</span>
                                    <p className="text-sm text-slate-200">Tokyo, Japan <span class="text-slate-500">(AP-NORTHEAST-1)</span></p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">User Agent String</p>
                                <div className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-slate-400 leading-relaxed break-all border border-slate-800">
                                    Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                            <span className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                                <span className="material-icons text-sm text-primary">history</span>
                                Adjacent Events
                            </span>
                        </div>
                        <div className="divide-y divide-slate-800">
                            <div className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-xs font-semibold text-slate-200">System Login Success</p>
                                    <span className="text-[10px] text-slate-500">- 4m 12s</span>
                                </div>
                                <p className="text-[10px] text-slate-500">MFA token verified for System Engine</p>
                            </div>
                            <div className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-xs font-semibold text-slate-200">Policy Template Fetched</p>
                                    <span className="text-[10px] text-slate-500">- 0m 45s</span>
                                </div>
                                <p className="text-[10px] text-slate-500">GET /v1/templates/iam/privileged</p>
                            </div>
                            <div className="p-4 bg-primary/5 border-l-2 border-primary">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-xs font-semibold text-primary">Current Forensic Event</p>
                                    <span className="text-[10px] text-primary">Now</span>
                                </div>
                                <p className="text-[10px] text-primary/80">Permission Change: Elevated Access</p>
                            </div>
                        </div>
                        <button className="w-full py-3 text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-slate-800">
                            View Timeline (32 events)
                        </button>
                    </section>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Risk Score</p>
                            <p className="text-2xl font-bold text-rose-500">84/100</p>
                        </div>
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Compliance</p>
                            <p className="text-2xl font-bold text-emerald-500">SOC2</p>
                        </div>
                    </div>
                </div>
            </main>
            <div className="fixed bottom-6 right-6 flex gap-3">
                <button className="h-12 w-12 rounded-full bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center shadow-2xl hover:text-white hover:border-slate-500 transition-all">
                    <span className="material-icons">help_outline</span>
                </button>
                <button className="h-12 px-6 rounded-full bg-slate-100 text-slate-900 font-bold flex items-center gap-2 shadow-2xl hover:bg-white transition-all">
                    <span className="material-icons text-sm">flag</span>
                    Flag as Suspicious
                </button>
            </div>
        </div>
    );
}
