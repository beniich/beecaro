import React from 'react';
import { motion } from 'framer-motion';
import { useTelemetry } from '../../../telemetry/hooks';
import {
  CheckCircle, AlertTriangle, XCircle, Shield, Globe, Lock,
} from 'lucide-react';

interface ComplianceCheck {
  id: string;
  category: string;
  description: string;
  status: 'compliant' | 'warning' | 'violation';
  scope: string;
}

const CHECKS: ComplianceCheck[] = [
  // RGPD
  {
    id: 'rgpd-1',
    category: 'RGPD',
    description: 'Data residency EU (chiffrement at rest en Europe)',
    status: 'compliant',
    scope: 'eu-central, eu-west',
  },
  {
    id: 'rgpd-2',
    category: 'RGPD',
    description: 'Right to be forgotten (suppression compte<30j)',
    status: 'compliant',
    scope: 'global',
  },
  {
    id: 'rgpd-3',
    category: 'RGPD',
    description: 'Consentement explicite cookies analytics',
    status: 'warning',
    scope: 'global',
  },
  
  // SOC 2
  {
    id: 'soc2-1',
    category: 'SOC 2',
    description: 'Audit trail complet de toutes les actions admin',
    status: 'compliant',
    scope: 'global',
  },
  {
    id: 'soc2-2',
    category: 'SOC 2',
    description: 'Chiffrement TLS 1.3 sur toutes les communications',
    status: 'compliant',
    scope: 'global',
  },
  {
    id: 'soc2-3',
    category: 'SOC 2',
    description: 'Rotation automatique des clés API (90j)',
    status: 'violation',
    scope: 'global',
  },
  
  // ISO 27001
  {
    id: 'iso-1',
    category: 'ISO 27001',
    description: 'Gestion des accès (RBAC avec 4 rôles minimum)',
    status: 'compliant',
    scope: 'global',
  },
  {
    id: 'iso-2',
    category: 'ISO 27001',
    description: 'MFA activé pour tous les comptes admin',
    status: 'warning',
    scope: 'global',
  },
  
  // Souveraineté
  {
    id: 'sov-1',
    category: 'Souveraineté',
    description: 'Données clients EU stockées uniquement en EU',
    status: 'compliant',
    scope: 'eu-central',
  },
  {
    id: 'sov-2',
    category: 'Souveraineté',
    description: 'Pas de transfert transfrontalier sans consentement',
    status: 'compliant',
    scope: 'global',
  },
];

export const ComplianceTab: React.FC = () => {
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  
  // Data residency par provider
  const residency = [
    { provider: 'AWS', regions: ['us-east', 'us-west', 'eu-central'], color: '#ff9900' },
    { provider: 'GCP', regions: ['us-east', 'eu-west', 'asia-pacific'], color: '#4285f4' },
    { provider: 'Azure', regions: ['eu-west', 'asia-pacific'], color: '#0078d4' },
    { provider: 'Self-Hosted', regions: ['eu-central', 'us-east'], color: '#10b981' },
    { provider: 'Edge Network', regions: ['us-east', 'us-west', 'eu-west', 'eu-central', 'asia-pacific', 'south-america'], color: '#06b6d4' },
  ];
  
  const compliantCount = CHECKS.filter(c => c.status === 'compliant').length;
  const warningCount = CHECKS.filter(c => c.status === 'warning').length;
  const violationCount = CHECKS.filter(c => c.status === 'violation').length;
  const complianceScore = Math.round((compliantCount / CHECKS.length) * 100);
  
  return (
    <div className="space-y-4">
      
      {/* SCORE GLOBAL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 flex flex-col items-center justify-center p-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none"
                  stroke={complianceScore > 90 ? '#10b981' : complianceScore > 70 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${(complianceScore / 100) * 283} 283`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{complianceScore}%</div>
                  <div className="text-[10px] text-slate-500 uppercase">Score</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-3 gap-3">
            <ComplianceStat label="Compliant" value={compliantCount} icon={<CheckCircle />} color="emerald" />
            <ComplianceStat label="Warnings" value={warningCount} icon={<AlertTriangle />} color="amber" />
            <ComplianceStat label="Violations" value={violationCount} icon={<XCircle />} color="red" />
          </div>
        </div>
      </div>
      
      {/* CHECKS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">Compliance Checks</h3>
        <div className="space-y-2">
          {CHECKS.map(check => (
            <ComplianceCheckRow key={check.id} check={check} />
          ))}
        </div>
      </div>
      
      {/* DATA RESIDENCY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-mono text-slate-400 uppercase mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          Data Residency by Provider
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {residency.map(r => (
            <motion.div key={r.provider}
              whileHover={{ scale: 1.01 }}
              className="p-3 bg-slate-800/40 rounded-xl border border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">{r.provider}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {r.regions.length} region(s)
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.regions.map(reg => (
                  <span key={reg}
                    className="text-[10px] px-2 py-0.5 rounded font-mono"
                    style={{ backgroundColor: `${r.color}20`, color: r.color }}
                  >
                    {reg}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComplianceStat: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'emerald' | 'amber' | 'red';
}> = ({ label, value, icon, color }) => {
  const colors = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    red: 'bg-red-500/10 border-red-500/40 text-red-400',
  };
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    </motion.div>
  );
};

const ComplianceCheckRow: React.FC<{ check: ComplianceCheck }> = ({ check }) => {
  const colors = {
    compliant: 'border-emerald-500/40 bg-emerald-500/5',
    warning: 'border-amber-500/40 bg-amber-500/5',
    violation: 'border-red-500/40 bg-red-500/5',
  };
  const icons = {
    compliant: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    violation: <XCircle className="w-4 h-4 text-red-400" />,
  };
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className={`p-3 rounded-xl border ${colors[check.status]} flex items-start gap-3`}
    >
      <div className="shrink-0 mt-0.5">{icons[check.status]}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
            {check.category}
          </span>
          <span className="text-[10px] text-slate-500">Scope: {check.scope}</span>
        </div>
        <p className="text-xs text-slate-300">{check.description}</p>
      </div>
    </motion.div>
  );
};
