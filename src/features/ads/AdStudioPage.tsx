import React, { useState } from 'react';
import { initialAdPacks, AdCampaignPack, AdCartItem } from '../../data/adsData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';

interface AdStudioPageProps {
  onAddToCart: (pack: AdCampaignPack, options?: Partial<AdCartItem>) => void;
  onOpenCart: () => void;
  cartItems: AdCartItem[];
  lang?: 'fr' | 'en';
}

export const AdStudioPage: React.FC<AdStudioPageProps> = ({
  onAddToCart,
  onOpenCart,
  cartItems,
  lang = 'fr'
}) => {
  const [selectedBrand, setSelectedBrand] = useState<'All' | 'BeeCarbonat' | 'REZIDET'>('All');
  const [activeTab, setActiveTab] = useState<'gallery' | 'beecarbonat-preview' | 'customizer' | 'simulator'>('gallery');
  
  // Customizer State
  const [customBrand, setCustomBrand] = useState<'BeeCarbonat' | 'REZIDET'>('BeeCarbonat');
  const [customTitle, setCustomTitle] = useState("L'intelligence au service du climat");
  const [customSubtitle, setCustomSubtitle] = useState("Maximize Sustainability ROI with BeeCarbonat's AI-driven platform.");
  const [customBadge, setCustomBadge] = useState("Greener Future: 100% Tracked");
  const [customCta, setCustomCta] = useState("Découvrir nos solutions");
  const [customFormat, setCustomFormat] = useState<'1080x1080' | '1200x628' | '1080x1920' | '728x90'>('1080x1080');
  const [customTheme, setCustomTheme] = useState<'orange' | 'green' | 'cyan' | 'purple'>('orange');
  const [copiedCode, setCopiedCode] = useState(false);

  // Simulator State
  const [simBudget, setSimBudget] = useState(500);
  const [simDuration, setSimDuration] = useState(14);
  const [simChannel, setSimChannel] = useState<'Meta' | 'LinkedIn' | 'Google' | 'Omnichannel'>('Omnichannel');

  // Filtered packs
  const filteredPacks = selectedBrand === 'All'
    ? initialAdPacks
    : initialAdPacks.filter((p) => p.brand === selectedBrand);

  // Simulated metrics projection data
  const simulationChartData = [
    { day: 'J1', impressions: Math.round(simBudget * 35), clicks: Math.round(simBudget * 1.4), leads: Math.round(simBudget * 0.12) },
    { day: 'J3', impressions: Math.round(simBudget * 110), clicks: Math.round(simBudget * 4.6), leads: Math.round(simBudget * 0.42) },
    { day: 'J7', impressions: Math.round(simBudget * 280), clicks: Math.round(simBudget * 11.5), leads: Math.round(simBudget * 1.15) },
    { day: 'J10', impressions: Math.round(simBudget * 420), clicks: Math.round(simBudget * 18.2), leads: Math.round(simBudget * 1.95) },
    { day: `J${simDuration}`, impressions: Math.round(simBudget * 680), clicks: Math.round(simBudget * 29.8), leads: Math.round(simBudget * 3.4) },
  ];

  const handleQuickAdd = (pack: AdCampaignPack) => {
    onAddToCart(pack);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handleCopySnippet = () => {
    const htmlSnippet = `<!-- BeeCarbonIt Ad Banner Embed (${customFormat}) -->
<div style="background:#0f0a18; border:1px solid #ff8a00; border-radius:16px; padding:24px; color:white; font-family:sans-serif; text-align:center;">
  <h2 style="color:#ff8a00; font-size:24px; font-weight:bold; margin-bottom:8px;">${customTitle}</h2>
  <p style="color:#e2e8f0; font-size:14px; margin-bottom:16px;">${customSubtitle}</p>
  <div style="background:rgba(255,138,0,0.15); border:1px solid #ff8a00; padding:8px 16px; border-radius:9999px; display:inline-block; margin-bottom:16px; font-weight:bold; color:#ffb04f;">${customBadge}</div>
  <br/>
  <a href="#" style="background:linear-gradient(to right, #ff8a00, #ffaa00); color:#000; padding:10px 24px; border-radius:9999px; text-decoration:none; font-weight:bold; display:inline-block;">${customCta}</a>
</div>`;
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0f0a18] text-black dark:text-white pt-24 pb-20 relative overflow-hidden">
      {/* Background ambient lighting effects matching BeeCarbonIt glowing lines */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(255, 138, 0, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(255, 138, 0, 0.15) 0%, transparent 40%),
            linear-gradient(to right, rgba(255, 138, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 138, 0, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 60px 60px, 60px 60px'
        }}
      />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 relative z-10 space-y-12">
        
        {/* Top Header & Panier Quick Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#ff8a00]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff8a00]/15 border border-[#ff8a00]/40 text-[#ffb04f] font-mono text-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-[#ff8a00] animate-pulse"></span>
              <span>STUDIO PUBLICITAIRE • BEECARBONIT & REZIDET</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-black dark:text-white flex items-center gap-3">
              <span>{lang === 'fr' ? 'Panier & Studio Publicitaire' : 'Ad Studio & Campaign Cart'}</span>
              <span className="text-[#ff8a00] drop-shadow-[0_0_20px_rgba(255,138,0,0.6)]">IA</span>
            </h1>
            <p className="text-sm sm:text-base text-[#d1c6e0] max-w-2xl mt-2">
              {lang === 'fr'
                ? 'Intégrez et diffusez les bannières publicitaires interactives (1080x1080, Isométrique 3D, Réseaux Sociaux, Display) pour BeeCarbonIt et REZIDET avec gestion du panier de campagnes.'
                : 'Integrate and broadcast interactive ad banners (1080x1080, 3D Isometric, Social Media, Display) for BeeCarbonIt and REZIDET with full campaign shopping cart management.'}
            </p>
          </div>

          {/* Cart Status Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenCart}
              className="px-2 py-2 pr-4 rounded-full bg-orange-500 text-white dark:text-black font-bold text-[15px] hover:brightness-110 transition-all flex items-center gap-3 shadow-[0_4px_14px_rgba(255,154,0,0.3)]"
            >
              <div className="w-10 h-10 rounded-[12px] bg-white dark:bg-slate-950/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              </div>
              <span className="whitespace-nowrap px-1">{lang === 'fr' ? 'Ouvrir Mon Panier' : 'Open My Ad Cart'}</span>
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-950 text-orange-500 font-black text-sm flex items-center justify-center shrink-0">
                {cartItems.length}
              </div>
            </button>
          </div>
        </div>

        {/* View Mode Navigation Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#1a1228]/80 border border-[#ff8a00]/25 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'bg-[#ff8a00] text-gray-950 shadow-[0_0_15px_rgba(255,138,0,0.5)]'
                  : 'text-[#cdc3d0] hover:text-black dark:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>{lang === 'fr' ? 'Galerie des Bannières & Packs' : 'Banners & Packs Gallery'}</span>
            </button>

            <button
              onClick={() => setActiveTab('beecarbonat-preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'beecarbonat-preview'
                  ? 'bg-[#ff8a00] text-gray-950 shadow-[0_0_15px_rgba(255,138,0,0.5)]'
                  : 'text-[#cdc3d0] hover:text-black dark:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">devices</span>
              <span>{lang === 'fr' ? 'Page Complète BeeCarbonat' : 'Full BeeCarbonat Page'}</span>
            </button>

            <button
              onClick={() => setActiveTab('customizer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'customizer'
                  ? 'bg-[#ff8a00] text-gray-950 shadow-[0_0_15px_rgba(255,138,0,0.5)]'
                  : 'text-[#cdc3d0] hover:text-black dark:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">palette</span>
              <span>{lang === 'fr' ? 'Studio Personnalisation' : 'Ad Customizer Studio'}</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'simulator'
                  ? 'bg-[#ff8a00] text-gray-950 shadow-[0_0_15px_rgba(255,138,0,0.5)]'
                  : 'text-[#cdc3d0] hover:text-black dark:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>{lang === 'fr' ? 'Simulateur Budget & ROI' : 'Budget & ROI Simulator'}</span>
            </button>
          </div>

          {/* Brand Filter */}
          {activeTab === 'gallery' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#a69bb3] uppercase font-mono mr-1">{lang === 'fr' ? 'Marque :' : 'Brand:'}</span>
              {(['All', 'BeeCarbonat', 'REZIDET'] as const).map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-colors ${
                    selectedBrand === brand
                      ? 'bg-[#ff8a00]/25 text-[#ffb04f] border border-[#ff8a00]/60'
                      : 'bg-[#1a1228] text-[#8e81a3] border border-[#ff8a00]/15 hover:text-black dark:text-white'
                  }`}
                >
                  {brand === 'All' ? (lang === 'fr' ? 'Toutes' : 'All') : brand}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: BANNERS & PACKS GALLERY */}
        {activeTab === 'gallery' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Visual Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="rounded-3xl bg-[#150d24]/90 border border-[#ff8a00]/25 hover:border-[#ff8a00]/60 transition-all duration-300 overflow-hidden flex flex-col group shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_30px_rgba(255,138,0,0.15)]"
                >
                  {/* Visual Image / Banner Canvas */}
                  <div className="relative h-60 bg-gradient-to-b from-[#221538] to-[#120a1f] overflow-hidden p-4 flex items-center justify-center">
                    <img
                      src={pack.imageUrl}
                      alt={pack.title}
                      className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,138,0,0.3)] group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-[#ffb04f] border border-[#ff8a00]/40 font-mono">
                        {pack.brand}
                      </span>
                      {pack.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ff8a00] text-gray-950 text-[9px] font-extrabold uppercase tracking-wider">
                          {pack.badge}
                        </span>
                      )}
                    </div>

                    {/* Format Pill */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-white dark:bg-slate-950/80 backdrop-blur-md text-[10px] text-black dark:text-white font-mono border border-white/10">
                      {pack.format}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-black dark:text-white group-hover:text-[#ffb04f] transition-colors leading-snug">
                        {pack.title}
                      </h3>
                      <p className="text-xs text-[#c4b5d6] mt-1.5 line-clamp-2 leading-relaxed">
                        {pack.subtitle}
                      </p>
                      
                      {/* Metric Telemetry Pills */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#ff8a00]/15 text-[11px] font-mono">
                        <div className="p-2 rounded-xl bg-[#1c1230] border border-[#ff8a00]/15">
                          <span className="text-[#8e81a3] block text-[9px] uppercase">{lang === 'fr' ? 'Impressions est.' : 'Est. Impressions'}</span>
                          <strong className="text-black dark:text-white font-bold">~{pack.estimatedImpressions.toLocaleString()}</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-[#1c1230] border border-[#ff8a00]/15">
                          <span className="text-[#8e81a3] block text-[9px] uppercase">{lang === 'fr' ? 'CTR Moyen' : 'Avg. CTR'}</span>
                          <strong className="text-emerald-400 font-bold">+{pack.expectedCTR}%</strong>
                        </div>
                      </div>

                      {/* Platforms */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {pack.platforms.map((plat) => (
                          <span
                            key={plat}
                            className="px-2 py-0.5 rounded-md bg-[#22163b] text-[#a69bb3] text-[9px] font-mono border border-[#37245c]"
                          >
                            {plat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & Add to Cart Button */}
                    <div className="pt-4 border-t border-[#ff8a00]/20 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-[#8e81a3] block uppercase font-mono">{lang === 'fr' ? 'À partir de' : 'Starting from'}</span>
                        <span className="text-lg font-black text-black dark:text-white font-mono">{pack.priceBase} €</span>
                      </div>

                      <button
                        onClick={() => handleQuickAdd(pack)}
                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff8a00] to-[#ffaa00] text-gray-950 font-bold text-xs hover:shadow-[0_0_15px_rgba(255,138,0,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        <span>{lang === 'fr' ? 'Ajouter au panier' : 'Add to cart'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Ad Banner 1080x1080 Interactive Featured Box */}
            <div className="rounded-3xl bg-gradient-to-r from-[#170e2b] via-[#261545] to-[#170e2b] border border-[#ff8a00]/40 p-8 shadow-[0_0_40px_rgba(255,138,0,0.15)] relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                
                {/* Left Text */}
                <div className="lg:w-1/2 space-y-4 text-center lg:text-left">
                  <span className="px-3 py-1 rounded-full bg-[#ff8a00]/20 text-[#ffb04f] border border-[#ff8a00]/40 text-xs font-mono font-bold">
                    FORMAT SPÉCIAL • SOCIAL BANNER 1080x1080
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white leading-tight">
                    L'intelligence au service du climat & de l'immobilier
                  </h2>
                  <p className="text-sm text-[#cdc3d0] leading-relaxed">
                    Diffusez simultanément sur Instagram, LinkedIn, Google Display et les réseaux B2B. Nos modèles d'IA optimisent les enchères en continu pour maximiser le taux de conversion et les prises de rendez-vous démo.
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                    <button
                      onClick={() => handleQuickAdd(initialAdPacks[0])}
                      className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#ff8a00] to-[#ffb04f] text-gray-950 font-bold text-xs hover:shadow-[0_0_25px_rgba(255,138,0,0.7)] transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                      <span>{lang === 'fr' ? 'Ajouter le Pack Social 1080x1080 (490 €)' : 'Add Social 1080x1080 Pack (490 €)'}</span>
                    </button>
                    <button
                      onClick={onOpenCart}
                      className="py-3 px-5 rounded-xl bg-[#23173d] border border-[#ff8a00]/30 hover:bg-[#342459] text-black dark:text-white text-xs font-semibold transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                      <span>{lang === 'fr' ? 'Voir Mon Panier' : 'View Ad Cart'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Interactive Mockup Banner (1080x1080 Preview) */}
                <div className="lg:w-1/2 flex justify-center w-full">
                  <div className="w-full max-w-sm aspect-square rounded-3xl bg-[#0f0a18] border-2 border-[#ff8a00]/60 p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_0_50px_rgba(255,138,0,0.3)]">
                    {/* Glowing Matrix Background */}
                    <div 
                      className="absolute inset-0 opacity-40 pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 138, 0, 0.25) 0%, transparent 70%)`
                      }}
                    />

                    {/* Banner Top */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcyVNGRLiSR3UTfUjisyb0BdPc8P4nx5HIiIgtRQZkXbjeNhixLjG0H3sXjX0ml53Cyj_Xc3E9eb6eQRgzOoXiPHsfXtRNLOIJhsNU1lLjX1y6G1QHXeA5kya1ezJne1oLephE5CniK3vCY9rqiagx797qPYlqatIWRVJ9OwCfwgaeMTcrjVl_Tg_zA6SHaPuSvyWbe0vPqybJTqnfso3-FVFBTWRS2b7mRw9HaDc2gg24i7NQCHSphA"
                          alt="Bee Icon"
                          className="w-6 h-6 object-contain"
                        />
                        <span className="text-[#ffb04f] font-bold text-sm">BeeCarbonat</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#a69bb3] uppercase">1080 x 1080</span>
                    </div>

                    {/* Banner Center */}
                    <div className="relative z-10 text-center space-y-3 my-auto">
                      <h3 className="text-xl font-extrabold text-black dark:text-white leading-tight drop-shadow-[0_0_15px_rgba(255,138,0,0.7)]">
                        L'intelligence <span className="text-[#ff8a00]">au service du climat</span>
                      </h3>
                      <p className="text-[11px] text-[#e0d6ed]">
                        Maximize Sustainability ROI with BeeCarbonat's AI-driven platform.
                      </p>

                      {/* Greener Future Badge */}
                      <div className="p-3 rounded-2xl bg-[#1c1230]/90 border border-[#ff8a00]/40 backdrop-blur-md max-w-xs mx-auto space-y-1.5">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-black dark:text-white">
                          <span className="material-symbols-outlined text-[#ff8a00] text-[16px]">sync_saved_locally</span>
                          <span>Greener Future: 100% Tracked</span>
                        </div>
                        <div className="w-full bg-[#120822] h-2 rounded-full overflow-hidden border border-[#ff8a00]/20">
                          <div className="bg-gradient-to-r from-[#ff8a00] to-[#ffaa00] h-full w-full"></div>
                        </div>
                        <span className="text-[9px] text-[#a69bb3] block">Measurable Impact. Optimized ROI.</span>
                      </div>
                    </div>

                    {/* Banner Bottom CTA */}
                    <div className="relative z-10 text-center">
                      <div className="inline-block px-6 py-2 rounded-full border border-[#ff8a00] text-[#ff8a00] font-bold text-xs shadow-[0_0_15px_rgba(255,138,0,0.4)]">
                        Découvrir nos solutions
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: FULL BEECARBONAT LANDING PAGE PREVIEW */}
        {activeTab === 'beecarbonat-preview' && (
          <div className="rounded-3xl bg-[#0f0a18] border border-[#ff8a00]/30 overflow-hidden shadow-2xl p-6 sm:p-12 relative animate-in fade-in duration-200">
            {/* Embedded BeeCarbonat Header */}
            <div className="w-full max-w-5xl mx-auto mb-12 flex justify-center">
              <div className="w-full rounded-full bg-[rgba(20,15,25,0.6)] backdrop-blur-xl border border-[rgba(255,138,0,0.3)] px-6 py-3 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <img
                    alt="Bee Icon"
                    className="h-8 w-8 object-contain filter drop-shadow-[0_0_10px_rgba(255,138,0,0.8)]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcyVNGRLiSR3UTfUjisyb0BdPc8P4nx5HIiIgtRQZkXbjeNhixLjG0H3sXjX0ml53Cyj_Xc3E9eb6eQRgzOoXiPHsfXtRNLOIJhsNU1lLjX1y6G1QHXeA5kya1ezJne1oLephE5CniK3vCY9rqiagx797qPYlqatIWRVJ9OwCfwgaeMTcrjVl_Tg_zA6SHaPuSvyWbe0vPqybJTqnfso3-FVFBTWRS2b7mRw9HaDc2gg24i7NQCHSphA"
                  />
                  <span className="text-[#ffb04f] font-bold text-xl tracking-wide">BeeCarbonat</span>
                </div>

                {/* Navigation */}
                <div className="hidden md:flex items-center gap-8 text-gray-300 text-sm font-medium">
                  <button onClick={() => setActiveTab('gallery')} className="hover:text-black dark:text-white transition-colors">Solutions</button>
                  <button onClick={() => setActiveTab('simulator')} className="hover:text-black dark:text-white transition-colors">Pricing</button>
                  <button onClick={() => setActiveTab('customizer')} className="hover:text-black dark:text-white transition-colors">Architecture</button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuickAdd(initialAdPacks[5])}
                    className="bg-gradient-to-r from-[#ff8a00] to-[#ffaa00] text-gray-950 font-semibold px-5 py-2 rounded-full hover:shadow-[0_0_15px_rgba(255,138,0,0.6)] transition-all text-xs"
                  >
                    Ajouter ce Pack au Panier
                  </button>
                </div>
              </div>
            </div>

            {/* BeeCarbonat Hero Section */}
            <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[420px]">
              {/* Hero Text */}
              <div className="lg:w-1/2 flex flex-col justify-center gap-6 text-center lg:text-left z-20">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#ff8a00] leading-tight tracking-tight drop-shadow-[0_0_20px_rgba(255,138,0,0.6)]">
                  BeeCarbonat
                </h1>
                <p className="text-lg sm:text-xl text-gray-200 font-medium max-w-xl mx-auto lg:mx-0">
                  Environmental Sustainability Platform for a Greener Future
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={() => handleQuickAdd(initialAdPacks[0])}
                    className="py-3 px-6 rounded-full bg-gradient-to-r from-[#ff8a00] to-[#ffaa00] text-gray-950 font-bold text-xs hover:shadow-[0_0_20px_rgba(255,138,0,0.7)] transition-all"
                  >
                    Lancer Campagne Pub
                  </button>
                  <button
                    onClick={onOpenCart}
                    className="py-3 px-6 rounded-full bg-white/5 border border-[#ff8a00]/40 text-black dark:text-white font-medium text-xs hover:bg-white/10 transition-all"
                  >
                    Voir le Panier ({cartItems.length})
                  </button>
                </div>
              </div>

              {/* Hero Image */}
              <div className="lg:w-1/2 flex justify-center lg:justify-end relative z-10 w-full max-w-md lg:max-w-none mx-auto">
                <img
                  alt="Futuristic Eco City Isometric Illustration"
                  className="w-full h-auto object-contain max-h-[420px]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRv3jJhpt9YAV4JcxXYZZ0XGiCUse8p5dFmKrvKC7r10twaoyb-FusYO16b2ZkZiYqR8-Drops92kKze-BCfL7B4vTPFFCJIQm0wHFq7oYJsd4yC4ph2t5DEWEYPvbAgt18ycHUv5e4tFXNnBd3fTfTmBoZ0-HAaB_QiHNTYpHTxued5t7VUWHqtYNrpJf7B-DqOTF6Mh5FGHJxvt9iUFMte6y7Tr-ANdu1o-cLLaF3GEZEQZKfDKUjg"
                  style={{ filter: 'drop-shadow(0 0 30px rgba(255,138,0,0.25))' }}
                />
              </div>
            </div>

            {/* Features Section */}
            <div className="w-full max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature Card 1 */}
              <div className="rounded-2xl p-6 flex items-start gap-5 bg-[rgba(20,15,25,0.5)] backdrop-blur-xl border border-[rgba(255,138,0,0.2)] hover:bg-white/5 transition-colors duration-300 group">
                <div className="p-3 bg-[#ff8a00]/10 rounded-xl border border-[#ff8a00]/30 group-hover:border-[#ff8a00]/50 transition-colors">
                  <img
                    alt="Carbon Footprint Globe Icon"
                    className="w-12 h-12 filter drop-shadow-[0_0_10px_rgba(255,138,0,0.8)]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb5WTbdxJl-DhHwwTV0nLCvLZgAtGhFbq7PvSyP-LmMU7uyYZZM3cC3jDAapnz4gzAJtzTzUY0LE3Q-P1qG7GSvUWHL9quauetpaCYOL6w2gzO-1owsjos813yiVW4NCBkQUJvd82ARL0PM8RrKPqKM7JyIpt2yCDAwaTjjgt8Ju01utbzUcYdZmXOXmVJ_AY-X-hR2RzCtjWRz8rSptpS-OC1YFPhDYujHJp2-xaqkBNZUPXQPxZsXQ"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Carbon Footprint Tracking</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Real-time monitoring and reduction strategies.
                  </p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="rounded-2xl p-6 flex items-start gap-5 bg-[rgba(20,15,25,0.5)] backdrop-blur-xl border border-[rgba(255,138,0,0.2)] hover:bg-white/5 transition-colors duration-300 group">
                <div className="p-3 bg-[#ff8a00]/10 rounded-xl border border-[#ff8a00]/30 group-hover:border-[#ff8a00]/50 transition-colors">
                  <img
                    alt="AI Sustainability Brain Icon"
                    className="w-12 h-12 filter drop-shadow-[0_0_10px_rgba(255,138,0,0.8)]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2wWFKTQzy91-zp8dA4Ir3IkRx-2MbEK6PlbjGaYIh-ZA3GgDBMAZ5vBGpLLZ9RG1q6WBcovqjJt6t8uWMbTQWFjDL19BpKf6tEwNo23NvlNwPiMcMp1qLWUnxEq16MUGoVLYJtuoB_eFyzGJ77Yx4DDUQsyXnLId0hD4QJIwntoxRhg_nZtamMParh-wBw7kt0Lv0ybk3jDcnE9JKWkPxF_4rCEaxiMskhKb_TznfuQdvQiaEQHv39w"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">AI Sustainability Insights</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Predictive analytics for eco-conscious decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE AD CUSTOMIZER & GENERATOR */}
        {activeTab === 'customizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-[#160d26] border border-[#ff8a00]/30 space-y-5">
                <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ff8a00] text-[20px]">tune</span>
                  <span>{lang === 'fr' ? 'Personnaliser votre annonce' : 'Customize Your Banner'}</span>
                </h3>

                {/* Brand selection */}
                <div>
                  <label className="text-xs font-mono text-[#a69bb3] uppercase block mb-1.5">{lang === 'fr' ? 'Marque :' : 'Brand:'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCustomBrand('BeeCarbonat');
                        setCustomTitle("L'intelligence au service du climat");
                        setCustomSubtitle("Maximize Sustainability ROI with BeeCarbonat's AI-driven platform.");
                        setCustomBadge("Greener Future: 100% Tracked");
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold font-mono transition-colors ${
                        customBrand === 'BeeCarbonat'
                          ? 'bg-[#ff8a00]/25 text-[#ffb04f] border border-[#ff8a00]'
                          : 'bg-[#1f1436] text-[#8e81a3] border border-[#ff8a00]/15'
                      }`}
                    >
                      BeeCarbonat (Climat)
                    </button>
                    <button
                      onClick={() => {
                        setCustomBrand('REZIDET');
                        setCustomTitle("Transformez vos coûts en levier de croissance");
                        setCustomSubtitle("Approuvé par 500+ entreprises pour optimiser leur ROI immobilier.");
                        setCustomBadge("+30% SAVINGS Coûts Immobiliers");
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold font-mono transition-colors ${
                        customBrand === 'REZIDET'
                          ? 'bg-[#ff8a00]/25 text-[#ffb04f] border border-[#ff8a00]'
                          : 'bg-[#1f1436] text-[#8e81a3] border border-[#ff8a00]/15'
                      }`}
                    >
                      REZIDET (Smart Bâtiments)
                    </button>
                  </div>
                </div>

                {/* Format selection */}
                <div>
                  <label className="text-xs font-mono text-[#a69bb3] uppercase block mb-1.5">{lang === 'fr' ? 'Format publicitaire :' : 'Ad Format:'}</label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {[
                      { id: '1080x1080', label: 'Carré 1080x1080 (Social)' },
                      { id: '1200x628', label: 'Paysage 1200x628 (Feed)' },
                      { id: '1080x1920', label: 'Vertical 1080x1920 (Story)' },
                      { id: '728x90', label: 'Bandeau 728x90 (Display)' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setCustomFormat(fmt.id as any)}
                        className={`p-2 rounded-xl text-[11px] transition-colors ${
                          customFormat === fmt.id
                            ? 'bg-[#ff8a00]/25 text-[#ffb04f] border border-[#ff8a00]'
                            : 'bg-[#1f1436] text-[#8e81a3] border border-[#ff8a00]/15'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title input */}
                <div>
                  <label className="text-xs font-mono text-[#a69bb3] uppercase block mb-1.5">{lang === 'fr' ? 'Titre Principal :' : 'Main Headline:'}</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-[#11071f] border border-[#ff8a00]/30 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-[#ff8a00]"
                  />
                </div>

                {/* Subtitle input */}
                <div>
                  <label className="text-xs font-mono text-[#a69bb3] uppercase block mb-1.5">{lang === 'fr' ? 'Sous-Titre :' : 'Subtitle:'}</label>
                  <input
                    type="text"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    className="w-full bg-[#11071f] border border-[#ff8a00]/30 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-[#ff8a00]"
                  />
                </div>

                {/* Badge input */}
                <div>
                  <label className="text-xs font-mono text-[#a69bb3] uppercase block mb-1.5">{lang === 'fr' ? 'Badge Impact :' : 'Impact Badge:'}</label>
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    className="w-full bg-[#11071f] border border-[#ff8a00]/30 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-[#ff8a00]"
                  />
                </div>

                {/* CTA input */}
                <div>
                  <label className="text-xs font-mono text-[#a69bb3] uppercase block mb-1.5">{lang === 'fr' ? 'Bouton d’action (CTA) :' : 'CTA Button:'}</label>
                  <input
                    type="text"
                    value={customCta}
                    onChange={(e) => setCustomCta(e.target.value)}
                    className="w-full bg-[#11071f] border border-[#ff8a00]/30 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-[#ff8a00]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const customPack: AdCampaignPack = {
                        id: `custom-${Date.now()}`,
                        brand: customBrand,
                        title: customTitle,
                        subtitle: customSubtitle,
                        tagline: customBadge,
                        format: customFormat === '1080x1080' ? '1080x1080 Social' : 'Multi-Format Pack',
                        priceBase: 550,
                        estimatedImpressions: 500000,
                        expectedCTR: 4.0,
                        imageUrl: customBrand === 'BeeCarbonat'
                          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRv3jJhpt9YAV4JcxXYZZ0XGiCUse8p5dFmKrvKC7r10twaoyb-FusYO16b2ZkZiYqR8-Drops92kKze-BCfL7B4vTPFFCJIQm0wHFq7oYJsd4yC4ph2t5DEWEYPvbAgt18ycHUv5e4tFXNnBd3fTfTmBoZ0-HAaB_QiHNTYpHTxued5t7VUWHqtYNrpJf7B-DqOTF6Mh5FGHJxvt9iUFMte6y7Tr-ANdu1o-cLLaF3GEZEQZKfDKUjg'
                          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb5WTbdxJl-DhHwwTV0nLCvLZgAtGhFbq7PvSyP-LmMU7uyYZZM3cC3jDAapnz4gzAJtzTzUY0LE3Q-P1qG7GSvUWHL9quauetpaCYOL6w2gzO-1owsjos813yiVW4NCBkQUJvd82ARL0PM8RrKPqKM7JyIpt2yCDAwaTjjgt8Ju01utbzUcYdZmXOXmVJ_AY-X-hR2RzCtjWRz8rSptpS-OC1YFPhDYujHJp2-xaqkBNZUPXQPxZsXQ',
                        accentColor: '#ff8a00',
                        category: customBrand === 'BeeCarbonat' ? 'Climat & IA' : 'Immobilier & IoT',
                        badge: 'SUR-MESURE',
                        description: `Bannière personnalisée (${customFormat}) pour ${customBrand}.`,
                        features: ['Format sur mesure', 'Pixel IA dynamique', 'Optimisation des conversions'],
                        recommendedAudiences: ['Décideurs B2B', 'Directeurs Opérations'],
                        platforms: ['Instagram', 'LinkedIn', 'Google Ads']
                      };
                      handleQuickAdd(customPack);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff8a00] to-[#ffaa00] text-gray-950 font-bold text-xs hover:shadow-[0_0_20px_rgba(255,138,0,0.6)] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                    <span>{lang === 'fr' ? 'Ajouter cette création au panier (550 €)' : 'Add this custom ad to cart (550 €)'}</span>
                  </button>

                  <button
                    onClick={handleCopySnippet}
                    className="w-full py-2.5 rounded-xl bg-[#23173d] border border-[#ff8a00]/30 hover:bg-[#322354] text-black dark:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedCode ? 'check' : 'code'}
                    </span>
                    <span>{copiedCode ? (lang === 'fr' ? 'Code HTML Copié !' : 'HTML Code Copied!') : (lang === 'fr' ? 'Copier le code HTML Embed' : 'Copy HTML Embed Snippet')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Preview Stage */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 rounded-3xl bg-[#140b24] border border-[#ff8a00]/25 min-h-[500px]">
              <span className="text-xs text-[#a69bb3] uppercase font-mono mb-4">
                {lang === 'fr' ? `Aperçu en direct (${customFormat})` : `Live Preview (${customFormat})`}
              </span>

              {/* Rendered Live Ad Container */}
              <div 
                className={`w-full max-w-md bg-[#0f0a18] border-2 border-[#ff8a00] rounded-3xl p-6 relative overflow-hidden shadow-[0_0_40px_rgba(255,138,0,0.3)] flex flex-col justify-between ${
                  customFormat === '1080x1080' ? 'aspect-square' :
                  customFormat === '1200x628' ? 'aspect-[1.91/1]' :
                  customFormat === '1080x1920' ? 'aspect-[9/16] max-w-xs' : 'py-3 px-6'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcyVNGRLiSR3UTfUjisyb0BdPc8P4nx5HIiIgtRQZkXbjeNhixLjG0H3sXjX0ml53Cyj_Xc3E9eb6eQRgzOoXiPHsfXtRNLOIJhsNU1lLjX1y6G1QHXeA5kya1ezJne1oLephE5CniK3vCY9rqiagx797qPYlqatIWRVJ9OwCfwgaeMTcrjVl_Tg_zA6SHaPuSvyWbe0vPqybJTqnfso3-FVFBTWRS2b7mRw9HaDc2gg24i7NQCHSphA"
                      alt="Logo"
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-[#ffb04f] font-bold text-xs">{customBrand}</span>
                  </div>
                  <span className="text-[9px] font-mono text-[#a69bb3]">{customFormat}</span>
                </div>

                {/* Body */}
                <div className="text-center space-y-2.5 my-auto relative z-10">
                  <h4 className="text-lg font-bold text-black dark:text-white drop-shadow-[0_0_12px_rgba(255,138,0,0.7)] leading-tight">
                    {customTitle}
                  </h4>
                  <p className="text-[11px] text-[#cdc3d0] line-clamp-2">
                    {customSubtitle}
                  </p>
                  
                  {/* Badge */}
                  <div className="inline-block px-3 py-1 rounded-full bg-[#ff8a00]/20 border border-[#ff8a00] text-[#ffb04f] text-[10px] font-bold font-mono">
                    {customBadge}
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="text-center relative z-10">
                  <div className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-[#ff8a00] to-[#ffaa00] text-gray-950 font-bold text-xs shadow-[0_0_15px_rgba(255,138,0,0.5)]">
                    {customCta}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SIMULATOR & BUDGET PROJECTION */}
        {activeTab === 'simulator' && (
          <div className="p-8 rounded-3xl bg-[#160d26] border border-[#ff8a00]/30 space-y-8 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#ff8a00]/20 text-[#ffb04f] border border-[#ff8a00]/40 text-xs font-mono font-bold">
                SIMULATEUR DE RENDEMENT & CONVERSION
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
                {lang === 'fr' ? 'Projetez l’impact de vos campagnes publicitaires' : 'Project Your Ad Campaign Impact'}
              </h2>
              <p className="text-xs text-[#cdc3d0]">
                {lang === 'fr'
                  ? 'Ajustez votre budget et la durée pour estimer en direct le nombre d’impressions, de clics qualifiés et de leads B2B générés.'
                  : 'Adjust budget and duration to estimate live impressions, qualified clicks, and B2B leads generated.'}
              </p>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#ff8a00]/20">
              {/* Budget Slider */}
              <div className="p-4 rounded-2xl bg-[#1e1333] border border-[#ff8a00]/20 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a69bb3] uppercase font-mono">{lang === 'fr' ? 'Budget Total :' : 'Total Budget:'}</span>
                  <strong className="text-black dark:text-white font-mono text-base">{simBudget} €</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={simBudget}
                  onChange={(e) => setSimBudget(Number(e.target.value))}
                  className="w-full accent-[#ff8a00] h-1.5 bg-[#2c1d47] rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-[#8e81a3] block">{lang === 'fr' ? 'Équivaut à ~' : 'Equivalent to ~'} {Math.round(simBudget / simDuration)} € / {lang === 'fr' ? 'jour' : 'day'}</span>
              </div>

              {/* Duration Slider */}
              <div className="p-4 rounded-2xl bg-[#1e1333] border border-[#ff8a00]/20 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a69bb3] uppercase font-mono">{lang === 'fr' ? 'Durée de diffusion :' : 'Duration:'}</span>
                  <strong className="text-black dark:text-white font-mono text-base">{simDuration} {lang === 'fr' ? 'jours' : 'days'}</strong>
                </div>
                <input
                  type="range"
                  min="7"
                  max="60"
                  step="1"
                  value={simDuration}
                  onChange={(e) => setSimDuration(Number(e.target.value))}
                  className="w-full accent-[#ff8a00] h-1.5 bg-[#2c1d47] rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-[#8e81a3] block">{lang === 'fr' ? 'Optimisation continue IA' : 'Continuous AI Optimization'}</span>
              </div>

              {/* Channel Selector */}
              <div className="p-4 rounded-2xl bg-[#1e1333] border border-[#ff8a00]/20 space-y-2">
                <span className="text-[#a69bb3] uppercase font-mono text-xs block">{lang === 'fr' ? 'Canal prioritaire :' : 'Primary Channel:'}</span>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  {(['Omnichannel', 'Meta', 'LinkedIn', 'Google'] as const).map((chan) => (
                    <button
                      key={chan}
                      onClick={() => setSimChannel(chan)}
                      className={`p-1.5 rounded-lg text-[10px] transition-colors ${
                        simChannel === chan
                          ? 'bg-[#ff8a00] text-gray-950 font-bold'
                          : 'bg-[#281a45] text-[#8e81a3] hover:text-black dark:text-white'
                      }`}
                    >
                      {chan}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Projection Graph */}
            <div className="p-6 rounded-2xl bg-[#120a20] border border-[#ff8a00]/20 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white font-mono">
                  {lang === 'fr' ? 'Courbe Prédictive des Impressions' : 'Predictive Impressions Trajectory'}
                </h4>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-[#ffb04f]">Portée : ~{(simBudget * 680).toLocaleString()} imp.</span>
                  <span className="text-emerald-400">Clics : ~{(simBudget * 29.8).toFixed(0)}</span>
                  <span className="text-[#ffb2bb]">Leads démo : ~{(simBudget * 3.4).toFixed(0)}</span>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulationChartData}>
                    <defs>
                      <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff8a00" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ff8a00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#7a6d8c" fontSize={11} />
                    <YAxis stroke="#7a6d8c" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a112c', borderColor: '#ff8a00', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="impressions" stroke="#ff8a00" fillOpacity={1} fill="url(#colorImp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Add simulated campaign to cart */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    const simPack: AdCampaignPack = {
                      id: `sim-${Date.now()}`,
                      brand: 'BeeCarbonat',
                      title: `Campagne ${simChannel} Personnalisée`,
                      subtitle: `${simDuration} jours de diffusion optimisée par IA`,
                      tagline: `Budget total : ${simBudget} €`,
                      format: 'Multi-Format Pack',
                      priceBase: simBudget,
                      estimatedImpressions: Math.round(simBudget * 680),
                      expectedCTR: 4.2,
                      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRv3jJhpt9YAV4JcxXYZZ0XGiCUse8p5dFmKrvKC7r10twaoyb-FusYO16b2ZkZiYqR8-Drops92kKze-BCfL7B4vTPFFCJIQm0wHFq7oYJsd4yC4ph2t5DEWEYPvbAgt18ycHUv5e4tFXNnBd3fTfTmBoZ0-HAaB_QiHNTYpHTxued5t7VUWHqtYNrpJf7B-DqOTF6Mh5FGHJxvt9iUFMte6y7Tr-ANdu1o-cLLaF3GEZEQZKfDKUjg',
                      accentColor: '#ff8a00',
                      category: 'Multi-Canal',
                      badge: 'SIMULATEUR',
                      description: `Campagne ${simChannel} calibrée pour ${simDuration} jours.`,
                      features: [`${(simBudget * 680).toLocaleString()} impressions estimées`, 'Pixel de conversion dynamique'],
                      recommendedAudiences: ['Décideurs B2B'],
                      platforms: ['Instagram', 'LinkedIn', 'Google Ads']
                    };
                    handleQuickAdd(simPack);
                  }}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#ff8a00] to-[#ffaa00] text-gray-950 font-bold text-xs hover:shadow-[0_0_20px_rgba(255,138,0,0.6)] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  <span>{lang === 'fr' ? `Ajouter cette configuration au panier (${simBudget} €)` : `Add this setup to cart (${simBudget} €)`}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
