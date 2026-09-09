import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { PromoTopBanner } from './components/PromoTopBanner';
import { AdCartDrawer } from './components/AdCartDrawer';
import { PlanGate } from './components/PlanGate';

import { HomePage } from './features/home/HomePage';
import { FeaturesPage } from './features/features/FeaturesPage';
import { SolutionsVitalAIPage } from './features/solutions/SolutionsVitalAIPage';
import { SolutionsInboxAIPage } from './features/solutions/SolutionsInboxAIPage';
import { SolutionsMeetAIPage } from './features/solutions/SolutionsMeetAIPage';
import { SolutionsMorePage } from './features/solutions/SolutionsMorePage';
import { IntegrationsPage } from './features/integrations/IntegrationsPage';
import { PricingPage } from './features/pricing/PricingPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { BizOSDashboard } from './features/dashboard/BizOSDashboard';
import { SpaceFlowExecutiveDashboard } from './features/dashboard/SpaceFlowExecutiveDashboard';
import { AdStudioPage } from './features/ads/AdStudioPage';
import { PrivacyPage } from './features/legal/PrivacyPage';
import { TermsPage } from './features/legal/TermsPage';
import { SecurityPage } from './features/legal/SecurityPage';

// Floating Sidebar & CAFM Pages
import { FloatingSidebar } from './components/FloatingSidebar';
import { SuperadminSidebar } from './components/SuperadminSidebar';
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { useTheme } from './contexts/ThemeContext';
import { TelemetryProvider } from './telemetry/TelemetryProvider';
import { LightingCityPulse } from './features/lighting/LightingCityPulse';
import { WaterHydroSync } from './features/water/WaterHydroSync';
import { AirQuality } from './features/airquality/AirQuality';
import { EsgSuite } from './features/sustainability/EsgSuite';
import { AssetsManager } from './features/assets/AssetsManager';
import { SpacesManager } from './features/spaces/SpacesManager';
import { WorkOrdersManager } from './features/cmms/WorkOrdersManager';
import { PredictiveMaintenance } from './features/predictive/PredictiveMaintenance';
import { CarbonMarket } from './features/carbonmarket/CarbonMarket';
// Heavy Cyber Cockpits & 3D Twin Lazy-loaded to optimize memory during bundle compilation
const MissionControlDashboard = React.lazy(() => import('./components/cyber/MissionControlDashboard').then(m => ({ default: m.MissionControlDashboard })));
const GodModeSystemView = React.lazy(() => import('./components/cyber/GodModeSystemView').then(m => ({ default: m.GodModeSystemView })));
const SecurityThreatMatrix = React.lazy(() => import('./components/cyber/SecurityThreatMatrix').then(m => ({ default: m.SecurityThreatMatrix })));
const SustainabilityMatrix = React.lazy(() => import('./components/cyber/SustainabilityMatrix').then(m => ({ default: m.SustainabilityMatrix })));
const NeuralEngineArchitect = React.lazy(() => import('./components/cyber/NeuralEngineArchitect').then(m => ({ default: m.NeuralEngineArchitect })));
const GlobalEnergyNexus = React.lazy(() => import('./components/cyber/GlobalEnergyNexus').then(m => ({ default: m.GlobalEnergyNexus })));
const GlobalFleetCommand = React.lazy(() => import('./components/cyber/GlobalFleetCommand').then(m => ({ default: m.GlobalFleetCommand })));
const DatabaseCacheMonitor = React.lazy(() => import('./components/cyber/DatabaseCacheMonitor').then(m => ({ default: m.DatabaseCacheMonitor })));
const PredictiveCoreAnalysis = React.lazy(() => import('./components/cyber/PredictiveCoreAnalysis').then(m => ({ default: m.PredictiveCoreAnalysis })));
const ApiGatewayTrafficHub = React.lazy(() => import('./components/cyber/ApiGatewayTrafficHub').then(m => ({ default: m.ApiGatewayTrafficHub })));
const MultiCloudInfrastructure = React.lazy(() => import('./components/cyber/MultiCloudInfrastructure').then(m => ({ default: m.MultiCloudInfrastructure })));
const ImmutableAuditVault = React.lazy(() => import('./components/cyber/ImmutableAuditVault').then(m => ({ default: m.ImmutableAuditVault })));
const DigitalTwinViewer = React.lazy(() => import('./features/digitaltwin/DigitalTwinViewer').then(m => ({ default: m.DigitalTwinViewer })));
const GrafanaCockpit = React.lazy(() => import('./features/grafana/GrafanaCockpit').then(m => ({ default: m.GrafanaCockpit })));
const RubricsInspector = React.lazy(() => import('./features/diagnostics/RubricsInspector').then(m => ({ default: m.RubricsInspector })));
import { AssetDetailModal } from './components/AssetDetailModal';
import { WorkOrderModal } from './components/WorkOrderModal';
import { QrScannerModal } from './features/qr/QrScannerModal';
import { ComplaintQrGenerator } from './features/qr/ComplaintQrGenerator';
import { IntervenantsPanel } from "./features/dashboard/IntervenantsPanel";
import { api } from './services/api';

