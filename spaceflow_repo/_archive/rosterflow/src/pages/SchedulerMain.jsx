import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SchedulerMain() {
    const navigate = useNavigate();
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    return (
        <div className="bg-background-dark font-display text-slate-100 antialiased overflow-hidden h-screen flex flex-col">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-icons text-white">grid_view</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        RosterFlow <span className="text-primary font-medium text-sm align-top ml-1">Admin</span>
                    </h1>
                </div>

                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative group">
                        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border-slate-700 text-slate-200 focus:ring-2 focus:ring-primary focus:bg-slate-700 rounded-lg transition-all text-sm outline-none border"
                            placeholder="Search shifts, personnel, or interventions..."
                            type="text"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-xs font-semibold text-primary">Live Sync</span>
                        <span className="text-[10px] text-slate-500 uppercase">Last update: 2m ago</span>
                    </div>
                    <button className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                        <span className="material-icons text-sm">cloud_upload</span>
                        Publish Roster
                    </button>
                    <div className="h-8 w-px bg-slate-800 mx-2"></div>
                    <img
                        alt="Admin Profile"
                        className="h-9 w-9 rounded-full object-cover border-2 border-slate-700 shadow-sm"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYCozlxZDIQbjWudFGs3CSwKNjlo4Pe_5_IJLLqSl7o9nU2Fpn75MSBSA8ArR9uFvdF_pSKN_FqD2RXHlB54Qoxl6rk4XR351MvU3cRFqpL0COuHXfNwHPgluzcpEjdHGEDx9gYvnITkLhRWniSGmdV2aceWxcDB1xKIDV2j1948VCfno6pQxn4lgh4yvVZwD9BRrLZYdsW6tAsJijLkCWH-BXAhCQbRZBfRZYSn2as5x4S-rm2ye3oShqh0DAKf6VIt0taQ4Pi1Qu"
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
                    {/* Available Personnel */}
                    <div className="flex-1 flex flex-col min-h-0 border-b border-slate-800">
                        <div className="p-4 flex items-center justify-between bg-slate-900/50">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <span className="material-icons text-sm">people</span> Available Personnel
                            </h2>
                            <span className="bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">
                                12 ONLINE
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {[
                                { name: 'Alex Henderson', role: 'Technician II (Elec)', status: 'online', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAAVaxqMMtg_hX28irbWcQrJ699OCiQXjM6pPSVy8RYSek9KGHyobZ8OO6gmMpVX3Ib_K1OKaFph9y-MqrHQMSbjG1vmAnmx9xLlWM5XmO6pe92fj9YRf_2f8FGvtxvoiS6UNSrefh-eOsOvGJY9umBBHZfP9lNOMOxA7LByXFcY52xCaBtYQV1NNTcQh5ithZaIfGT1nfs1UylZ9SWJLoTDlBqxMs1ogPuXtyZgp7JX1YUCXNChmJSpC2VOtnR9S--8vm0pNhxGGc' },
                                { name: 'Sarah Jenkins', role: 'Lead Engineer (Water)', status: 'online', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7NlgAbCNjsirl2caMVNn6lwvQP3nuWQ1Rjxsy3_opoLO3Y5FAW9d0Y6AVa2VukQJx_q7SKKjSBi6wAQpWmu0ASs7_pKD0x1F4vCG4a7dAf5fFZuf28c3PGBV31D2CIYBAfpXx6yAoIbfpyueIT25IR24ETEHAKIXR6jjErvTAivO6pniFwseIyApCg8iuM6irq37Efp04gW6bYk4WDJT5Y0PaBWcV1yyaC9QQbFnu__mijjYioPY47JuPly2mTlOQvO_uv-bxIYv9' },
                                { name: 'Marcus Vane', role: 'Break • Ends 14:00', status: 'break', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDInKvTaxF3kjwndOTSmhjLYpMXVLLH2cYp8ylVbDIfVeinfqS8h8OAaSnDLZJymJbXhFlbS9A3xnHOuvG98HozoSSukbgE8n7FNwq6LeOyoPNAWVAp54p8Adyzz9vhGDIWyYbdLYu0jLgpw0p7Tog8rdzBDfceoZLAzWEznQZapZbORRBR9N0x1hOMGnLPHSYazTGJIyk1_wpwbETTBycvF4MC6RWduP8XaAM5qT6QdFo3-xMsM5h5j3lzBn0ED-97DZ6OFr3hGKww' }
                            ].map((person, idx) => (
                                <div
                                    key={idx}
                                    className={`p-2 rounded-lg border border-slate-800 bg-slate-800/40 hover:border-primary/50 hover:bg-slate-800 cursor-grab active:cursor-grabbing transition-colors flex items-center gap-3 group ${person.status === 'break' ? 'opacity-60' : ''}`}
                                >
                                    <div className="relative">
                                        <img
                                            alt="Staff"
                                            className="h-8 w-8 rounded-full border border-slate-700"
                                            src={person.img}
                                        />
                                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${person.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'} border-2 border-slate-900 rounded-full`}></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-200 group-hover:text-white">{person.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">{person.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Orders */}
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-950/20">
                        <div className="p-4 flex items-center justify-between bg-slate-900 border-b border-slate-800">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <span className="material-icons text-sm">assignment_late</span> Pending Orders
                            </h2>
                            <span className="text-[10px] font-bold text-primary">05 NEW</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                            <div
                                onClick={() => setShowAssignmentModal(true)}
                                className="bg-slate-800 p-3 rounded-lg shadow-lg border-l-4 border-accent-red cursor-grab active:cursor-grabbing hover:bg-slate-700/80 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold text-slate-500">#WO-9842</span>
                                    <span className="bg-red-900/40 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Urgent</span>
                                </div>
                                <p className="text-xs font-bold text-slate-200 mb-2">Main Pipe Leak - Sector 4B</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span className="material-icons text-[12px]">schedule</span> 2h 30m
                                    <span className="material-icons text-[12px] ml-1">water_drop</span> Water Dept
                                </div>
                            </div>

                            <div className="bg-slate-800 p-3 rounded-lg shadow-lg border-l-4 border-primary cursor-grab active:cursor-grabbing hover:bg-slate-700/80 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold text-slate-500">#WO-9845</span>
                                    <span className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Standard</span>
                                </div>
                                <p className="text-xs font-bold text-slate-200 mb-2">HVAC Inspection - Tower C</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span className="material-icons text-[12px]">schedule</span> 1h 00m
                                    <span className="material-icons text-[12px] ml-1">ac_unit</span> HVAC
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Scheduler Section */}
                <section className="flex-1 flex flex-col min-w-0 bg-background-dark">
                    {/* Toolbar */}
                    <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-slate-900 z-20">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center bg-slate-800 p-1 rounded-lg">
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-slate-700 shadow-sm text-primary">Day</button>
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-slate-200 transition-colors">Week</button>
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-slate-200 transition-colors">Month</button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-1 hover:bg-slate-800 rounded-full transition-colors">
                                    <span className="material-icons text-xl text-slate-500">chevron_left</span>
                                </button>
                                <span className="text-sm font-bold text-slate-200">Monday, Oct 23, 2023</span>
                                <button className="p-1 hover:bg-slate-800 rounded-full transition-colors">
                                    <span className="material-icons text-xl text-slate-500">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-800/50 px-3 py-1.5 rounded-lg">
                                <span className="material-icons text-amber-500 text-sm">warning</span>
                                <span className="text-xs font-bold text-amber-400">Team 01 overbooked</span>
                            </div>
                            <div className="h-8 w-px bg-slate-800 mx-1"></div>
                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                <span className="material-icons text-xl">filter_list</span>
                            </button>
                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                <span className="material-icons text-xl">settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Gantt Chart */}
                    <div className="flex-1 relative overflow-auto custom-scrollbar">
                        {/* Time Header */}
                        <div className="sticky top-0 z-40 flex bg-slate-900 border-b border-slate-700 shadow-xl">
                            <div className="w-48 shrink-0 border-r border-slate-700 p-4 text-xs font-bold uppercase text-slate-500 bg-slate-900">
                                Teams / Assets
                            </div>
                            <div className="flex flex-1">
                                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time, idx) => (
                                    <div
                                        key={time}
                                        className={`w-32 flex-none border-r border-slate-800 p-4 text-center text-[11px] font-bold ${time === '10:00' ? 'text-primary bg-primary/5' : 'text-slate-500'}`}
                                    >
                                        {time}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative min-h-full gantt-line">
                            {/* Current Time Indicator */}
                            <div className="absolute top-0 bottom-0 left-[304px] w-px bg-primary z-30 shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                                <div className="absolute -top-1.5 -left-1 w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-primary/20"></div>
                            </div>

                            {/* Team Rows */}
                            {[
                                {
                                    name: 'Water Maintenance', team: 'Team 01 • 4 Staff', shifts: [
                                        { title: 'Main Valve Repair #122', time: '08:30 - 10:00', left: 16, width: 48, color: 'blue' },
                                        { title: 'Routine Hydrant Flush', time: '13:00 - 15:00', left: 384, width: 64, color: 'emerald' }
                                    ]
                                },
                                {
                                    name: 'Grid Operations', team: 'Team 02 • 3 Staff', shifts: [
                                        { title: 'Transformer Check', time: '10:00 - 11:30', left: 200, width: 40, color: 'amber' },
                                        { title: 'EMERGENCY: Power Line 4', time: '10:30 - 12:00', left: 240, width: 44, color: 'red', emergency: true }
                                    ]
                                },
                                { name: 'Gas Safety', team: 'Team 03 • 2 Staff', shifts: [] },
                                {
                                    name: 'Climate Systems', team: 'Team 04 • 5 Staff', shifts: [
                                        { title: 'Filter Replacement', time: '14:00 - 15:30', left: 512, width: 44, color: 'slate' }
                                    ]
                                }
                            ].map((row, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => navigate('/team/01')}
                                    className="flex border-b border-slate-800/50 group h-24 bg-slate-900/20 hover:bg-slate-800/20 transition-colors cursor-pointer"
                                >
                                    <div className="w-48 shrink-0 border-r border-slate-700 p-4 sticky left-0 bg-slate-900 z-10 flex flex-col justify-center">
                                        <span className="text-sm font-bold text-slate-200">{row.name}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">{row.team}</span>
                                    </div>

                                    <div className="flex flex-1 relative">
                                        {row.shifts.map((shift, shiftIdx) => (
                                            <div
                                                key={shiftIdx}
                                                className={`absolute top-5 h-14 bg-${shift.color}-${shift.emergency ? '500' : '500'} border-2 border-${shift.color}-400 rounded-xl p-3 flex flex-col justify-center cursor-pointer shadow-lg shadow-${shift.color}-500/20 hover:scale-[1.02] transition-transform z-20 ${shift.emergency ? 'border-dashed z-30 shadow-xl' : ''}`}
                                                style={{ left: `${shift.left}px`, width: `${shift.width * 4}px` }}
                                            >
                                                <span className="text-[11px] font-bold text-white truncate">{shift.title}</span>
                                                <span className={`text-[10px] ${shift.color === 'slate' ? 'text-slate-200/80' : `text-${shift.color}-${shift.emergency ? '50' : '100'}/80`}`}>{shift.time}</span>
                                            </div>
                                        ))}

                                        {/* Time slots */}
                                        {[...Array(9)].map((_, i) => (
                                            <div key={i} className={`w-32 border-r border-slate-800/30 ${i === 2 ? 'bg-primary/5' : ''}`}></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="h-12 border-t border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-30">
                        <div className="flex items-center gap-6">
                            {[
                                { color: 'blue', label: 'Maintenance' },
                                { color: 'emerald', label: 'Routine' },
                                { color: 'red', label: 'Emergency' }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-sm bg-${item.color}-500 border border-${item.color}-400`}></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-[10px] font-medium text-slate-500">
                            Showing <span className="text-slate-300">12 teams</span> • <span className="text-slate-300">48 staff members</span> • <span className="text-primary font-bold">8 unassigned tasks</span>
                        </div>
                    </footer>
                </section>
            </main>

            {/* Scheduling Conflicts Alert */}
            <div className="fixed bottom-16 right-6 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all ring-1 ring-white/5">
                <div className="bg-amber-600 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-icons text-white text-lg">error_outline</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Scheduling Conflicts (2)</span>
                    </div>
                    <button className="text-white hover:bg-white/20 p-1 rounded-full">
                        <span className="material-icons text-xs">close</span>
                    </button>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                        <div className="bg-amber-900/40 p-2 rounded-lg h-fit border border-amber-500/20">
                            <span className="material-icons text-amber-500 text-sm">event_busy</span>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-200">Personnel Double-Booking</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Alex Henderson is assigned to two concurrent shifts in Team 01 & 02.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-slate-700">
                        <div className="bg-red-900/40 p-2 rounded-lg h-fit border border-red-500/20">
                            <span className="material-symbols-outlined text-red-500 text-sm">engineering</span>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-200">Skill Gap Detected</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Team 03 (Gas) requires a 'Senior Inspector'. No staff available.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/conflicts')}
                        className="w-full mt-2 py-2 text-[11px] font-bold text-primary hover:bg-primary/10 rounded transition-colors uppercase tracking-wider border border-primary/30"
                    >
                        Auto-Resolve All
                    </button>
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignmentModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <span className="material-symbols-outlined text-primary">assignment_add</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white leading-none">Advanced Shift Assignment</h2>
                                    <p className="text-xs text-slate-500 mt-1">Configure task details, personnel, and assets for #WO-9842</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAssignmentModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="grid grid-cols-12 gap-8">
                                {/* Left Column */}
                                <div className="col-span-12 lg:col-span-7 space-y-6">
                                    <section>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Task Specification</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Task Nature</label>
                                                <div className="relative group">
                                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">construction</span>
                                                    <input
                                                        className="w-full bg-slate-800 border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                                        type="text"
                                                        defaultValue="Main Valve Repair - Sector 4B"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Estimated Duration</label>
                                                <select className="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary">
                                                    <option>2 Hours 30 Minutes</option>
                                                    <option>4 Hours</option>
                                                    <option>Full Shift (8h)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Priority Level</label>
                                                <div className="flex gap-2">
                                                    <button className="flex-1 py-2 rounded-lg bg-red-900/20 border border-red-500/50 text-red-500 text-xs font-bold ring-2 ring-red-500/20">Urgent</button>
                                                    <button className="flex-1 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold hover:bg-slate-700 transition-colors">Standard</button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Smart Recommendation</h3>
                                            <span className="bg-emerald-900/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">Match Score: 98%</span>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { name: 'Alex Henderson', tags: ['L3 ELECTR', 'SAFETY CERT'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAAVaxqMMtg_hX28irbWcQrJ699OCiQXjM6pPSVy8RYSek9KGHyobZ8OO6gmMpVX3Ib_K1OKaFph9y-MqrHQMSbjG1vmAnmx9xLlWM5XmO6pe92fj9YRf_2f8FGvtxvoiS6UNSrefh-eOsOvGJY9umBBHZfP9lNOMOxA7LByXFcY52xCaBtYQV1NNTcQh5ithZaIfGT1nfs1UylZ9SWJLoTDlBqxMs1ogPuXtyZgp7JX1YUCXNChmJSpC2VOtnR9S--8vm0pNhxGGc', primary: true },
                                                { name: 'Sarah Jenkins', tags: ['LEAD ENG', 'WATER MGT'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7NlgAbCNjsirl2caMVNn6lwvQP3nuWQ1Rjxsy3_opoLO3Y5FAW9d0Y6AVa2VukQJx_q7SKKjSBi6wAQpWmu0ASs7_pKD0x1F4vCG4a7dAf5fFZuf28c3PGBV31D2CIYBAfpXx6yAoIbfpyueIT25IR24ETEHAKIXR6jjErvTAivO6pniFwseIyApCg8iuM6irq37Efp04gW6bYk4WDJT5Y0PaBWcV1yyaC9QQbFnu__mijjYioPY47JuPly2mTlOQvO_uv-bxIYv9', primary: false }
                                            ].map((person, idx) => (
                                                <div key={idx} className={`p-3 bg-slate-800/50 border ${person.primary ? 'border-primary/30' : 'border-slate-700/50'} rounded-xl flex items-center justify-between group hover:border-${person.primary ? 'primary' : 'slate-600'} transition-all`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <img alt="Avatar" className="w-10 h-10 rounded-full border border-slate-700" src={person.img} />
                                                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 border-2 border-slate-900 rounded-full"></span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-200">{person.name}</p>
                                                            <div className="flex gap-1 mt-1">
                                                                {person.tags.map((tag, i) => (
                                                                    <span key={i} className={`text-[9px] ${i === 0 ? 'bg-blue-900/30 text-blue-400 border-blue-500/20' : i === 1 ? 'bg-purple-900/30 text-purple-400 border-purple-500/20' : 'bg-amber-900/30 text-amber-400 border-amber-500/20'} px-1.5 py-0.5 rounded border`}>{tag}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className={`${person.primary ? 'bg-primary hover:bg-primary/80 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'} text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors`}>
                                                        ASSIGN
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column */}
                                <div className="col-span-12 lg:col-span-5 space-y-6">
                                    <section>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Equipment & Vehicle</h3>
                                        <div className="bg-slate-950/40 rounded-xl border border-slate-800 p-4 space-y-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Assigned Vehicle</label>
                                                <div className="relative">
                                                    <select className="w-full bg-slate-800 border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 appearance-none focus:ring-2 focus:ring-primary focus:border-primary">
                                                        <option>Utility Truck #U-204 (Active)</option>
                                                        <option>Heavy Duty Truck #H-102 (Maintenance)</option>
                                                        <option>Van #V-092 (Available)</option>
                                                    </select>
                                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">local_shipping</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Toolbox Checklist</label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {[
                                                        { name: 'Hydraulic Pipe Cutter', asset: 'TC-441 • Bin A-4', checked: true },
                                                        { name: 'Digital Flow Meter', asset: 'DM-902 • Bin C-2', checked: true },
                                                        { name: 'Safety Barrier Kit', asset: 'SK-012 • Loading Bay 1', checked: false }
                                                    ].map((tool, idx) => (
                                                        <label key={idx} className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                defaultChecked={tool.checked}
                                                                className="rounded border-slate-700 bg-slate-900 text-primary focus:ring-offset-slate-900"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-xs font-medium text-slate-200">{tool.name}</p>
                                                                <p className="text-[10px] text-slate-500">Asset #{tool.asset}</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-amber-500 text-lg">inventory_2</span>
                                            <div>
                                                <p className="text-xs font-bold text-amber-400">Inventory Warning</p>
                                                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                                    2" Sealing Gaskets are currently low in stock (4 remaining). Please verify availability at the warehouse before departure.
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    <img alt="S1" className="w-8 h-8 rounded-full border-2 border-slate-900" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAAVaxqMMtg_hX28irbWcQrJ699OCiQXjM6pPSVy8RYSek9KGHyobZ8OO6gmMpVX3Ib_K1OKaFph9y-MqrHQMSbjG1vmAnmx9xLlWM5XmO6pe92fj9YRf_2f8FGvtxvoiS6UNSrefh-eOsOvGJY9umBBHZfP9lNOMOxA7LByXFcY52xCaBtYQV1NNTcQh5ithZaIfGT1nfs1UylZ9SWJLoTDlBqxMs1ogPuXtyZgp7JX1YUCXNChmJSpC2VOtnR9S--8vm0pNhxGGc" />
                                    <img alt="S2" className="w-8 h-8 rounded-full border-2 border-slate-900" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7NlgAbCNjsirl2caMVNn6lwvQP3nuWQ1Rjxsy3_opoLO3Y5FAW9d0Y6AVa2VukQJx_q7SKKjSBi6wAQpWmu0ASs7_pKD0x1F4vCG4a7dAf5fFZuf28c3PGBV31D2CIYBAfpXx6yAoIbfpyueIT25IR24ETEHAKIXR6jjErvTAivO6pniFwseIyApCg8iuM6irq37Efp04gW6bYk4WDJT5Y0PaBWcV1yyaC9QQbFnu__mijjYioPY47JuPly2mTlOQvO_uv-bxIYv9" />
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-slate-400">+1</span>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-400">3 Members Assigned</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowAssignmentModal(false)} className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                                <button className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all">
                                    Confirm Assignment
                                    <span className="material-icons text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
