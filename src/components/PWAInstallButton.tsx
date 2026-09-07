import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC<{ lang?: 'fr' | 'en' }> = ({ lang = 'fr' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-500 transition"
      >
        <Download className="w-3.5 h-3.5" />
        {lang === 'fr' ? 'Installer l\'App' : 'Install App'}
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-500 transition"
        >
          <Download className="w-3.5 h-3.5" />
          {lang === 'fr' ? 'Installer l\'App' : 'Install on iOS'}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Installer sur iPhone / iPad' : 'Install on iPhone / iPad'}
              </h3>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                1. {lang === 'fr' ? 'Appuyez sur le bouton' : 'Tap the'} <strong>{lang === 'fr' ? 'Partager' : 'Share'}</strong> {lang === 'fr' ? 'dans la barre Safari.' : 'button in Safari toolbar.'}<br />
                2. {lang === 'fr' ? 'Faites défiler et appuyez sur' : 'Scroll down and tap'} <strong>{lang === 'fr' ? 'Sur l\'écran d\'accueil' : 'Add to Home Screen'}</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                {lang === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
