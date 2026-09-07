import React, { createContext, useContext, useEffect, useState } from 'react';

export type FontFamily = 'Plus Jakarta Sans' | 'Inter' | 'JetBrains Mono' | 'Fira Code' | 'System UI';
export type AccentColor = 'orange' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose' | 'blue';
export type UiDensity = 'compact' | 'normal' | 'spacious';
export type BorderRadius = 'rounded-none' | 'rounded-sm' | 'rounded-lg' | 'rounded-2xl' | 'rounded-3xl';
export type AudioVolume = 'muted' | 'low' | 'high';
export type CurrencyFormat = 'EUR' | 'USD' | 'MAD' | 'GBP';

export interface ServiceModuleConfig {
  cafmAssets: boolean;
  esgCarbon: boolean;
  genAiCopilot: boolean;
  bimDigitalTwin: boolean;
  predictiveIot: boolean;
  nfcQrScanner: boolean;
  erpIntegration: boolean;
  googleSheetsSync: boolean;
  auditTrail: boolean;
  offlineCache: boolean;
}

export interface SystemSettings {
  // Theme & Appearance
  theme: 'dark' | 'light' | 'system';
  accentColor: AccentColor;
  fontFamily: FontFamily;
  monoFontFamily: 'JetBrains Mono' | 'Fira Code' | 'Courier New';
  uiDensity: UiDensity;
  borderRadius: BorderRadius;
  highContrast: boolean;
  enableAnimations: boolean;
  enableGlowEffects: boolean;

  // Services & Modules
  services: ServiceModuleConfig;

  // Telemetry & Network
  mqttEndpoint: string;
  telemetryIntervalMs: number;
  autoSaveIntervalMins: number;
  offlineSyncMode: 'auto' | 'manual' | 'wifi-only';

  // Notifications & Sound
  soundEffects: boolean;
  hapticFeedback: boolean;
  pushNotifications: boolean;
  alertSeverityThreshold: 'all' | 'warning' | 'critical';

  // Localization & Regional
  language: 'fr' | 'en';
  currency: CurrencyFormat;
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  timezone: string;
}

export const defaultSettings: SystemSettings = {
  theme: 'dark',
  accentColor: 'orange',
  fontFamily: 'Plus Jakarta Sans',
  monoFontFamily: 'JetBrains Mono',
  uiDensity: 'normal',
  borderRadius: 'rounded-2xl',
  highContrast: false,
  enableAnimations: true,
  enableGlowEffects: true,

  services: {
    cafmAssets: true,
    esgCarbon: true,
    genAiCopilot: true,
    bimDigitalTwin: true,
    predictiveIot: true,
    nfcQrScanner: true,
    erpIntegration: true,
    googleSheetsSync: true,
    auditTrail: true,
    offlineCache: true,
  },

  mqttEndpoint: 'mqtts://mesh-telemetry.beecarbonat.internal:8883',
  telemetryIntervalMs: 1000,
  autoSaveIntervalMins: 5,
  offlineSyncMode: 'auto',

  soundEffects: true,
  hapticFeedback: true,
  pushNotifications: true,
  alertSeverityThreshold: 'warning',

  language: 'fr',
  currency: 'EUR',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Europe/Paris',
};

const STORAGE_KEY = 'beecarbonat-system-settings';

interface AppConfigContextType {
  settings: SystemSettings;
  updateSetting: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => void;
  updateService: (serviceKey: keyof ServiceModuleConfig, enabled: boolean) => void;
  resetToDefaults: () => void;
  accentClasses: {
    text: string;
    bg: string;
    border: string;
    hoverBg: string;
    badge: string;
    gradient: string;
  };
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
    }
    return defaultSettings;
  });

  // Apply visual font and root properties on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }

    const root = document.documentElement;

    // Apply Font Family
    if (settings.fontFamily === 'System UI') {
      root.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    } else {
      root.style.fontFamily = `"${settings.fontFamily}", sans-serif`;
    }

    // Apply UI Density scale
    if (settings.uiDensity === 'compact') {
      root.style.fontSize = '14.5px';
    } else if (settings.uiDensity === 'spacious') {
      root.style.fontSize = '17px';
    } else {
      root.style.fontSize = '16px';
    }

    // High Contrast attribute
    if (settings.highContrast) {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }

    // Glow effects
    if (!settings.enableGlowEffects) {
      root.classList.add('no-glow');
    } else {
      root.classList.remove('no-glow');
    }
  }, [settings]);

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateService = (serviceKey: keyof ServiceModuleConfig, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [serviceKey]: enabled,
      },
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Accent color presets
  const getAccentClasses = (color: AccentColor) => {
    switch (color) {
      case 'emerald':
        return {
          text: 'text-emerald-500',
          bg: 'bg-emerald-500',
          border: 'border-emerald-500',
          hoverBg: 'hover:bg-emerald-600',
          badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          gradient: 'from-emerald-500 to-teal-600',
        };
      case 'cyan':
        return {
          text: 'text-cyan-500',
          bg: 'bg-cyan-500',
          border: 'border-cyan-500',
          hoverBg: 'hover:bg-cyan-600',
          badge: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
          gradient: 'from-cyan-500 to-blue-600',
        };
      case 'purple':
        return {
          text: 'text-purple-500',
          bg: 'bg-purple-500',
          border: 'border-purple-500',
          hoverBg: 'hover:bg-purple-600',
          badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          gradient: 'from-purple-500 to-indigo-600',
        };
      case 'amber':
        return {
          text: 'text-amber-500',
          bg: 'bg-amber-500',
          border: 'border-amber-500',
          hoverBg: 'hover:bg-amber-600',
          badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          gradient: 'from-amber-500 to-yellow-600',
        };
      case 'rose':
        return {
          text: 'text-rose-500',
          bg: 'bg-rose-500',
          border: 'border-rose-500',
          hoverBg: 'hover:bg-rose-600',
          badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
          gradient: 'from-rose-500 to-pink-600',
        };
      case 'blue':
        return {
          text: 'text-blue-500',
          bg: 'bg-blue-500',
          border: 'border-blue-500',
          hoverBg: 'hover:bg-blue-600',
          badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          gradient: 'from-blue-500 to-indigo-600',
        };
      case 'orange':
      default:
        return {
          text: 'text-orange-500',
          bg: 'bg-orange-500',
          border: 'border-orange-500',
          hoverBg: 'hover:bg-orange-600',
          badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
          gradient: 'from-orange-500 to-amber-600',
        };
    }
  };

  return (
    <AppConfigContext.Provider
      value={{
        settings,
        updateSetting,
        updateService,
        resetToDefaults,
        accentClasses: getAccentClasses(settings.accentColor),
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};
