import React from 'react';

export default function RetentionPolicy() {
    return (
        <div className="bg-background-dark font-display text-slate-100 antialiased min-h-screen">
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
                        <span className="material-icons text-primary text-2xl">storage</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Audit Retention &amp; Archiving Policy</h1>
                        <p className="text-xs text-slate-400">Administrative controls for audit log lifecycle • <span className="text-primary font-medium">Policy Management</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        Save Changes
                    </button>
                </div>
            </header>
            <main className="p-6 max-w-[1400px] mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Storage Consumption</p>
                            <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Optimal</span>
                        </div>
                        <div className="flex items-end gap-2 mb-4">
                            <p className="text-3xl font-bold text-slate-100">425.8 <span className="text-sm font-normal text-slate-500">GB</span></p>
                            <p className="text-sm text-slate-500 mb-1">/ 1 TB Total</p>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: '42.5%' }}></div>
                        </div>
                        <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                            <span className="material-icons text-xs">trending_up</span>
                            Projected to reach 1TB in approx. 140 days
                        </p>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Current Retention</p>
                            <p className="text-3xl font-bold text-slate-100">90 <span className="text-sm font-normal text-slate-500">Days</span></p>
                        </div>
                        <p className="text-xs text-slate-500">Logs older than 90 days are automatically archived and purged from live storage.</p>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Export Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <p className="text-xl font-bold text-slate-100 italic">Streaming</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400 border border-slate-700">AWS S3</span>
                            <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400 border border-slate-700">LOCAL</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-6">
                        <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                                <span className="material-icons text-primary text-lg">history</span>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Retention Period</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-xs text-slate-400 mb-2 leading-relaxed">Define how long audit logs remain in the primary database before being offloaded to cold storage.</p>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                                        <input defaultChecked className="text-primary focus:ring-primary bg-slate-900 border-slate-700" name="retention" type="radio" />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-slate-200">90 Days</span>
                                            <span className="block text-[10px] text-slate-500">Recommended for standard compliance</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                                        <input className="text-primary focus:ring-primary bg-slate-900 border-slate-700" name="retention" type="radio" />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-slate-200">180 Days</span>
                                            <span className="block text-[10px] text-slate-500">Extended operational visibility</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                                        <input className="text-primary focus:ring-primary bg-slate-900 border-slate-700" name="retention" type="radio" />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-slate-200">365 Days</span>
                                            <span className="block text-[10px] text-slate-500">Annual auditing requirements</span>
                                        </div>
                                    </label>
                                </div>
                                <div className="pt-4 border-t border-slate-800">
                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">Custom (Days)</label>
                                    <input className="w-full py-2 text-sm border-slate-700 bg-slate-800 text-slate-200 rounded-lg focus:ring-primary focus:border-primary" placeholder="Enter custom value..." type="number" />
                                </div>
                            </div>
                        </section>
                        <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                                <span className="material-icons text-emerald-500 text-lg">cloud_upload</span>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Export Targets</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                                            <span className="material-icons text-lg">storage</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">AWS S3</p>
                                            <p className="text-[10px] text-slate-500">Bucket: audit-logs-prod</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input defaultChecked className="sr-only peer" type="checkbox" />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                            <span className="material-icons text-lg">cloud_queue</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">Google Cloud</p>
                                            <p className="text-[10px] text-slate-500">Not configured</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input className="sr-only peer" type="checkbox" />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400">
                                            <span className="material-icons text-lg">dns</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">Local SFTP</p>
                                            <p className="text-[10px] text-slate-500">10.0.4.12:22</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input defaultChecked className="sr-only peer" type="checkbox" />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </div>
                                <button className="w-full mt-2 py-2 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 rounded hover:bg-primary/10 transition-colors">
                                    Configure New Target
                                </button>
                            </div>
                        </section>
                    </div>
                    <div className="lg:col-span-8">
                        <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl flex flex-col min-h-[600px] overflow-hidden">
                            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-icons text-amber-500 text-lg">inventory_2</span>
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Manual Archives</h2>
                                </div>
                                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-slate-700 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                                    <span className="material-icons text-sm">add</span>
                                    Create Manual Archive
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left border-collapse table-fixed-header archive-table">
                                    <thead className="bg-slate-800/80 backdrop-blur-sm text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3 border-b border-slate-700">Archive Name</th>
                                            <th className="px-6 py-3 w-40 border-b border-slate-700">Date Range</th>
                                            <th className="px-6 py-3 w-32 border-b border-slate-700">Size</th>
                                            <th className="px-6 py-3 w-40 border-b border-slate-700">Created On</th>
                                            <th className="px-6 py-3 w-28 border-b border-slate-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        <tr className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-icons text-slate-500">description</span>
                                                    <div>
                                                        <p className="font-semibold text-slate-200">Q3_2023_Compliance_Audit.tar.gz</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Checksum: 8B4F...2A11</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400">Jul 1 - Sep 30, 2023</td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-300">12.4 GB</td>
                                            <td className="px-6 py-4 text-xs text-slate-500">2023-10-01 04:00</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-500 hover:text-primary transition-colors"><span className="material-icons text-xl">download</span></button>
                                                <button className="text-slate-500 hover:text-rose-500 ml-3 transition-colors"><span className="material-icons text-xl">delete_outline</span></button>
                                            </td>
                                        </tr>
                                        {/* Additional rows */}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
                                <p className="text-xs text-slate-500">Storage Location: <span className="text-slate-400">Primary Archive Vault (Cold Tier)</span></p>
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 text-slate-600 hover:text-primary" disabled><span className="material-icons text-lg">chevron_left</span></button>
                                    <span className="text-xs font-bold px-2 text-slate-400">1 / 1</span>
                                    <button className="p-1.5 text-slate-600 hover:text-primary" disabled><span className="material-icons text-lg">chevron_right</span></button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
