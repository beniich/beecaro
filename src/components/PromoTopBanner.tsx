import React, { useState } from 'react';

interface PromoTopBannerProps {
  onOpenAdStudio: () => void;
  onOpenCart: () => void;
  cartCount: number;
  lang?: 'fr' | 'en';
}

export const PromoTopBanner: React.FC<PromoTopBannerProps> = ({
  onOpenAdStudio,
  onOpenCart,
  cartCount,
  lang = 'fr'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#170e28] via-[#24143a] to-[#170e28] border-b border-[#ff8a00]/30 py-2 px-4 relative z-40 text-xs">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Highlight Badge & Message */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff8a00]/20 border border-[#ff8a00]/50 text-[#ffb04f] font-mono font-bold text-[11px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8a00]"></span>
            <span>NOUVEAU • PUB & IMPACT</span>
          </div>
          <p className="text-[#f1e8ff] font-medium hidden sm:inline">
            {lang === 'fr' ? (
              <>
                <strong className="text-[#ffb04f]">beecarbonat & REZIDET</strong> : Bannières 1080x1080, IA Climat & Gestion Bâtiments disponibles.
              </>
            ) : (
              <>
                <strong className="text-[#ffb04f]">beecarbonat & REZIDET</strong> : 1080x1080 Ad Banners, Climate AI & Smart Real Estate available.
              </>
            )}
          </p>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={onOpenAdStudio}
            className="px-3 py-1 rounded-lg bg-[#ff8a00]/20 hover:bg-[#ff8a00]/35 text-[#ffb04f] border border-[#ff8a00]/40 font-semibold text-[11px] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            <span>{lang === 'fr' ? 'Voir le Studio & Formats Pub' : 'View Ad Studio & Banners'}</span>
          </button>

          <button
            onClick={onOpenCart}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#ff8a00] to-[#ffaa00] text-gray-950 font-bold text-[11px] shadow-[0_0_15px_rgba(255,138,0,0.4)] hover:shadow-[0_0_20px_rgba(255,138,0,0.6)] transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
            <span>{lang === 'fr' ? 'Mon Panier Pub' : 'My Ad Cart'}</span>
            {cartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-zinc-950/98 text-[#ff8a00] text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="text-[#9689a8] hover:text-white transition-colors p-1"
            title="Masquer le bandeau"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
