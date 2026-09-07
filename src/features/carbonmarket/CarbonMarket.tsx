import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  ShoppingBag, 
  ShieldCheck, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

interface CarbonMarketProps {
  lang?: 'fr' | 'en';
}

const mockPriceHistory = [
  { time: '09:00', price: 42.10 },
  { time: '10:00', price: 43.40 },
  { time: '11:00', price: 42.90 },
  { time: '12:00', price: 44.50 },
  { time: '13:00', price: 45.20 },
  { time: '14:00', price: 44.80 },
  { time: '15:00', price: 46.15 },
];

export const CarbonMarket: React.FC<CarbonMarketProps> = ({ lang = 'fr' }) => {
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(5);
  const [creditsOwned, setCreditsOwned] = useState<number>(142.5);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const spotPrice = 46.15;
  const totalCost = (quantity * spotPrice).toFixed(2);
  const valueUsd = creditsOwned * spotPrice;

  useEffect(() => {
    api.getEsgMetrics().then(data => {
      if (data && data.carbonCreditsOwned !== undefined) {
        setCreditsOwned(data.carbonCreditsOwned);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const certificates = [
    {
      id: 'cert-1',
      title: 'Reforestation Forêt Amazonienne & Corridor Biologique',
      standard: 'Verra VCS (Verified Carbon Standard)',
      vintage: '2024',
      reductionTonnes: 120,
      registryId: 'VCS-8921-2024',
      status: 'Active / Audited'
    },
    {
      id: 'cert-2',
      title: 'Parc Éolien Offshore Mer du Nord - Phase II',
      standard: 'Gold Standard GS4GG',
      vintage: '2025',
      reductionTonnes: 22.5,
      registryId: 'GS-4412-2025',
      status: 'Active / Audited'
    }
  ];

  const handleExecuteTrade = async () => {
    let newCredits = creditsOwned;
    if (tradeMode === 'BUY') {
      newCredits = creditsOwned + quantity;
      setCreditsOwned(newCredits);
      setSuccessToast(
        lang === 'fr' 
          ? `Achat de ${quantity} crédits certifiés (tCO2e) validé sur le registre !` 
          : `Bought ${quantity} certified carbon credits (tCO2e)!`
      );
    } else {
      if (creditsOwned >= quantity) {
        newCredits = creditsOwned - quantity;
        setCreditsOwned(newCredits);
        setSuccessToast(
          lang === 'fr' 
            ? `Vente de ${quantity} crédits carbone exécutée au cours spot !` 
            : `Sold ${quantity} carbon credits at spot price!`
        );
      } else {
        return;
      }
    }

    try {
      await api.updateEsgMetrics({
        carbonCreditsOwned: newCredits
      });
    } catch (err) {
      console.error('Error updating credits in database:', err);
    }

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  return (
    <div id="carbon-market-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white flex items-center gap-2">
              {lang === 'fr' ? 'Marché des Crédits Carbone & ESG Offset' : 'Verified Carbon Market & Offsets'}
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Spot Trading
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {lang === 'fr'
                ? 'Acquisition et mise à la retraite de crédits certifiés Verra VCS & Gold Standard pour la neutralité Scope 1-2-3'
                : 'Trading & retiring certified carbon offset credits on Verra & Gold Standard registries'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-3 font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase">{lang === 'fr' ? 'Portefeuille Actif' : 'Portfolio'}</div>
              <div className="text-emerald-400 font-bold">{creditsOwned} tCO2e</div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase">{lang === 'fr' ? 'Valeur Estimée' : 'Value'}</div>
              <div className="text-black dark:text-white font-bold">${valueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Grid: Chart + Trade Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Price Chart & Market Depth */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-black text-black dark:text-white font-mono">${spotPrice}</span>
                  <span className="text-emerald-400 text-xs font-bold font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +4.2% (24h)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Index Spot Global tCO2e (VCS & GS)</p>
              </div>

              <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span className="text-emerald-400 font-bold">Vol 24h :</span> 14,890 tCO2e
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPriceHistory}>
                  <defs>
                    <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fill="url(#carbonGradient)" name="Prix Spot ($/tCO2e)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Certificates Register */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              {lang === 'fr' ? 'Certificats Détenus & Registres' : 'Certified Offset Portfolio'}
            </h3>

            <div className="space-y-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-3.5 bg-white dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{cert.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                      <span className="text-emerald-400 font-semibold">{cert.standard}</span>
                      <span>•</span>
                      <span>Vintage {cert.vintage}</span>
                      <span>•</span>
                      <span className="text-slate-500 dark:text-slate-500">{cert.registryId}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-black dark:text-white font-mono">{cert.reductionTonnes} tCO2e</span>
                    <div className="text-[10px] text-emerald-400 font-mono">Audité & Vérifié</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Placement Ticket */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {lang === 'fr' ? 'Passation d\'Ordre Instantanée' : 'Instant Trade Execution'}
            </h3>

            {/* Buy / Sell switch */}
            <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setTradeMode('BUY')}
                className={`py-2 rounded-lg transition-all ${
                  tradeMode === 'BUY' ? 'bg-emerald-600 text-black dark:text-white shadow-md shadow-emerald-950/40' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:text-white'
                }`}
              >
                {lang === 'fr' ? 'ACHETER (Offset)' : 'BUY (Offset)'}
              </button>
              <button
                onClick={() => setTradeMode('SELL')}
                className={`py-2 rounded-lg transition-all ${
                  tradeMode === 'SELL' ? 'bg-rose-600 text-black dark:text-white shadow-md shadow-rose-950/40' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:text-white'
                }`}
              >
                {lang === 'fr' ? 'VENDRE' : 'SELL'}
              </button>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
                {lang === 'fr' ? 'Volume de Crédits (tCO2e)' : 'Credit Quantity (tCO2e)'}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Summary details */}
            <div className="p-3.5 bg-white dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Prix Unitaire Spot :</span>
                <span className="text-slate-200 font-bold">${spotPrice}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Frais de Registre (Verra) :</span>
                <span className="text-slate-200">$0.00 (Inclus)</span>
              </div>
              <div className="w-full h-px bg-slate-800 my-1" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-200 font-bold">Total :</span>
                <span className="text-emerald-400 font-black">${totalCost}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleExecuteTrade}
            className={`w-full mt-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg ${
              tradeMode === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white shadow-emerald-950/50'
                : 'bg-rose-600 hover:bg-rose-500 text-black dark:text-white shadow-rose-950/50'
            }`}
          >
            {tradeMode === 'BUY'
              ? (lang === 'fr' ? `Acheter ${quantity} tCO2e (${totalCost} $)` : `Confirm Purchase ($${totalCost})`)
              : (lang === 'fr' ? `Vendre ${quantity} tCO2e` : `Execute Sell Order`)}
          </button>
        </div>
      </div>
    </div>
  );
};
