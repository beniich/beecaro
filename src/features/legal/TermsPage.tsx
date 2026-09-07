import React, { useState } from 'react';
import { NavigationPage } from '../../types/bizos';

interface TermsPageProps {
  onNavigate: (page: NavigationPage) => void;
  lang?: 'fr' | 'en';
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate, lang = 'fr' }) => {
  const [activeSection, setActiveSection] = useState('sec-1');

  const tocItems = [
    { id: 'sec-1', number: '1.', label: lang === 'fr' ? 'Introduction' : 'Introduction' },
    { id: 'sec-2', number: '2.', label: lang === 'fr' ? 'Accords Utilisateur' : 'User Agreements' },
    { id: 'sec-3', number: '3.', label: lang === 'fr' ? 'Confidentialité des Données' : 'Data Privacy' },
    { id: 'sec-4', number: '4.', label: lang === 'fr' ? 'Propriété Intellectuelle' : 'Intellectual Property' },
    { id: 'sec-5', number: '5.', label: lang === 'fr' ? 'Limitation de Responsabilité' : 'Limitation of Liability' },
    { id: 'sec-6', number: '6.', label: lang === 'fr' ? 'Résiliation & Droits Permanents' : 'Termination' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#100c1e] text-[#e8defb] pt-8 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-12 left-1/3 w-[600px] h-[300px] bg-[#ff9d2b]/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-[1280px] mx-auto relative z-10">
        
        {/* Breadcrumb / Badge */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241a38] border border-[#ff9d2b]/30 text-xs font-mono text-[#ffc06e]">
            <span>LEGAL FRAMEWORK</span>
            <span>•</span>
            <span>DATE D'EFFET : 26 AOÛT 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sticky Table of Contents Card (As seen in the screenshot) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="rounded-2xl bg-[#171129]/90 border border-[#ff9d2b]/35 p-6 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(255,157,43,0.12)]">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffb04f] to-[#ffc06e] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#ffb04f]">menu_book</span>
                <span>Table of Contents</span>
              </h3>

              <nav className="space-y-2">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 ${
                      activeSection === item.id
                        ? 'bg-[#ff9d2b]/20 text-[#ffc06e] border border-[#ff9d2b]/40 font-bold shadow-[0_0_12px_rgba(255,157,43,0.2)]'
                        : 'text-[#cdc3d0] hover:text-white hover:bg-[#251b3d]'
                    }`}
                  >
                    <span className="font-mono text-[#ffb04f] font-bold text-xs">{item.number}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-[#2d2247] space-y-3">
                <div className="text-[11px] text-[#968e9a]">
                  Besoin d'un contrat cadre sur mesure pour entreprise ?
                </div>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="w-full py-2 px-3 rounded-xl bg-[#251b3d] hover:bg-[#322452] border border-[#ff9d2b]/30 text-xs font-bold text-[#ffc06e] transition-colors"
                >
                  Contacter l'Équipe Enterprise →
                </button>
              </div>
            </div>
          </div>

          {/* Right Main Agreement Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Title Block */}
            <div className="rounded-2xl bg-[#171129]/60 border border-[#ff9d2b]/25 p-6 sm:p-8 backdrop-blur-xl">
              <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffb04f] via-[#ffc06e] to-[#ff9d2b] tracking-tight drop-shadow-[0_0_20px_rgba(255,157,43,0.3)] mb-4">
                Terms of Service Agreement
              </h1>
              <p className="text-xs sm:text-sm text-[#cdc3d0] leading-relaxed">
                {lang === 'fr'
                  ? "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme beecarbonat (BeeCarbonIt Platform), de ses services cloud, API de télémétrie, modules d'IA décisionnelle et des droits permanents afférents aux journaux numériques (Digital Newspapers)."
                  : "This Terms of Service Agreement governs your access to and use of the beecarbonat platform (BeeCarbonIt Platform), its sovereign cloud services, telemetry APIs, AI copilot modules, and permanent non-subscription rights attached to downloadable Digital Newspapers."}
              </p>
            </div>

            {/* Section 1: Introduction */}
            <div id="sec-1" className="scroll-mt-28 rounded-2xl bg-[#171129]/80 border border-[#ff9d2b]/25 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
              <h2 className="text-xl font-black text-[#ffb04f] mb-4 flex items-center gap-2">
                <span>1. Introduction</span>
              </h2>
              <div className="text-xs sm:text-sm text-[#cdc3d0] space-y-3 leading-relaxed">
                <p>
                  En créant un compte ou en déployant les passerelles logicielles beecarbonat sur vos infrastructures (bâtiments, capteurs IoT, serveurs ou flux d'entreprise), vous acceptez sans réserve l'intégralité des termes et stipulations décrits ci-après.
                </p>
                <p>
                  beecarbonat fournit une suite d'orchestration unifiée associant mesure de décarbonation, GMAO intelligente, synchronisation cognitive et traitement prédictif en temps réel.
                </p>
              </div>
            </div>

            {/* Section 2: User Agreements */}
            <div id="sec-2" className="scroll-mt-28 rounded-2xl bg-[#171129]/80 border border-[#ff9d2b]/25 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
              <h2 className="text-xl font-black text-[#ffb04f] mb-4 flex items-center gap-2">
                <span>2. User Agreements & SLA</span>
              </h2>
              <div className="text-xs sm:text-sm text-[#cdc3d0] space-y-3 leading-relaxed">
                <p>
                  L'utilisateur s'engage à utiliser la plateforme conformément aux lois en vigueur, sans porter atteinte à l'intégrité des passerelles réseau BACnet/Modbus ou des clusters d'inférence sécurisés.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#e8defb] pl-2">
                  <li><strong>Disponibilité Garantie (SLA) :</strong> 99.98% de temps de fonctionnement pour les forfaits pro.bee et business.bee.</li>
                  <li><strong>Comptes & Responsabilité :</strong> L'administrateur de l'organisation est garant de la confidentialité des identifiants d'accès et des clés API attribuées.</li>
                  <li><strong>Intégrité des Données Énergétiques :</strong> Les flux de capteurs ne doivent pas être volontairement falsifiés lors des soumissions d'audits réglementaires.</li>
                </ul>
              </div>
            </div>

            {/* Section 3: Data Privacy */}
            <div id="sec-3" className="scroll-mt-28 rounded-2xl bg-[#171129]/80 border border-[#ff9d2b]/25 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
              <h2 className="text-xl font-black text-[#ffb04f] mb-4 flex items-center gap-2">
                <span>3. Data Privacy & Security Enclave</span>
              </h2>
              <div className="text-xs sm:text-sm text-[#cdc3d0] space-y-3 leading-relaxed">
                <p>
                  Toutes les données traitées au sein de l'environnement beecarbonat sont isolées dans une enclave souveraine chiffrée de bout en bout (Zero-Knowledge Architecture).
                </p>
                <p>
                  Les flux de données ne sont jamais partagés avec des tiers non autorisés, ni utilisés pour entraîner des modèles de langage ouverts sans accord formel de gouvernance d'entreprise.
                </p>
              </div>
            </div>

            {/* Section 4: Intellectual Property */}
            <div id="sec-4" className="scroll-mt-28 rounded-2xl bg-[#171129]/80 border border-[#ff9d2b]/25 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
              <h2 className="text-xl font-black text-[#ffb04f] mb-4 flex items-center gap-2">
                <span>4. Intellectual Property & Permanent Rights</span>
              </h2>
              <div className="text-xs sm:text-sm text-[#cdc3d0] space-y-3 leading-relaxed">
                <p>
                  Tous les algorithmes prédictifs, interfaces graphiques, marques et composants .bee OS demeurent la propriété exclusive de beecarbonat.
                </p>
                <div className="p-3.5 rounded-xl bg-[#ff9d2b]/10 border border-[#ff9d2b]/30 text-xs text-[#ffc06e]">
                  <strong>Clause de Droits Permanents (Permanent Rights) :</strong> Les journaux numériques téléchargés (Digital Newspapers - downloadable - non subscription) bénéficient d'une licence d'archivage perpétuelle non révocable et sans frais récurrents.
                </div>
              </div>
            </div>

            {/* Section 5: Limitation of Liability */}
            <div id="sec-5" className="scroll-mt-28 rounded-2xl bg-[#171129]/80 border border-[#ff9d2b]/25 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
              <h2 className="text-xl font-black text-[#ffb04f] mb-4 flex items-center gap-2">
                <span>5. Limitation of Liability</span>
              </h2>
              <div className="text-xs sm:text-sm text-[#cdc3d0] space-y-3 leading-relaxed">
                <p>
                  beecarbonat met en œuvre les meilleurs standards techniques pour garantir l'exactitude des calculs prédictifs et des bilans carbone. Notre responsabilité financière totale est plafonnée aux montants effectivement acquittés au titre de l'abonnement durant les 12 mois précédant le sinistre.
                </p>
              </div>
            </div>

            {/* Section 6: Termination */}
            <div id="sec-6" className="scroll-mt-28 rounded-2xl bg-[#171129]/80 border border-[#ff9d2b]/25 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
              <h2 className="text-xl font-black text-[#ffb04f] mb-4 flex items-center gap-2">
                <span>6. Termination & Export Sovereignty</span>
              </h2>
              <div className="text-xs sm:text-sm text-[#cdc3d0] space-y-3 leading-relaxed">
                <p>
                  Chaque partie peut résilier l'abonnement mensuel ou annuel à son échéance sans pénalité. L'organisation dispose d'un délai garanti de 30 jours pour exporter la totalité de ses données et historiques en format ouvert et interopérable (JSON, CSV, Parquet).
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-[#2d2247]">
              <button
                onClick={() => onNavigate('home')}
                className="px-5 py-2.5 rounded-full text-xs font-bold font-mono text-[#cdc3d0] bg-[#1c152e] hover:bg-[#281f3e] border border-[#3c305c] transition-colors"
              >
                ← {lang === 'fr' ? 'Retour Accueil' : 'Back Home'}
              </button>
              <button
                onClick={() => onNavigate('privacy')}
                className="px-5 py-2.5 rounded-full text-xs font-bold font-mono text-[#ffc06e] bg-[#2a1d40] hover:bg-[#382656] border border-[#ff9d2b]/40 transition-colors"
              >
                {lang === 'fr' ? 'Voir Politique de Confidentialité →' : 'View Privacy Policy →'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
