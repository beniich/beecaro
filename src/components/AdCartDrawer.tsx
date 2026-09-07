import React, { useState } from 'react';
import { AdCartItem } from '../data/adsData';
import confetti from 'canvas-confetti';

interface AdCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: AdCartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<AdCartItem>) => void;
  onClearCart: () => void;
  onOpenAdStudio: () => void;
  lang?: 'fr' | 'en';
}

export const AdCartDrawer: React.FC<AdCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onUpdateItem,
  onClearCart,
  onOpenAdStudio,
  lang = 'fr'
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState<null | {
    orderId: string;
    total: number;
    impressions: number;
    campaignKey: string;
  }>(null);

  if (!isOpen) return null;

  // Calculate totals
  const rawTotal = cartItems.reduce((sum, item) => sum + (item.budgetPerDay * item.durationDays), 0);
  const discountAmount = (rawTotal * appliedDiscount) / 100;
  const finalTotal = Math.max(0, rawTotal - discountAmount);
  const totalEstimatedImpressions = cartItems.reduce(
    (sum, item) => sum + Math.round((item.pack.estimatedImpressions * (item.budgetPerDay / (item.pack.priceBase / 7))) * (item.durationDays / 7)),
    0
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'CLIMAT2026' || code === 'BEECARBON' || code === 'PROMO30') {
      setAppliedDiscount(30);
    } else if (code === 'REZIDET15' || code === 'BIZOS15') {
      setAppliedDiscount(15);
    } else if (code === 'WELCOME') {
      setAppliedDiscount(10);
    } else {
      setCouponError(lang === 'fr' ? 'Code promo invalide. Essayez CLIMAT2026 ou PROMO30' : 'Invalid coupon code. Try CLIMAT2026 or PROMO30');
    }
  };

  const handleLaunchCampaign = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      const generatedOrder = {
        orderId: `CAMP-${Math.floor(100000 + Math.random() * 900000)}`,
        total: finalTotal,
        impressions: totalEstimatedImpressions,
        campaignKey: `PX-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`
      };
      setOrderComplete(generatedOrder);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 1200);
  };

  const handleResetAfterOrder = () => {
    onClearCart();
    setOrderComplete(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-white dark:bg-slate-950/75 backdrop-blur-sm transition-opacity" 
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-[#140e21] border-l border-[#ff8a00]/30 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] h-full flex flex-col z-10 text-[#e8defb]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#ff8a00]/20 flex items-center justify-between bg-[#19112a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8a00] to-[#ffb04f] p-[1.5px] shadow-[0_0_20px_rgba(255,138,0,0.4)]">
              <div className="w-full h-full bg-[#140e21] rounded-[10px] flex items-center justify-center text-[#ff8a00]">
                <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                {lang === 'fr' ? 'Panier Publicitaire & Campagnes' : 'Ad Cart & Campaign Launcher'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff8a00]/20 text-[#ffb04f] border border-[#ff8a00]/40 font-mono">
                  {cartItems.length} {lang === 'fr' ? 'pack(s)' : 'pack(s)'}
                </span>
              </h2>
              <p className="text-xs text-[#cdc3d0]">
                {lang === 'fr' ? 'BeeCarbonIt & REZIDET Marketing Hub' : 'BeeCarbonIt & REZIDET Marketing Suite'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#251b3d] hover:bg-[#342754] text-[#cdc3d0] hover:text-black dark:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {orderComplete ? (
            /* Order Success State */
            <div className="bg-[#1b122e] border border-[#ff8a00]/40 rounded-2xl p-6 text-center space-y-5 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#ff8a00]/20 border border-[#ff8a00] flex items-center justify-center text-[#ff8a00] shadow-[0_0_30px_rgba(255,138,0,0.5)]">
                <span className="material-symbols-outlined text-[36px]">campaign</span>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold uppercase tracking-wider">
                  {lang === 'fr' ? 'Campagne Programmée avec Succès !' : 'Campaign Scheduled Successfully!'}
                </span>
                <h3 className="text-xl font-bold text-black dark:text-white mt-3">
                  {lang === 'fr' ? 'Vos annonces BeeCarbonIt / REZIDET sont prêtes' : 'Your BeeCarbonIt / REZIDET Ads are Live'}
                </h3>
                <p className="text-xs text-[#cdc3d0] mt-1">
                  {lang === 'fr' 
                    ? 'Le flux de tracking et les bannières sont synchronisés avec les régies publicitaires sélectionnées.' 
                    : 'Tracking pixel and banners are synced across all selected advertising networks.'}
                </p>
              </div>

              {/* Order Info Box */}
              <div className="bg-[#120a20] rounded-xl p-4 border border-[#ff8a00]/20 text-left text-xs space-y-2.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#a69bb3]">{lang === 'fr' ? 'N° Commande :' : 'Order ID:'}</span>
                  <span className="text-black dark:text-white font-bold">{orderComplete.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a69bb3]">{lang === 'fr' ? 'Pixel de Suivi IA :' : 'AI Tracking Pixel:'}</span>
                  <span className="text-[#ffb04f] font-bold">{orderComplete.campaignKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a69bb3]">{lang === 'fr' ? 'Portée Estimée :' : 'Estimated Reach:'}</span>
                  <span className="text-emerald-400 font-bold">~{orderComplete.impressions.toLocaleString()} impressions</span>
                </div>
                <div className="flex justify-between border-t border-[#372754] pt-2">
                  <span className="text-[#a69bb3]">{lang === 'fr' ? 'Budget Total :' : 'Total Investment:'}</span>
                  <span className="text-black dark:text-white font-bold text-sm">{orderComplete.total.toLocaleString()} €</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleResetAfterOrder}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff8a00] to-[#ffaa00] text-gray-950 font-bold text-xs hover:shadow-[0_0_20px_rgba(255,138,0,0.6)] transition-all"
                >
                  {lang === 'fr' ? 'Retour au tableau de bord' : 'Return to Dashboard'}
                </button>
                <button
                  onClick={() => {
                    handleResetAfterOrder();
                    onOpenAdStudio();
                  }}
                  className="py-3 px-4 rounded-xl bg-[#251b3d] border border-[#ff8a00]/30 hover:bg-[#342754] text-black dark:text-white text-xs font-semibold transition-colors"
                >
                  {lang === 'fr' ? 'Voir le Studio Pub' : 'View Ad Studio'}
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#201535] border border-[#ff8a00]/20 flex items-center justify-center text-[#ff8a00]/60">
                <span className="material-symbols-outlined text-[40px]">shopping_cart</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  {lang === 'fr' ? 'Votre panier publicitaire est vide' : 'Your ad cart is empty'}
                </h3>
                <p className="text-xs text-[#cdc3d0] max-w-sm mx-auto mt-1">
                  {lang === 'fr'
                    ? 'Explorez nos packs d’annonces pour BeeCarbonIt et REZIDET (1080x1080, Isométrique 3D, Réseaux Sociaux, Display) et lancez votre campagne.'
                    : 'Explore our BeeCarbonIt & REZIDET ad packs (1080x1080, 3D Isometric, Social Media, Display) and launch your campaign.'}
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAdStudio();
                }}
                className="py-2.5 px-6 rounded-full bg-gradient-to-r from-[#ff8a00] to-[#ffb04f] text-gray-950 font-bold text-xs hover:shadow-[0_0_20px_rgba(255,138,0,0.6)] transition-all inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>{lang === 'fr' ? 'Découvrir les formats & packs pub' : 'Browse Ad Packs & Formats'}</span>
              </button>
            </div>
          ) : (
            /* Cart Items List */
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#cdc3d0]">
                  <span className="font-semibold uppercase tracking-wider">{lang === 'fr' ? 'Campagnes sélectionnées' : 'Selected Campaigns'}</span>
                  <button
                    onClick={onClearCart}
                    className="text-[#ffb2bb] hover:text-[#ff8a00] transition-colors"
                  >
                    {lang === 'fr' ? 'Vider le panier' : 'Clear all'}
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#1a122c] border border-[#ff8a00]/25 hover:border-[#ff8a00]/50 transition-colors space-y-3"
                  >
                    {/* Item Top Bar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#24193d] border border-[#ff8a00]/30 shrink-0 relative flex items-center justify-center">
                          <img
                            src={item.pack.imageUrl}
                            alt={item.pack.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-white dark:bg-slate-950/80 text-[8px] text-[#ff8a00] font-mono">
                            {item.pack.brand}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-black dark:text-white line-clamp-1">{item.pack.title}</h4>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#ff8a00]/20 text-[#ffb04f] border border-[#ff8a00]/30 shrink-0">
                              {item.pack.format}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#a69bb3] line-clamp-1 mt-0.5">{item.pack.subtitle}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-400 font-mono">
                            <span className="material-symbols-outlined text-[12px]">visibility</span>
                            <span>~{Math.round((item.pack.estimatedImpressions * (item.budgetPerDay / (item.pack.priceBase / 7))) * (item.durationDays / 7)).toLocaleString()} imp.</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[#cdc3d0] hover:text-[#ff8a00] p-1 rounded transition-colors"
                        title="Supprimer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    {/* Adjustable Parameters (Budget / Duration) */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#ff8a00]/10 text-xs">
                      {/* Daily Budget */}
                      <div>
                        <label className="text-[10px] uppercase font-mono text-[#a69bb3] block mb-1">
                          {lang === 'fr' ? 'Budget / jour :' : 'Daily Budget:'} <strong className="text-black dark:text-white font-bold">{item.budgetPerDay} €</strong>
                        </label>
                        <input
                          type="range"
                          min="15"
                          max="250"
                          step="5"
                          value={item.budgetPerDay}
                          onChange={(e) => onUpdateItem(item.id, { budgetPerDay: Number(e.target.value) })}
                          className="w-full accent-[#ff8a00] h-1.5 bg-[#2a1c47] rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="text-[10px] uppercase font-mono text-[#a69bb3] block mb-1">
                          {lang === 'fr' ? 'Durée :' : 'Duration:'} <strong className="text-black dark:text-white font-bold">{item.durationDays} {lang === 'fr' ? 'jours' : 'days'}</strong>
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="30"
                          step="1"
                          value={item.durationDays}
                          onChange={(e) => onUpdateItem(item.id, { durationDays: Number(e.target.value) })}
                          className="w-full accent-[#ff8a00] h-1.5 bg-[#2a1c47] rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Platforms Pill selector */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(['Instagram', 'Facebook', 'LinkedIn', 'Google Ads'] as const).map((plat) => {
                        const isSelected = item.selectedPlatforms.includes(plat);
                        return (
                          <button
                            key={plat}
                            onClick={() => {
                              const newPlatforms = isSelected
                                ? item.selectedPlatforms.filter((p) => p !== plat)
                                : [...item.selectedPlatforms, plat];
                              if (newPlatforms.length > 0) {
                                onUpdateItem(item.id, { selectedPlatforms: newPlatforms });
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                              isSelected
                                ? 'bg-[#ff8a00]/25 text-[#ffb04f] border border-[#ff8a00]/50'
                                : 'bg-[#22173b] text-[#8e81a3] border border-[#342457] hover:text-black dark:text-white'
                            }`}
                          >
                            {plat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Subtotal */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#ff8a00]/10 text-xs">
                      <span className="text-[#a69bb3] font-mono">{lang === 'fr' ? 'Sous-total campagne :' : 'Campaign subtotal:'}</span>
                      <span className="font-bold text-black dark:text-white font-mono text-sm">
                        {(item.budgetPerDay * item.durationDays).toLocaleString()} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <form onSubmit={handleApplyCoupon} className="p-4 rounded-xl bg-[#1b122e] border border-[#ff8a00]/20 space-y-2">
                <label className="text-xs font-semibold text-black dark:text-white block">
                  {lang === 'fr' ? 'Code Promo Publicitaire' : 'Ad Promo Code'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: CLIMAT2026, PROMO30"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#120921] border border-[#ff8a00]/30 rounded-xl px-3 py-2 text-xs text-black dark:text-white placeholder-[#786c8a] focus:outline-none focus:border-[#ff8a00]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2d1e4c] hover:bg-[#3d2a66] border border-[#ff8a00]/40 text-xs font-bold text-[#ffb04f] transition-colors"
                  >
                    {lang === 'fr' ? 'Appliquer' : 'Apply'}
                  </button>
                </div>
                {appliedDiscount > 0 && (
                  <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>{lang === 'fr' ? `Remise de -${appliedDiscount}% appliquée avec succès !` : `-${appliedDiscount}% discount applied successfully!`}</span>
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-[#ff8a00] font-mono">{couponError}</p>
                )}
              </form>

              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-[#191029] border border-[#ff8a00]/30 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  {lang === 'fr' ? 'Récapitulatif de diffusion' : 'Broadcast Summary'}
                </h4>
                <div className="space-y-1.5 text-xs text-[#cdc3d0] font-mono">
                  <div className="flex justify-between">
                    <span>{lang === 'fr' ? 'Budget brut :' : 'Gross Budget:'}</span>
                    <span className="text-black dark:text-white">{rawTotal.toLocaleString()} €</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>{lang === 'fr' ? `Remise promo (-${appliedDiscount}%) :` : `Promo discount (-${appliedDiscount}%):`}</span>
                      <span>-{discountAmount.toLocaleString()} €</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{lang === 'fr' ? 'Portée globale :' : 'Total Reach:'}</span>
                    <span className="text-[#ffb04f] font-bold">~{totalEstimatedImpressions.toLocaleString()} imp.</span>
                  </div>
                  <div className="flex justify-between border-t border-[#342457] pt-2 text-sm font-bold text-black dark:text-white">
                    <span>{lang === 'fr' ? 'Total à régler :' : 'Total to Pay:'}</span>
                    <span className="text-base text-[#ff8a00]">{finalTotal.toLocaleString()} €</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!orderComplete && cartItems.length > 0 && (
          <div className="p-6 border-t border-[#ff8a00]/20 bg-[#19112a] space-y-3">
            <button
              onClick={handleLaunchCampaign}
              disabled={isCheckingOut}
              className="w-full px-2 py-2 pr-4 rounded-full bg-orange-500 text-white dark:text-black font-bold text-[15px] shadow-[0_4px_14px_rgba(255,154,0,0.3)] hover:brightness-110 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-[12px] bg-white dark:bg-slate-950/15 flex items-center justify-center shrink-0">
                {isCheckingOut ? (
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                )}
              </div>
              <span className="flex-1 whitespace-nowrap px-1 text-left">
                {isCheckingOut 
                  ? (lang === 'fr' ? 'Lancement...' : 'Launching...') 
                  : (lang === 'fr' ? 'Lancer ma campagne' : 'Launch My Campaign')}
              </span>
              <div className="h-8 px-3 rounded-full bg-white dark:bg-slate-950 text-orange-500 font-black text-sm flex items-center justify-center shrink-0">
                {finalTotal.toLocaleString()} €
              </div>
            </button>
            <p className="text-[10px] text-center text-[#8e81a3]">
              {lang === 'fr'
                ? 'Activation instantanée des pixels et monitoring en direct sur Meta & LinkedIn.'
                : 'Instant pixel activation and live monitoring across Meta & LinkedIn.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
