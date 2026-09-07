import React, { useState } from 'react';
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Calculator, 
  ArrowRight, 
  CreditCard,
  Building2,
  Users,
  Wrench,
  Leaf
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PricingPlansProps {
  lang?: 'fr' | 'en';
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ lang = 'fr' }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  
  // Interactive ROI Calculator State
  const [surfaceAreaSqM, setSurfaceAreaSqM] = useState<number>(25000);
  const [techniciansCount, setTechniciansCount] = useState<number>(8);
  const [annualEnergyBillUsd, setAnnualEnergyBillUsd] = useState<number>(180000);

  // ROI Computations
  const estimatedEnergySavings = Math.round(annualEnergyBillUsd * 0.185); // 18.5% average savings
  const estimatedTechnicianProductivity = Math.round(techniciansCount * 45000 * 0.22); // 22% time saved
  const estimatedDowntimeAvoidance = Math.round(surfaceAreaSqM * 1.8);
  const totalAnnualRoi = estimatedEnergySavings + estimatedTechnicianProductivity + estimatedDowntimeAvoidance;

  const plans = [
    {
      id: 'free-bee',
      name: 'FREE.bee',
      badge: 'Découverte & Solo',
      priceMonthly: 24,
      priceYearly: 19,
      description: lang === 'fr' ? 'Digital Newspapers - downloadable - non subscription - with permanent rights & découverte' : 'Digital Newspapers - downloadable - with permanent rights & discovery',
      features: [
        'Rapports & journaux téléchargeables',
        'Droits permanents sans expiration',
        'InboxAI Standard (1 compte)',
        'MeetAI Transcription (5h/mois)',
        'Support communautaire'
      ],
      cta: lang === 'fr' ? 'Démarrer avec FREE.bee' : 'Start with FREE.bee',
      highlighted: false
    },
    {
      id: 'starter-bee',
      name: 'Starter.bee',
      badge: 'PME & Indépendants',
      priceMonthly: 65,
      priceYearly: 52,
      description: lang === 'fr' ? 'Digital Newspapers - downloadable - non subscription - with permanent rights & GMAO/SaaS' : 'Digital Newspapers - downloadable - with permanent rights & smart operations',
      features: [
        'Toutes les options FREE.bee incluses',
        'InboxAI Avancé (jusqu\'à 3 comptes)',
        'MeetAI Transcriptions étendues (25h/mois)',
        'Intégrations Slack & Google Workspace',
        'Support email prioritaire sous 24h'
      ],
      cta: lang === 'fr' ? 'Choisir Starter.bee' : 'Choose Starter.bee',
      highlighted: false
    },
    {
      id: 'pro-bee',
      name: 'pro.bee',
      badge: 'Le Plus Populaire',
      priceMonthly: 125,
      priceYearly: 99,
      description: lang === 'fr' ? 'Digital Newspapers - downloadable - non subscription - with permanent rights & OS complet' : 'Digital Newspapers - downloadable - with permanent rights & full OS suite',
      features: [
        'Suite opérationnelle complète (Ventes, RH, Finance, Ops)',
        'InboxAI & MeetAI illimités (99.8% diarisation)',
        'CallCopilot en direct & bouclier de calendrier',
        'Toutes les passerelles et intégrations Cloud',
        'Support prioritaire 24/7'
      ],
      cta: lang === 'fr' ? 'Souscrire à pro.bee' : 'Subscribe to pro.bee',
      highlighted: true
    },
    {
      id: 'business-bee',
      name: 'business.bee',
      badge: 'Grands Comptes',
      priceMonthly: 700,
      priceYearly: 560,
      description: lang === 'fr' ? 'Digital Newspapers - downloadable - non subscription - with permanent rights & gouvernance globale' : 'Digital Newspapers - downloadable - with permanent rights & enterprise governance',
      features: [
        'Toutes les fonctionnalités pro.bee incluses',
        'Modèles LLM fine-tunés sur vos données souveraines',
        'Licences institutionnelles & droits de diffusion',
        'SLA Garanti 99.98% avec CSM dédié',
        'Intégrations ERP (SAP, Salesforce, Dynamics)'
      ],
      cta: lang === 'fr' ? 'Déployer business.bee' : 'Deploy business.bee',
      highlighted: false
    }
  ];

  const handleSelectPlan = (planName: string) => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  return (
    <div id="pricing-plans-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40">
            <CreditCard className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              {lang === 'fr' ? 'Offres SaaS & Simulateur de Rentabilité (ROI)' : 'Pricing Plans & Interactive ROI Calculator'}
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Stripe Billing Active
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {lang === 'fr'
                ? 'Monétisation multi-tenant transparente, facturation flexible et calcul des économies opérationnelles'
                : 'Transparent multi-tenant plans, flexible invoicing and operational ROI model'}
            </p>
          </div>
        </div>

        {/* Billing Cycle Switch */}
        <div className="flex items-center p-1 bg-black border border-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              billingCycle === 'monthly' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'fr' ? 'Mensuel' : 'Monthly'}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{lang === 'fr' ? 'Annuel' : 'Yearly'}</span>
            <span className="bg-emerald-400/20 text-emerald-300 text-[10px] px-1 rounded font-mono">-20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const price = billingCycle === 'yearly' ? p.priceYearly : p.priceMonthly;
          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                p.highlighted
                  ? 'bg-slate-900 border-emerald-500/60 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {p.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-lg font-mono">
                  {p.badge}
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-black text-white">{p.name}</h3>
                  {!p.highlighted && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-4">{p.description}</p>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">{price} €</span>
                  <span className="text-xs text-slate-400 font-mono">/ {lang === 'fr' ? 'mois' : 'month'}</span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 mb-6">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(p.name)}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                  p.highlighted
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {p.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Interactive ROI Calculator Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <Calculator className="w-6 h-6 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              {lang === 'fr' ? 'Simulateur de Retour sur Investissement (ROI)' : 'Interactive Operational ROI Simulator'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'fr' 
                ? 'Estimez les gains financiers générés par la maintenance prédictive et l\'optimisation énergétique BeeCarbonIT'
                : 'Estimate financial savings generated by predictive maintenance and smart energy management'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Surface Area Slider */}
          <div className="bg-black/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">{lang === 'fr' ? 'Surface Totale du Bâtiment :' : 'Facility Area:'}</span>
              <span className="text-emerald-400 font-bold">{surfaceAreaSqM.toLocaleString()} m²</span>
            </div>
            <input
              type="range"
              min="2000"
              max="100000"
              step="1000"
              value={surfaceAreaSqM}
              onChange={(e) => setSurfaceAreaSqM(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Technicians Slider */}
          <div className="bg-black/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">{lang === 'fr' ? 'Nombre de Techniciens :' : 'Technician Team:'}</span>
              <span className="text-emerald-400 font-bold">{techniciansCount} pers.</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={techniciansCount}
              onChange={(e) => setTechniciansCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Annual Energy Bill Slider */}
          <div className="bg-black/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">{lang === 'fr' ? 'Facture Énergétique Annuelle :' : 'Annual Energy Spend:'}</span>
              <span className="text-emerald-400 font-bold">${annualEnergyBillUsd.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="20000"
              max="1000000"
              step="10000"
              value={annualEnergyBillUsd}
              onChange={(e) => setAnnualEnergyBillUsd(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* Calculated ROI Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-black border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Économies Énergie (-18.5%)</span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              +${estimatedEnergySavings.toLocaleString()} / an
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Productivité GMAO (+22%)</span>
            <div className="text-xl font-black text-cyan-400 font-mono mt-1">
              +${estimatedTechnicianProductivity.toLocaleString()} / an
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Arrêts Équipements Évités</span>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              +${estimatedDowntimeAvoidance.toLocaleString()} / an
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-tr from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 text-center">
            <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase">Gain Annuel Total Estimé</span>
            <div className="text-2xl font-black text-white font-mono mt-1">
              ${totalAnnualRoi.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
