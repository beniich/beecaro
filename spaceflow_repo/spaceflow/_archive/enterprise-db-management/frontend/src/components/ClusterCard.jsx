// ClusterCard.jsx
import React from "react";

export default function ClusterCard({ cluster }) {
    const statusBadge = {
        healthy: { bg: "bg-green-500/10", txt: "text-green-500", label: "Healthy" },
        sync: { bg: "bg-green-500/10", txt: "text-green-500", label: "Sync" },
        lagging: { bg: "bg-amber-500/10", txt: "text-amber-500", label: `Lag ${cluster.lag}s` },
        failed: { bg: "bg-red-500/10", txt: "text-red-500", label: "Failed" },
    };

    const badge = statusBadge[cluster.status] || statusBadge["healthy"];

    return (
        <div className="p-4 bg-white dark:bg-panel-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900 dark:text-white">
                    {cluster.name}
                </span>
                <span className={`px-2 py-0.5 ${badge.bg} ${badge.txt} text-xs font-black uppercase rounded`}>
                    {badge.label}
                </span>
            </div>

            {cluster.role === "master" && (
                <p className="text-xs text-slate-500 mb-3">
                    Version {cluster.version} • Uptime {cluster.uptime}
                </p>
            )}
            {cluster.role === "replica" && (
                <p className="text-xs text-slate-500 mb-3">
                    Version {cluster.version} • Lag {cluster.lag}s
                </p>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <p className="font-medium text-slate-700">CPU</p>
                    <p className="text-slate-600">{cluster.cpu}%</p>
                </div>
                <div>
                    <p className="font-medium text-slate-700">RAM</p>
                    <p className="text-slate-600">{cluster.ram?.used ?? "–"} GB / {cluster.ram?.total ?? "–"} GB</p>
                </div>
                <div>
                    <p className="font-medium text-slate-700">IOPS</p>
                    <p className="text-slate-600">{cluster.iops}</p>
                </div>
                <div>
                    <p className="font-medium text-slate-700">Connections</p>
                    <p className="text-slate-600">{cluster.connections}</p>
                </div>
            </div>
        </div>
    );
}
