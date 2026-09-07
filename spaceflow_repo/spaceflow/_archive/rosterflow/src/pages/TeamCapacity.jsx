import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeamCapacity() {
    const navigate = useNavigate();

    const teamMembers = [
        {
            name: 'Alex Henderson',
            role: 'Technician II',
            fatigue: 22,
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAAVaxqMMtg_hX28irbWcQrJ699OCiQXjM6pPSVy8RYSek9KGHyobZ8OO6gmMpVX3Ib_K1OKaFph9y-MqrHQMSbjG1vmAnmx9xLlWM5XmO6pe92fj9YRf_2f8FGvtxvoiS6UNSrefh-eOsOvGJY9umBBHZfP9lNOMOxA7LByXFcY52xCaBtYQV1NNTcQh5ithZaIfGT1nfs1UylZ9SWJLoTDlBqxMs1ogPuXtyZgp7JX1YUCXNChmJSpC2VOtnR9S--8vm0pNhxGGc',
            shifts: [
                { title: 'Main Valve Repair #122', detail: '08:30 - 11:30 • Sector A', left: 10, width: 240, color: 'blue' },
                { title: 'Safety Inspection Cycle', detail: '13:00 - 17:00 • District 4', left: 400, width: 320, color: 'emerald' }
            ]
        },
        {
            name: 'Sarah Jenkins',
            role: 'Lead Engineer',
            fatigue: 68,
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7NlgAbCNjsirl2caMVNn6lwvQP3nuWQ1Rjxsy3_opoLO3Y5FAW9d0Y6AVa2VukQJx_q7SKKjSBi6wAQpWmu0ASs7_pKD0x1F4vCG4a7dAf5fFZuf28c3PGBV31D2CIYBAfpXx6yAoIbfpyueIT25IR24ETEHAKIXR6jjErvTAivO6pniFwseIyApCg8iuM6irq37Efp04gW6bYk4WDJT5Y0PaBWcV1yyaC9QQbFnu__mijjYioPY47JuPly2mTlOQvO_uv-bxIYv9',
            shifts: [
                { title: 'Main Valve Repair #122', detail: '08:30 - 11:30 • Sector A', left: 10, width: 240, color: 'blue' },
                { title: 'Documentation', detail: '13:00 - 15:00 • Base', left: 400, width: 160, color: 'slate' }
            ]
        },
        {
            name: 'Marcus Vane',
            role: 'Hydrant Specialist',
            fatigue: 14,
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDInKvTaxF3kjwndOTSmhjLYpMXVLLH2cYp8ylVbDIfVeinfqS8h8OAaSnDLZJymJbXhFlbS9A3xnHOuvG98HozoSSukbgE8n7FNwq6LeOyoPNAWVAp54p8Adyzz9vhGDIWyYbdLYu0jLgpw0p7Tog8rdzBDfceoZLAzWEznQZapZbORRBR9N0x1hOMGnLPHSYazTGJIyk1_wpwbETTBycvF4MC6RWduP8XaAM5qT6QdFo3-xMsM5h5j3lzBn0ED-97DZ6OFr3hGKww',
            shifts: [
                { title: 'Hydrant Flush Program', detail: '12:00 - 17:00 • Sector 4B', left: 320, width: 400, color: 'emerald' }
            ]
        },
        {
            name: 'Dave Miller',
            role: 'Technician I',
            fatigue: 89,
            img: null,
            shifts: [
                { title: 'Emergency: Burst Pipe', detail: '08:30 - 11:30 • Overtime', left: 10, width: 240, color: 'red' }
            ]
        }
    ];

    const getFatigueColor = (fatigue) => {
        if (fatigue < 30) return 'emerald';
        if (fatigue < 70) return 'amber';
        return 'red';
    };

    return (
        <div className="bg-background-dark font-display text-slate-100 antialiased overflow-hidden h-screen flex flex-col">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="hover:bg-slate-800 p-2 rounded-lg transition-colors text-slate-400">
                        <span className="material-icons">arrow_back</span>
                    </button>
                    <div className="h-8 w-px bg-slate-800 mx-1"></div>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            Water Maintenance <span className="text-slate-500 font-normal">/ Team 01</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Shift 08:00 - 18:00 • Sector 4B</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-md flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-semibold">Active</span>
                        </div>
                    </div>
                    <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
                        <span className="material-icons text-sm">edit</span>
                        Modify Assignments
                    </button>
                    <img
                        alt="Admin"
                        className="h-9 w-9 rounded-full object-cover border-2 border-slate-700"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYCozlxZDIQbjWudFGs3CSwKNjlo4Pe_5_IJLLqSl7o9nU2Fpn75MSBSA8ArR9uFvdF_pSKN_FqD2RXHlB54Qoxl6rk4XR351MvU3cRFqpL0COuHXfNwHPgluzcpEjdHGEDx9gYvnITkLhRWniSGmdV2aceWxcDB1xKIDV2j1948VCfno6pQxn4lgh4yvVZwD9BRrLZYdsW6tAsJijLkCWH-BXAhCQbRZBfRZYSn2as5x4S-rm2ye3oShqh0DAKf6VIt0taQ4Pi1Qu"
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Staff Timeline Section */}
                <section className="flex-1 flex flex-col min-w-0">
                    {/* Time Header */}
                    <div className="h-12 border-b border-slate-800 flex bg-slate-900 shrink-0 sticky top-0 z-40">
                        <div className="w-64 shrink-0 border-r border-slate-700 p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Staff Member / Fatigue
                        </div>
                        <div className="flex flex-1 overflow-hidden">
                            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((time, idx) => (
                                <div
                                    key={time}
                                    className={`w-40 shrink-0 border-r border-slate-800 p-4 text-center text-[11px] font-bold ${time === '12:00' ? 'text-primary bg-primary/5' : 'text-slate-500'}`}
                                >
                                    {time}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Staff Rows */}
                    <div className="flex-1 overflow-auto custom-scrollbar bg-slate-950/20 gantt-grid">
                        {teamMembers.map((member, idx) => (
                            <div key={idx} className="flex border-b border-slate-800/60 min-h-[120px] group hover:bg-slate-800/10 transition-colors">
                                {/* Staff Info */}
                                <div className="w-64 shrink-0 border-r border-slate-700 p-4 bg-slate-900/80 sticky left-0 z-20 flex flex-col justify-between">
                                    <div className="flex items-center gap-3">
                                        {member.img ? (
                                            <img
                                                alt={member.name}
                                                className="h-10 w-10 rounded-full border-2 border-slate-700"
                                                src={member.img}
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
                                                <span className="material-icons text-slate-500">person</span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-white">{member.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase">{member.role}</p>
                                        </div>
                                    </div>

                                    {/* Fatigue Meter */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-[10px] font-bold mb-1">
                                            <span className="text-slate-500 uppercase tracking-tighter">Fatigue Meter</span>
                                            <span className={`text-${getFatigueColor(member.fatigue)}-400`}>{member.fatigue}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                                            <div
                                                className={`bg-${getFatigueColor(member.fatigue)}-500 h-full`}
                                                style={{ width: `${member.fatigue}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline with Shifts */}
                                <div className="flex-1 relative min-w-[960px]">
                                    {member.shifts.map((shift, shiftIdx) => (
                                        <div
                                            key={shiftIdx}
                                            className={`absolute top-8 h-16 bg-${shift.color}-600 border border-${shift.color}-400 rounded-xl p-3 shadow-lg shadow-${shift.color}-900/40 cursor-pointer`}
                                            style={{ left: `${shift.left}px`, width: `${shift.width}px` }}
                                        >
                                            <p className="text-[11px] font-bold text-white">{shift.title}</p>
                                            <p className={`text-[10px] ${shift.color === 'slate' ? 'text-slate-300' : `text-${shift.color}-100/70`}`}>{shift.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Right Sidebar */}
                <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
                    {/* Assigned Vehicle */}
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                            <span className="material-icons text-sm">local_shipping</span> Assigned Vehicle
                        </h3>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-sm font-bold text-white">Utility Truck #742</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Ford F-550 Service Body</p>
                                </div>
                                <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">READY</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Fuel Level</p>
                                    <p className="text-xs font-bold text-white">82%</p>
                                </div>
                                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Odometer</p>
                                    <p className="text-xs font-bold text-white">42,480 mi</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Efficiency */}
                    <div className="p-6 border-b border-slate-800">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Team Total Efficiency</h3>
                        <div className="relative flex items-center justify-center">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle className="text-slate-800" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                                <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="72" strokeWidth="8"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-white">82%</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Optimal</span>
                            </div>
                        </div>
                    </div>

                    {/* Tool Inventory */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <div className="p-6 pb-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <span className="material-icons text-sm">construction</span> Tool Inventory
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
                            {[
                                { name: 'Valve Actuator #09', serial: 'VA-2210', icon: 'precision_manufacturing', status: 'ok' },
                                { name: 'Flow Meter (Digi)', serial: 'FM-9942', icon: 'speed', status: 'ok' },
                                { name: 'Hydraulic Jack Kit', serial: 'HJ-5541', icon: 'build_circle', status: 'warning' },
                                { name: 'Wrench Set (Std)', serial: 'WS-0120', icon: 'home_repair_service', status: 'ok' }
                            ].map((tool, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 bg-slate-800/40 border border-slate-800 rounded-lg">
                                    <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400">{tool.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-200">{tool.name}</p>
                                        <p className="text-[10px] text-slate-500">Serial: {tool.serial}</p>
                                    </div>
                                    <span className={`material-icons text-${tool.status === 'ok' ? 'emerald' : 'amber'}-500 text-sm`}>
                                        {tool.status === 'ok' ? 'check_circle' : 'priority_high'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>

            {/* Footer */}
            <footer className="h-10 border-t border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 text-[10px] font-bold text-slate-500 tracking-wider">
                <div className="flex items-center gap-6">
                    {[
                        { color: 'blue-600', label: 'MAINTENANCE' },
                        { color: 'emerald-600', label: 'ROUTINE' },
                        { color: 'red-600', label: 'EMERGENCY' },
                        { color: 'slate-600', label: 'ADMIN' }
                    ].map((item) => (
                        <span key={item.label} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 bg-${item.color} rounded-full`}></span> {item.label}
                        </span>
                    ))}
                </div>
                <div>VERSION 4.2.1-BETA • SYSTEM UPTIME 99.9%</div>
            </footer>
        </div>
    );
}
