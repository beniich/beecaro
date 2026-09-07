// ReplicationChart.jsx
import React from "react";

/**
 * Simple chart using SVG. Les points sont générés aléatoirement côté client
 * (pour le prototype). Dans une vraie appli, vous passeriez les séries via props.
 */
export default function ReplicationChart({ data = [] }) {
    // data = array d'objets {x:0‑800, y:0‑200}
    const path = data
        .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`)
        .join(" ");

    return (
        <div className="p-6 bg-white dark:bg-panel-dark border border-primary/30 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Replication Lag (ms) – 24 h
                </h3>
                <select className="bg-slate-800 text-xs text-slate-300 rounded px-2 py-1">
                    <option>1h</option>
                    <option selected>24h</option>
                    <option>7d</option>
                </select>
            </div>

            <svg className="w-full h-48" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Grille */}
                <line className="chart-grid" x1="0" y1="50" x2="800" y2="50" />
                <line className="chart-grid" x1="0" y1="100" x2="800" y2="100" />
                <line className="chart-grid" x1="0" y1="150" x2="800" y2="150" />

                {/* Courbe */}
                <path d={path} stroke="#2424eb" strokeWidth="3" fill="none" strokeLinecap="round" />

                {/* Ligne de base */}
                <line x1="0" y1="190" x2="800" y2="190" stroke="#fff" strokeDasharray="4" strokeOpacity="0.2" />
            </svg>
        </div>
    );
}
