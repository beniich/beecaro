import React from 'react';
import { NavigationPage } from '../types/bizos';
import { BeeLogo } from './BeeLogo';

interface FooterProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTrial?: () => void;
  lang?: 'fr' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTrial, lang = 'fr' }) => {
  return (
    <footer className="w-full bg-[#100b1f] border-t border-[#ecd7ff]/10 py-16 px-4 md:px-12 mt-20 relative overflow-hidden">
      {/* Subtle background ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ecd7ff]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ffb2bb]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#2c273c]">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
              <BeeLogo size="md" showText={true} tagline="Cognitive OS & Sustainable Intelligence" />
            </div>
            <p className="text-sm text-[#cdc3d0] max-w-sm leading-relaxed">
              {lang === 'fr' 
                ? "beecarbonat — L'OS unifié pour les fondateurs modernes et les organisations à haute intensité. Synchronisez vos performances avec vos états physiologiques et l'écosystème .bee."
                : "beecarbonat — The unified operating system for modern founders and high-intensity organizations. Synchronizing performance with physiological states and the .bee ecosystem."}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#221c31] border border-[#ecd7ff]/15 text-[#ecd7ff]">
                <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
                SOC2 Type II & HIPAA Ready
              </span>
            </div>
          </div>

          {/* Solutions Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#ecd7ff] mb-4 font-mono">
              {lang === 'fr' ? 'Écosystème' : 'Ecosystem'}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#cdc3d0]">
              <li>
                <button onClick={() => onNavigate('solutions-vitalai')} className="hover:text-[#ecd7ff] transition-colors">
                  VitalAI Core & Bio-Sync
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions-inboxai')} className="hover:text-[#ffb2bb] transition-colors">
                  InboxAI Email Copilot
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions-meetai')} className="hover:text-[#ecd7ff] transition-colors">
                  MeetAI Transcription & Action
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions-callcopilot')} className="hover:text-[#e1daff] transition-colors">
                  CallCopilot (Investor Sentiment)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions-callcopilot')} className="hover:text-[#ecd7ff] transition-colors">
                  ExitReady (M&A Diligence)
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#ecd7ff] mb-4 font-mono">
              {lang === 'fr' ? 'Plateforme' : 'Platform'}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#cdc3d0]">
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-[#ecd7ff] transition-colors">
                  {lang === 'fr' ? 'Architecture Symbiotique' : 'Symbiotic Architecture'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('integrations')} className="hover:text-[#ecd7ff] transition-colors">
                  {lang === 'fr' ? 'Hub d\'Intégrations (12+)' : 'Integrations Hub (12+)'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#ecd7ff] transition-colors">
                  {lang === 'fr' ? 'Simulateur de ROI' : 'ROI & Pricing Plans'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('workspace')} className="hover:text-[#ffb2bb] transition-colors">
                  {lang === 'fr' ? 'Cockpit Démo Live' : 'Live Interactive Sandbox'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('beecarbonat-pub')} className="hover:text-[#ff8a00] text-[#ffb04f] transition-colors flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff8a00] animate-pulse"></span>
                  <span>{lang === 'fr' ? 'Studio Pub & Panier' : 'Ad Studio & Cart'}</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customers')} className="hover:text-[#ecd7ff] transition-colors">
                  {lang === 'fr' ? 'Études de Cas' : 'Case Studies & Lumina'}
                </button>
              </li>
            </ul>
          </div>

          {/* Biometrics & Wearables Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#ffb2bb] mb-4 font-mono">
              Wearable Bio-Sync
            </h4>
            <ul className="space-y-2.5 text-xs text-[#cdc3d0]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#ecd7ff]">watch</span>
                <span>Apple Watch Ultra / Series</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#ffb2bb]">vital_signs</span>
                <span>Oura Ring Gen 3 / Horizon</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#e1daff]">fitness_center</span>
                <span>Whoop 4.0 Strap</span>
              </li>
              <li className="pt-2 text-[11px] text-[#968e9a]">
                Auto-protects calendar slots when recovery is &lt; 40%.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#cdc3d0]">
          <div className="flex items-center gap-2.5">
            <BeeLogo size="sm" showText={false} />
            <span>© {new Date().getFullYear()} beecarbonat — .bee OS Intelligence Platform. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button 
              onClick={() => onNavigate('privacy')} 
              className="hover:text-[#ffc06e] transition-colors focus:outline-none"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onNavigate('terms')} 
              className="hover:text-[#ffc06e] transition-colors focus:outline-none"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => onNavigate('security')} 
              className="hover:text-[#ffc06e] transition-colors focus:outline-none"
            >
              Security Enclave
            </button>
            <button 
              onClick={() => onNavigate('features')} 
              className="hover:text-[#ecd7ff] transition-colors focus:outline-none"
            >
              Status (99.98% SLA)
            </button>
            <button 
              onClick={() => onOpenTrial ? onOpenTrial() : onNavigate('pricing')} 
              className="hover:text-[#ecd7ff] transition-colors focus:outline-none"
            >
              {lang === 'fr' ? 'Support & Contact' : 'Contact Support'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