import {
  TeamOperationsPanel,
  EnvImpactPanel,
  EsgCopilotPanel,
  BimViewerPanel,
  PredictiveAiPanel,
  OccupantsCarePanel,
  BeeRootsPanel,
  SuccessStoriesPanel,
  CareersPanel,
  PartnerPortalPanel,
  CmmsCockpitPanel,
  ErpIntegrationPanel,
  GoogleSheetsPanel,
  AnalyticsPanel,
  GenAiAssistantPanel,
  SecurityAccessPanel,
  SystemConfigPanel,
  PwaManifestPanel
} from './features/dashboard/NewOperationalPanels';
import { ApiKeyManager } from './components/security/ApiKeyManager';
import { TrialModal } from './components/TrialModal';

import { useAuth } from './contexts/AuthContext';
import { Asset, WorkOrder } from './types';
import { NavigationPage, BiometricState, UserSession } from './types/bizos';
import { initialBiometrics } from './data/bizosData';
import { initialAdPacks, AdCampaignPack, AdCartItem } from './data/adsData';
import { NativeDevice } from './services/nativeCapacitor';

export function App() {
  const { user: firebaseUser, profile: firebaseProfile, signOut: firebaseSignOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [biometrics, setBiometrics] = useState<BiometricState>(initialBiometrics);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Superadmin Cockpit Theme States
  const { theme, setTheme } = useTheme();
  const dashboardIsLight = theme !== 'dark';
  const [dashboardMode, setDashboardMode] = useState<'cafm' | 'web3'>('cafm');

  // CAFM & CMMS States
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [workOrderModalOpen, setWorkOrderModalOpen] = useState(false);
  const [preselectedAssetForWO, setPreselectedAssetForWO] = useState<Asset | null>(null);

  // User session state (persisted in localStorage or synced with Firebase Auth)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('beecarbonat_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Automatically sync Firebase Auth with active session
  useEffect(() => {
    // Initialize Native Android Status Bar & Back Navigation
    NativeDevice.initializeApp(() => {
      // If any modal is open, close it on Android back press instead of exiting
      if (loginModalOpen) { setLoginModalOpen(false); return true; }
      
      if (cartDrawerOpen) { setCartDrawerOpen(false); return true; }
      if (assetModalOpen) { setAssetModalOpen(false); return true; }
      if (workOrderModalOpen) { setWorkOrderModalOpen(false); return true; }
      return false; // Let history go back
    });
  }, [loginModalOpen, cartDrawerOpen, assetModalOpen, workOrderModalOpen]);

  useEffect(() => {
    if (firebaseUser) {
      const role = firebaseProfile?.role === 'admin' || firebaseUser.email === 'beniich.contact@gmail.com'
        ? 'SuperAdmin'
        : firebaseProfile?.role === 'technician'
        ? 'Technician'
        : 'FacilityManager';

      const sessionUser: UserSession = {
        email: firebaseUser.email || '',
        name: firebaseProfile?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Enterprise Operator',
        role,
        subscriptionStatus: firebaseProfile?.subscriptionStatus,
        plan: firebaseProfile?.plan,
        photoURL: firebaseUser.photoURL || undefined,
        loginTime: new Date().toISOString()
      };
      setCurrentUser(sessionUser);
      try {
        localStorage.setItem('beecarbonat_user', JSON.stringify(sessionUser));
      } catch {}
    }
  }, [firebaseUser, firebaseProfile]);

  const handleUpdateUserRole = (newRole: string) => {
    if (!currentUser) {
      const dummy: UserSession = {
        email: 'admin@beecarbonat.ai',
        name: 'Administrateur',
        role: newRole,
        loginTime: new Date().toISOString()
      };
      setCurrentUser(dummy);
      try {
        localStorage.setItem('beecarbonat_user', JSON.stringify(dummy));
      } catch {}
    } else {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      try {
        localStorage.setItem('beecarbonat_user', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleLoginSuccess = (email: string) => {
    let role = 'Admin';
    if (email.startsWith('founder')) {
      role = 'SuperAdmin';
    } else if (email.startsWith('executive')) {
      role = 'Admin';
    } else if (email.startsWith('lead')) {
      role = 'Technician';
    } else {
      role = 'FacilityManager';
    }

    const user: UserSession = {
      email,
      name: email.split('@')[0],
      role,
        subscriptionStatus: firebaseProfile?.subscriptionStatus,
        plan: firebaseProfile?.plan,
      loginTime: new Date().toISOString()
    };
    setCurrentUser(user);
    try {
      localStorage.setItem('beecarbonat_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setLoginModalOpen(false);
    // Automatically redirect user into the interactive dashboard / cockpit
    setCurrentPage('god-mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    if (firebaseUser) {
      await firebaseSignOut();
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('beecarbonat_user');
    } catch {
      // ignore
    }
  };

  // Advertising & Campaign Shopping Cart State
  const [adCartItems, setAdCartItems] = useState<AdCartItem[]>([
    {
      id: 'cart-item-1',
      pack: initialAdPacks[0], // BeeCarbonIt Social 1080x1080
      budgetPerDay: 70,
      durationDays: 7,
      selectedPlatforms: ['Instagram', 'Facebook', 'LinkedIn'],
      targetAudience: 'Directeurs RSE & CleanTech',
      subtotal: 490
    },
    {
      id: 'cart-item-2',
      pack: initialAdPacks[3], // REZIDET 30% Savings ROI
      budgetPerDay: 82,
      durationDays: 7,
      selectedPlatforms: ['LinkedIn', 'Google Ads'],
      targetAudience: 'Directeurs Immobiliers & CFO',
      subtotal: 580
    }
  ]);

  const handleNavigate = (page: NavigationPage | string) => {
    if (page === 'pricing') {
      setTrialModalOpen(true);
    }
    setCurrentPage(page as NavigationPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateBiometrics = (updated: Partial<BiometricState>) => {
    setBiometrics((prev) => ({ ...prev, ...updated }));
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'fr' ? 'en' : 'fr'));
  };

  // Ad Cart Handlers
  const handleAddToCart = (pack: AdCampaignPack, options?: Partial<AdCartItem>) => {
    const newItem: AdCartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      pack,
      budgetPerDay: options?.budgetPerDay || Math.round(pack.priceBase / 7),
      durationDays: options?.durationDays || 7,
      selectedPlatforms: options?.selectedPlatforms || pack.platforms.slice(0, 3),
      targetAudience: options?.targetAudience || pack.recommendedAudiences[0] || 'Décideurs B2B',
      subtotal: pack.priceBase,
      ...options
    };
    setAdCartItems((prev) => [newItem, ...prev]);
    setCartDrawerOpen(true);
  };

  const handleUpdateCartItem = (id: string, updates: Partial<AdCartItem>) => {
    setAdCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        updated.subtotal = updated.budgetPerDay * updated.durationDays;
        return updated;
      })
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setAdCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setAdCartItems([]);
  };

  const dashboardPages = [
    'workspace', 'spaceflow', 'mission-control', 'god-mode', 
    'grafana', 'diagnostics',
    'lighting', 'water', 'waste', 'assets', 'scanner', 'qr-generator', 'spaces', 'work-orders', 'maintenance', 'market', 'air-quality', 'impact',
    'team-ops', 'intervenants', 'env-impact', 'esg-copilot', 'bim-3d', 'digital-twin', 'predictive-ai', 'occupants-care',
    'bee-roots', 'success-stories', 'careers', 'partner-portal', 'cmms-beecarbonat', 'erp-integration', 'google-sheets',
    'analytics-dashboard', 'genai-assistant', 'security-access', 'api-keys', 'system-config', 'pwa-manifest'
  ];
  const beeCarbonatPages = [
    'threat-matrix', 'sustainability-matrix', 'neural-engine', 'energy-nexus', 'fleet-command', 'database-monitor',
    'predictive-core', 'traffic-hub', 'cloud-pulse', 'audit-vault', 'pricing'
  ];
  const isDashboardPage = dashboardPages.includes(currentPage);
  const isBeeCarbonatPage = beeCarbonatPages.includes(currentPage);

  useEffect(() => {
    // If not logged in and trying to access a dashboard page, redirect to pricing
    if (!firebaseUser && (isDashboardPage || isBeeCarbonatPage) && currentPage !== 'pricing') {
      setCurrentPage('pricing');
    }
  }, [firebaseUser, isDashboardPage, isBeeCarbonatPage, currentPage]);

  const renderContent = () => (
    <React.Suspense fallback={
      <div className="flex items-center justify-center p-16 text-center text-amber-500 font-mono text-sm">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
        Chargement du module...
      </div>
    }>
      {currentPage === 'home' && (
        <HomePage
          onNavigate={handleNavigate}
          onOpenTrial={() => handleNavigate("pricing")}
          biometrics={biometrics}
          lang={lang}
        />
      )}

      {currentPage === 'features' && (
        <FeaturesPage
          onNavigate={handleNavigate}
          onOpenTrial={() => handleNavigate("pricing")}
          lang={lang}
        />
      )}

      {currentPage === 'solutions-vitalai' && (
        <SolutionsVitalAIPage
          onNavigate={handleNavigate}
          onOpenTrial={() => handleNavigate("pricing")}
          biometrics={biometrics}
          onUpdateBiometrics={handleUpdateBiometrics}
          lang={lang}
        />
      )}

      {currentPage === 'solutions-inboxai' && (
        <SolutionsInboxAIPage
          onNavigate={handleNavigate}
          onOpenTrial={() => handleNavigate("pricing")}
          lang={lang}
        />
      )}

      {currentPage === 'solutions-meetai' && (
        <SolutionsMeetAIPage
          onNavigate={handleNavigate}
          onOpenTrial={() => handleNavigate("pricing")}
          lang={lang}
        />
      )}

      {currentPage === 'solutions-more' && (
        <SolutionsMorePage
          onNavigate={handleNavigate}
          onOpenTrial={() => handleNavigate("pricing")}
          lang={lang}
        />
      )}

      {currentPage === 'beecarbonat-pub' && (
        <AdStudioPage
          onAddToCart={handleAddToCart}
          onOpenCart={() => setCartDrawerOpen(true)}
          cartItems={adCartItems}
          lang={lang}
        />
      )}

      {currentPage === 'integrations' && (
        <IntegrationsPage
          onNavigate={handleNavigate}
          onOpenTrial={() => handleNavigate("pricing")}
          lang={lang}
        />
      )}

      {currentPage === 'pricing' && (
        <PricingPage
          onNavigate={handleNavigate}
          onOpenTrial={() => handleNavigate("pricing")}
          lang={lang}
        />
      )}

      {currentPage === 'customers' && (
        <CustomersPage
          onNavigate={handleNavigate}
          onOpenTrial={() => handleNavigate("pricing")}
          lang={lang}
        />
      )}

      {currentPage === 'workspace' && (
        <SpaceFlowExecutiveDashboard
          onNavigate={handleNavigate}
          lang={lang}
          isLightMode={dashboardIsLight}
          dashboardMode={dashboardMode}
        />
      )}

      {currentPage === 'spaceflow' && (
        <SpaceFlowExecutiveDashboard
          onNavigate={handleNavigate}
          lang={lang}
          isLightMode={dashboardIsLight}
          dashboardMode={dashboardMode}
        />
      )}

      {currentPage === 'mission-control' && (
        <MissionControlDashboard
          lang={lang}
          onNavigate={handleNavigate}
          onOpenGodMode={() => handleNavigate('god-mode')}
        />
      )}

      {currentPage === 'grafana' && (
        <div className="py-2">
          <GrafanaCockpit
            lang={lang}
            isLightMode={dashboardIsLight}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      {currentPage === 'diagnostics' && (
        <div className="py-2">
          <RubricsInspector
            lang={lang}
            isLightMode={dashboardIsLight}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      {currentPage === 'god-mode' && (
        <GodModeSystemView
          lang={lang}
          onNavigate={handleNavigate}
          onOpenMissionControl={() => handleNavigate('mission-control')}
        />
      )}

      {currentPage === 'threat-matrix' && (
        <SecurityThreatMatrix onNavigate={handleNavigate} />
      )}

      {currentPage === 'sustainability-matrix' && (
        <SustainabilityMatrix onNavigate={handleNavigate} />
      )}

      {currentPage === 'neural-engine' && (
        <NeuralEngineArchitect onNavigate={handleNavigate} />
      )}

      {currentPage === 'energy-nexus' && (
        <GlobalEnergyNexus onNavigate={handleNavigate} />
      )}

      {currentPage === 'fleet-command' && (
        <GlobalFleetCommand onNavigate={handleNavigate} />
      )}

      {currentPage === 'database-monitor' && (
        <DatabaseCacheMonitor onNavigate={handleNavigate} />
      )}

      {currentPage === 'predictive-core' && (
        <PredictiveCoreAnalysis onNavigate={handleNavigate} />
      )}

      {currentPage === 'traffic-hub' && (
        <ApiGatewayTrafficHub onNavigate={handleNavigate} />
      )}

      {currentPage === 'cloud-pulse' && (
        <MultiCloudInfrastructure onNavigate={handleNavigate} />
      )}

      {currentPage === 'audit-vault' && (
        <ImmutableAuditVault onNavigate={handleNavigate} />
      )}

      {currentPage === 'privacy' && (
        <PrivacyPage
          onNavigate={handleNavigate}
          lang={lang}
        />
      )}

      {currentPage === 'terms' && (
        <TermsPage
          onNavigate={handleNavigate}
          lang={lang}
        />
      )}

      {currentPage === 'security' && (
        <SecurityPage
          onNavigate={handleNavigate}
          lang={lang}
        />
      )}

      {/* CAFM & CMMS Integrations */}
      {currentPage === 'lighting' && (
        <div className="py-4">
          <LightingCityPulse lang={lang} />
        </div>
      )}

      {currentPage === 'water' && (
        <div className="py-4">
          <WaterHydroSync lang={lang} />
        </div>
      )}

      {currentPage === 'air-quality' && (
        <div className="py-4">
          <AirQuality lang={lang} />
        </div>
      )}

      {currentPage === 'waste' && (
        <div className="py-4">
          <EsgSuite />
        </div>
      )}

      {currentPage === 'assets' && (
        <div className="py-4">
          <AssetsManager 
            onInspectAsset={(asset) => {
              setSelectedAsset(asset);
              setAssetModalOpen(true);
            }}
            onOpenQrTag={(asset) => {
              setSelectedAsset(asset);
              setAssetModalOpen(true);
            }}
            onCreateTicketForAsset={(asset) => {
              setPreselectedAssetForWO(asset);
              setWorkOrderModalOpen(true);
            }}
          />
        </div>
      )}

      {currentPage === 'scanner' && (
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 backdrop-blur-md relative overflow-hidden py-4 max-w-4xl mx-auto w-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent pointer-events-none" />
          <h2 className="text-xl font-bold mb-2 font-mono text-orange-500 flex items-center gap-2">
            <span className="material-symbols-outlined">contactless</span>
            {lang === 'fr' ? 'Lecteur NFC Sans Contact & Scanner QR' : 'Contactless NFC & QR Tag Scanner'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
            {lang === 'fr' 
              ? "Approchez votre smartphone d'un tag NFC apposé sur un équipement physique (CVC, Pompe, Disjoncteur) ou utilisez la caméra pour déclencher instantanément le flux d'identification, vérifier son intégrité cryptographique et planifier une intervention."
              : "Tap your smartphone on an NFC tag on technical equipment (HVAC, Heat Pumps, Panels) or use the camera to instantly identify the asset, verify cryptographic ledger integrity, and dispatch maintenance."}
          </p>
          <div className="max-w-xl mx-auto w-full">
            <QrScannerModal
              isOpen={true}
              isInline={true}
              onClose={() => handleNavigate('workspace')}
              onAssetScanned={(asset) => {
                setSelectedAsset(asset);
                setAssetModalOpen(true);
              }}
              onCreateTicket={(asset) => {
                setPreselectedAssetForWO(asset);
                setWorkOrderModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {currentPage === 'qr-generator' && (
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 backdrop-blur-md relative overflow-hidden py-4 max-w-6xl mx-auto w-full">
          <div className="absolute inset-0 bg-gradient-to-tl from-red-500/10 to-transparent pointer-events-none" />
          <h2 className="text-xl font-bold mb-2 font-mono text-red-500 flex items-center gap-2 relative z-10">
            <span className="material-symbols-outlined">qr_code_2</span>
            {lang === 'fr' ? 'Générateur de QR Codes Réclamations' : 'Complaint QR Code Generator'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 relative z-10">
            {lang === 'fr' 
              ? "Générez et téléchargez des QR codes d'alerte à imprimer et apposer sur vos équipements ou espaces. Lorsqu'ils sont scannés par un occupant, ils ouvrent directement le formulaire de signalement associé."
              : "Generate and download alert QR codes to print and stick on your assets or spaces. When scanned by an occupant, they directly open the associated issue reporting form."}
          </p>
          <div className="relative z-10 h-full">
            <ComplaintQrGenerator lang={lang} />
          </div>
        </div>
      )}

      {currentPage === 'spaces' && (
        <div className="py-4">
          <SpacesManager lang={lang} />
        </div>
      )}

      {currentPage === 'work-orders' && (
        <div className="py-4">
          <WorkOrdersManager
            onOpenCreateModal={() => {
              setPreselectedAssetForWO(null);
              setWorkOrderModalOpen(true);
            }}
            lang={lang}
          />
        </div>
      )}

      {currentPage === 'maintenance' && (
        <div className="py-4">
          <PredictiveMaintenance
            lang={lang}
            onSelectAsset={(assetId) => {
              // Handle selective asset highlight
            }}
            openNewTicketModal={() => {
              setPreselectedAssetForWO(null);
              setWorkOrderModalOpen(true);
            }}
          />
        </div>
      )}

      {currentPage === 'market' && (
        <div className="py-4">
          <CarbonMarket lang={lang} />
        </div>
      )}

      {currentPage === 'impact' && (
        <div className="py-4">
          <EsgSuite />
        </div>
      )}

      {currentPage === "intervenants" && (
        <div className="py-4">
          <IntervenantsPanel lang={lang} isLightMode={dashboardIsLight} />
        </div>
      )}

      {currentPage === 'team-ops' && (
        <div className="py-4">
          <TeamOperationsPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'env-impact' && (
        <div className="py-4">
          <EnvImpactPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'esg-copilot' && (
        <div className="py-4">
          <EsgCopilotPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'bim-3d' && (
        <div className="py-4">
          <DigitalTwinViewer 
            isLightMode={dashboardIsLight} 
            onOpenTicket={(assetId) => {
              if (assetId) {
                api.getAssets().then(assets => {
                  const found = assets.find(a => a.id === assetId || a.code === assetId);
                  if (found) setPreselectedAssetForWO(found);
                });
              }
              setWorkOrderModalOpen(true);
            }}
            onInspectAsset={(assetId) => {
              api.getAssets().then(assets => {
                const found = assets.find(a => a.id === assetId || a.code === assetId);
                if (found) {
                  setSelectedAsset(found);
                  setAssetModalOpen(true);
                }
              });
            }}
          />
        </div>
      )}

      {currentPage === 'digital-twin' && (
        <div className="py-4">
          <DigitalTwinViewer 
            isLightMode={dashboardIsLight} 
            onOpenTicket={(assetId) => {
              if (assetId) {
                api.getAssets().then(assets => {
                  const found = assets.find(a => a.id === assetId || a.code === assetId);
                  if (found) setPreselectedAssetForWO(found);
                });
              }
              setWorkOrderModalOpen(true);
            }}
            onInspectAsset={(assetId) => {
              api.getAssets().then(assets => {
                const found = assets.find(a => a.id === assetId || a.code === assetId);
                if (found) {
                  setSelectedAsset(found);
                  setAssetModalOpen(true);
                }
              });
            }}
          />
        </div>
      )}

      {currentPage === 'predictive-ai' && (
        <div className="py-4">
          <PredictiveAiPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'occupants-care' && (
        <div className="py-4">
          <OccupantsCarePanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'bee-roots' && (
        <div className="py-4">
          <BeeRootsPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'success-stories' && (
        <div className="py-4">
          <SuccessStoriesPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'careers' && (
        <div className="py-4">
          <CareersPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'partner-portal' && (
        <div className="py-4">
          <PartnerPortalPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'cmms-beecarbonat' && (
        <div className="py-4">
          <CmmsCockpitPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'erp-integration' && (
        <div className="py-4">
          <ErpIntegrationPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'google-sheets' && (
        <div className="py-4">
          <GoogleSheetsPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'analytics-dashboard' && (
        <div className="py-4">
          <AnalyticsPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'genai-assistant' && (
        <div className="py-4">
          <GenAiAssistantPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'security-access' && (
        <div className="py-4">
          <SecurityAccessPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'api-keys' && (
        <div className="py-4">
          <ApiKeyManager lang={lang} isLightMode={dashboardIsLight} onNavigateTab={handleNavigate} />
        </div>
      )}

      {currentPage === 'system-config' && (
        <div className="py-4">
          <SystemConfigPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'pwa-manifest' && (
        <div className="py-4">
          <PwaManifestPanel lang={lang} isLightMode={dashboardIsLight} onNavigate={handleNavigate} />
        </div>
      )}
    </React.Suspense>
  );

  return (
    <>
      {currentPage === 'home' ? (
        <HomePage
          onNavigate={handleNavigate}
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenTrial={() => handleNavigate("pricing")}
          onOpenCart={() => setCartDrawerOpen(true)}
          cartCount={adCartItems.length}
          biometrics={biometrics}
          currentUser={currentUser}
          onLogout={handleLogout}
          lang={lang}
          onToggleLang={handleToggleLang}
        />
      ) : isBeeCarbonatPage ? (
        <TelemetryProvider>
          <div className="w-full min-h-screen bg-white dark:bg-slate-950">
            <PlanGate feature={currentPage} onNavigate={handleNavigate} lang={lang}>{renderContent()}</PlanGate>
          </div>
        </TelemetryProvider>
      ) : isDashboardPage ? (
        <DashboardLayout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          lang={lang}
          isLightMode={dashboardIsLight}
          onToggleLightMode={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          dashboardMode={dashboardMode}
          onChangeDashboardMode={setDashboardMode}
          currentUser={currentUser}
          onUpdateUserRole={handleUpdateUserRole}
        >
          <PlanGate feature={currentPage} onNavigate={handleNavigate} lang={lang}>{renderContent()}</PlanGate>
        </DashboardLayout>
      ) : (
        <PublicLayout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          lang={lang}
          onToggleLang={handleToggleLang}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenTrial={() => handleNavigate("pricing")}
          biometrics={biometrics}
          cartCount={adCartItems.length}
          onOpenCart={() => setCartDrawerOpen(true)}
        >
          <PlanGate feature={currentPage} onNavigate={handleNavigate} lang={lang}>{renderContent()}</PlanGate>
        </PublicLayout>
      )}

      {/* Ad Shopping Cart Drawer */}
      <AdCartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={adCartItems}
        onRemoveItem={handleRemoveCartItem}
        onUpdateItem={handleUpdateCartItem}
        onClearCart={handleClearCart}
        onOpenAdStudio={() => handleNavigate('beecarbonat-pub')}
        lang={lang}
      />

      {/* Auth / Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        onOpenTrial={() => {
          setLoginModalOpen(false);
          handleNavigate("pricing");
        }}
        lang={lang}
      />

      {/* Trial / Onboarding Modal */}
      <TrialModal 
        isOpen={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        onSuccess={() => {
          setTrialModalOpen(false);
          setCurrentPage('workspace');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lang={lang}
      />

      {/* CAFM & CMMS Detail Modals */}
      <AssetDetailModal
        isOpen={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        asset={selectedAsset}
        lang={lang}
        onCreateTicket={(asset) => {
          setAssetModalOpen(false);
          setPreselectedAssetForWO(asset);
          setWorkOrderModalOpen(true);
        }}
      />

      <WorkOrderModal
        isOpen={workOrderModalOpen}
        onClose={() => setWorkOrderModalOpen(false)}
        preselectedAsset={preselectedAssetForWO}
        lang={lang}
        onSubmit={(newOrder) => {
          api.createWorkOrder(newOrder as any);
          setWorkOrderModalOpen(false);
          setPreselectedAssetForWO(null);
        }}
      />
    </>
  );
}

export default App;
