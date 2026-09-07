import React, { useState } from 'react';
import { NavigationPage } from '../../types/bizos';
import { 
  Leaf, 
  ShieldCheck, 
  Cpu, 
  Building2, 
  Zap, 
  ArrowUpRight, 
  Sparkles, 
  Globe2, 
  Mail, 
  CheckCircle2, 
  Activity, 
  Sliders, 
  FileText, 
  Layers,
  ChevronRight,
  TrendingDown,
  Terminal
} from 'lucide-react';
import { BeeLogo } from '../BeeLogo';

interface BeeCarbonItFooterProps {
  onNavigate: (page: NavigationPage | string) => void;
  onOpenTrial?: () => void;
  lang?: 'fr' | 'en';
}

export const BeeCarbonItFooter: React.FC<BeeCarbonItFooterProps> = ({ 
  onNavigate, 
  onOpenTrial, 
  lang = 'fr' 
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
      }, 3000);
    }
  };

  return (
    <footer id="beecarbonit-footer" className="w-full bg-[#0a0715] text-black dark:text-white border-t border-orange-500/25 relative z-20 overflow-hidden font-sans">
      
      {/* Ambient Radial Glows in Theme Palette */}
      <div className="absolute -top-32 left-1/4 w-[500px] h-[300px] bg-[#ff9a00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-[#34d399]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Banner: Real-time Platform Status & Carbon Metrics */}
      <div className="border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34d399]"></span>
              </span>
              <span className="font-mono text-gray-300">
                {lang === 'fr' ? 'Réseau Smart Grid & Télémétrie :' : 'Smart Grid Telemetry :'}
              </span>
              <span className="font-mono font-semibold text-[#34d399]">
                99.99% Operational
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-gray-400">
              <Leaf className="w-3.5 h-3.5 text-orange-500" />
              <span>
                {lang === 'fr' ? 'Émissions Évitées ce Mois :' : 'Carbon Avoided This Month :'}
              </span>
              <span className="font-mono font-semibold text-orange-500">-148.4 tCO2e</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-1.5 bg-[#1f1733] border border-white/10 px-2.5 py-1 rounded-full text-[11px]">
              <ShieldCheck className="w-3 h-3 text-orange-500" />
              <span>CSRD &amp; Décret Tertiaire Ready</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-[#1f1733] border border-white/10 px-2.5 py-1 rounded-full text-[11px]">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>Gemini 3.7 Core Enabled</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links & Value Proposition */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          
          {/* Col 1: Brand & Executive Statement (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-5">
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center cursor-pointer group w-fit"
            >
              <BeeLogo size="md" showText={true} />
            </div>

            <p className="text-sm text-gray-300 leading-relaxed max-w-md font-sans">
              {lang === 'fr' 
                ? "Plateforme d'intelligence environnementale unifiée et système d'exploitation pour bâtiments intelligents, gestionnaires d'actifs et smart cities durables."
                : "Unified environmental intelligence platform and operating system powering smart buildings, asset managers, and sustainable smart cities."}
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-2 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {lang === 'fr' ? 'Veille Durabilité & Mises à Jour IA' : 'Sustainability & AI Dispatch'}
              </div>

              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {lang === 'fr' ? 'Merci ! Vous recevrez nos analyses exclusives.' : 'Subscribed! You will receive our premium reports.'}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center max-w-md gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="email" 
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder={lang === 'fr' ? 'votre.email@entreprise.com' : 'your.email@company.com'}
                      className="w-full bg-[#171128] border border-orange-500/30 rounded-xl px-3.5 py-2 text-xs text-black dark:text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-2 py-2 pr-3 rounded-full bg-orange-500 text-white dark:text-black font-bold text-[13px] shadow-[0_4px_14px_rgba(255,154,0,0.3)] hover:brightness-110 transition-all flex items-center gap-2 shrink-0 group"
                  >
                    <div className="w-7 h-7 rounded-[8px] bg-white dark:bg-slate-950/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                    </div>
                    <span className="px-1">{lang === 'fr' ? 'Rejoindre' : 'Subscribe'}</span>
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-950 text-orange-500 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                    </div>
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Col 2: Solutions & Modules */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-500 font-mono">
              {lang === 'fr' ? 'Solutions BEE OS' : 'BEE OS Solutions'}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <button 
                  onClick={() => onNavigate('workspace')} 
                  className="hover:text-orange-500 transition-colors flex items-center gap-1.5 group text-left"
                >
                  <Building2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500" />
                  <span>CAFM Cockpit Pro</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('waste')} 
                  className="hover:text-orange-500 transition-colors flex items-center gap-1.5 group text-left"
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-400 group-hover:text-orange-500" />
                  <span>{lang === 'fr' ? 'Bilan Carbone & ESG (1,2,3)' : 'Carbon Footprint & ESG'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('god-mode')} 
                  className="hover:text-orange-500 transition-colors flex items-center gap-1.5 group text-left"
                >
                  <Zap className="w-3.5 h-3.5 text-orange-500" />
                  <span>God-Mode Isometric 3D</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('predictive-ai')} 
                  className="hover:text-orange-500 transition-colors flex items-center gap-1.5 group text-left"
                >
                  <Cpu className="w-3.5 h-3.5 text-sky-400 group-hover:text-orange-500" />
                  <span>{lang === 'fr' ? 'IA CVC & Prédictif Énergie' : 'Predictive HVAC & Energy'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('work-orders')} 
                  className="hover:text-orange-500 transition-colors flex items-center gap-1.5 group text-left"
                >
                  <Sliders className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500" />
                  <span>CMMS GMAO & Maintenance</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('solutions-vitalai')} 
                  className="hover:text-orange-500 transition-colors flex items-center gap-1.5 group text-left"
                >
                  <Activity className="w-3.5 h-3.5 text-pink-400 group-hover:text-orange-500" />
                  <span>Vital AI &amp; Bio-Télémétrie</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Plateforme & Écosystème */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-500 font-mono">
              {lang === 'fr' ? 'Plateforme' : 'Platform'}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <button 
                  onClick={() => onNavigate('features')} 
                  className="hover:text-orange-500 transition-colors"
                >
                  {lang === 'fr' ? 'Architecture Smart Building' : 'Smart Building Architecture'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('integrations')} 
                  className="hover:text-orange-500 transition-colors"
                >
                  {lang === 'fr' ? 'Connecteurs IoT & GTB (BACnet, MQTT)' : 'IoT & BMS Integrations'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('pricing')} 
                  className="hover:text-orange-500 transition-colors"
                >
                  {lang === 'fr' ? 'Simulateur d\'Économies & Tarifs' : 'Pricing & ROI Simulator'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('beecarbonat-pub')} 
                  className="hover:text-orange-500 text-orange-500 font-medium transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff9a00] animate-pulse"></span>
                  <span>{lang === 'fr' ? 'Studio Pub & Panier' : 'Ad Studio & Cart'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('customers')} 
                  className="hover:text-orange-500 transition-colors"
                >
                  {lang === 'fr' ? 'Références & Témoignages' : 'Client Success Stories'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Conformité, Normes & Certifications */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-500 font-mono">
              {lang === 'fr' ? 'Normes & ESG' : 'Standards & ESG'}
            </h4>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-[#171128] border border-white/5 space-y-1">
                <div className="font-semibold text-black dark:text-white flex items-center justify-between">
                  <span>Décret Tertiaire</span>
                  <span className="text-[10px] text-emerald-400 font-mono">2030 / 2040</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Export automatisé OPERAT et suivi des seuils énergétiques.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#171128] border border-white/5 space-y-1">
                <div className="font-semibold text-black dark:text-white flex items-center justify-between">
                  <span>CSRD &amp; GHG Protocol</span>
                  <span className="text-[10px] text-orange-500 font-mono">Scope 1-2-3</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Comptabilité auditable et traçabilité inviolable.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#171128] border border-white/5 space-y-1">
                <div className="font-semibold text-black dark:text-white flex items-center justify-between">
                  <span>Sécurité des Données</span>
                  <span className="text-[10px] text-sky-400 font-mono">ISO 27001</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Hébergement européen souverain &amp; chiffrement bout-en-bout.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} BeeCarbonIt Inc. Tous droits réservés.</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-orange-500 hidden sm:inline font-mono">Powered by .bee OS Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-300">
            <button 
              onClick={() => onNavigate('privacy')}
              className="hover:text-orange-500 transition-colors"
            >
              {lang === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'}
            </button>
            <button 
              onClick={() => onNavigate('terms')}
              className="hover:text-orange-500 transition-colors"
            >
              {lang === 'fr' ? 'Conditions d\'Utilisation' : 'Terms of Service'}
            </button>
            <button 
              onClick={() => onNavigate('security')}
              className="hover:text-orange-500 transition-colors"
            >
              {lang === 'fr' ? 'Sécurité & RGPD' : 'Security & GDPR'}
            </button>
            <button 
              onClick={() => onNavigate('god-mode')}
              className="hover:text-orange-500 transition-colors font-mono text-orange-500"
            >
              Status: All Systems Normal
            </button>
          </div>
        </div>

      </div>

    </footer>
  );
};
