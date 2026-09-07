import React from 'react';
import { NavigationPage, BiometricState, UserSession } from '../../types/bizos';
import { PromoTopBanner } from '../PromoTopBanner';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { ErrorBoundary } from '../ErrorBoundary';

interface PublicLayoutProps {
  currentPage: NavigationPage;
  onNavigate: (page: any) => void;
  lang: 'fr' | 'en';
  onToggleLang: () => void;
  currentUser: UserSession | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenTrial: () => void;
  biometrics: BiometricState;
  cartCount: number;
  onOpenCart: () => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentPage,
  onNavigate,
  lang,
  onToggleLang,
  currentUser,
  onLogout,
  onOpenLogin,
  onOpenTrial,
  biometrics,
  cartCount,
  onOpenCart,
  children,
}) => {
  return (
    <div className="dark min-h-screen bg-black text-[#e8defb] flex flex-col selection:bg-[#ecd7ff] selection:text-[#29074a]">
      {/* Top Promotional Bar for BeeCarbonIt / REZIDET Ads */}
      <PromoTopBanner
        onOpenAdStudio={() => onNavigate('beecarbonat-pub')}
        onOpenCart={onOpenCart}
        cartCount={cartCount}
        lang={lang}
      />

      {/* Universal Navigation Header */}
      <Header
        currentPage={currentPage}
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenTrial={onOpenTrial}
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenCart={onOpenCart}
        cartCount={cartCount}
        biometrics={biometrics}
        lang={lang}
        onToggleLang={onToggleLang}
      />

      {/* Main Content Body with Full Width Layout */}
      <div className="flex-grow relative flex w-full max-w-[1400px] mx-auto px-4">
        {/* Main Content View with full width span */}
        <main className="flex-grow w-full flex flex-col min-h-0 relative z-10 pb-16">
          <ErrorBoundary key={currentPage}>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Footer */}
      <Footer onNavigate={onNavigate} onOpenTrial={onOpenTrial} lang={lang} />
    </div>
  );
};
