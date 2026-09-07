import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import MetricCard from "../components/MetricCard";
import ReplicationChart from "../components/ReplicationChart";
import BackupTimeline from "../components/BackupTimeline";
import ClusterCard from "../components/ClusterCard";
import Terminal from "../components/Terminal";

import {
    fetchMetrics,
    fetchReplicas,
    fetchBackups,
    fetchClusters,
} from "../services/api";

function generateFakeChartData() {
    // génère 36 points (une point toutes 20 min sur 12 h)
    const points = [];
    for (let i = 0; i <= 800; i += 25) {
        const y = Math.round(140 + Math.random() * 40); // entre 140‑180
        points.push({ x: i, y });
    }
    return points;
}

export default function Dashboard() {
    const [metrics, setMetrics] = useState(null);
    const [replicas, setReplicas] = useState([]);
    const [backups, setBackups] = useState([]);
    const [clusters, setClusters] = useState([]);

    // Chargement initial + rafraîchissement toutes les 10 s
    useEffect(() => {
        const loadAll = async () => {
            const [{ data: m }, { data: r }, { data: b }, { data: c }] = await Promise.all([
                fetchMetrics(),
                fetchReplicas(),
                fetchBackups(),
                fetchClusters(),
            ]);
            setMetrics(m);
            setReplicas(r);
            setBackups(b);
            setClusters(c);
        };
        loadAll();
        const interval = setInterval(loadAll, 10000);
        return () => clearInterval(interval);
    }, []);

    // --- rendu ---
    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors">
            <Header />
            <main className="flex-1 px-6 lg:px-10 py-8 max-w-7xl mx-auto">
                {/* Titre + boutons */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black">Enterprise Database Management</h1>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white">
                            <span className="material-symbols-outlined">warning</span> Emergency Pause
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                            <span className="material-symbols-outlined">add_circle</span> Add Replica
                        </button>
                    </div>
                </div>

                {/* ---------- QUICK METRICS ---------- */}
                <div className="grid gap-6 mb-8 xl:grid-cols-4">
                    <MetricCard
                        title="Replication Lag"
                        value={metrics?.replicationLagMs ?? "--"}
                        unit="ms"
                        icon="sync"
                        badge={`${metrics?.replicationLagMs ?? "--"} ms lag`}
                    />
                    <MetricCard
                        title="Backup Status"
                        value={metrics?.lastBackup ?? "--"}
                        icon="backup"
                    />
                    <MetricCard
                        title="Disk Utilisation"
                        value={metrics?.diskUsagePct ? `${metrics.diskUsagePct}%` : "--"}
                        icon="save"
                    />
                    <MetricCard
                        title="I/O Throughput"
                        value={metrics?.ioThroughputIOPS ?? "--"}
                        unit=" IOPS"
                        icon="speed"
                    />
                </div>

                {/* ---------- GRAPHS ---------- */}
                <div className="grid gap-8 xl:grid-cols-2">
                    <ReplicationChart data={generateFakeChartData()} />
                    <BackupTimeline backups={backups} />
                </div>

                {/* ---------- CLUSTERS ---------- */}
                <section className="mt-10">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        Clusters & Replicas
                    </h2>
                    <div className="grid gap-6 xl:grid-cols-3">
                        {clusters.map((c) => (
                            <ClusterCard key={c.id} cluster={c} />
                        ))}
                    </div>
                </section>

                {/* ---------- TERMINAL ---------- */}
                <Terminal />
            </main>

            {/* --------- FAB (float button) --------- */}
            <footer className="fixed bottom-6 right-6 flex flex-col gap-3 z-20">
                <button className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl hover:scale-105 active:scale-95 transition-all relative">
                    <span className="material-symbols-outlined text-3xl">bolt</span>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-background-dark"></span>
                    </span>
                </button>
            </footer>
        </div>
    );
}
