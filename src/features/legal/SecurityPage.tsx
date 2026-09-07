import React from 'react';
import { NavigationPage } from '../../types/bizos';

interface SecurityPageProps {
  onNavigate: (page: NavigationPage) => void;
  lang?: 'fr' | 'en';
}

export const SecurityPage: React.FC<SecurityPageProps> = ({ onNavigate, lang = 'fr' }) => {
  const compliancePillars = [
    {
      badge: 'ISO 27001 Certified',
      title: lang === 'fr' ? 'Certification ISO/IEC 27001:2022' : 'ISO/IEC 27001:2022 Certified',
      desc: lang === 'fr'
        ? "Système de Management de la Sécurité de l'Information (SMSI) audité annuellement par des tiers accrédités indépendants."
        : "Information Security Management System (ISMS) audited annually by accredited independent auditors."
    },
    {
      badge: 'SOC 2 Type II',
      title: lang === 'fr' ? 'Rapport SOC 2 Type II Annuel' : 'Annual SOC 2 Type II Report',
      desc: lang === 'fr'
        ? "Contrôles rigoureux de sécurité, de disponibilité et de confidentialité testés sur une période d'observation de 12 mois continus."
        : "Rigorous security, availability, and confidentiality controls tested continuously over 12-month observation periods."
    },
    {
      badge: 'GDPR Compliant',
      title: lang === 'fr' ? 'Conformité RGPD & Hébergement UE' : 'GDPR & EU Sovereign Data Residency',
      desc: lang === 'fr'
        ? "Enclave de données 100% souveraine basée dans l'Union Européenne (France & Allemagne), immunisée contre le Cloud Act."
        : "100% sovereign European data residency enclave (France & Germany) with strict zero-knowledge isolation."
    }
  ];

  const securityFeatures = [
    {
      icon: 'lock',
      title: lang === 'fr' ? 'Chiffrement de Bout en Bout' : 'End-to-End Encryption',
      desc: lang === 'fr'
        ? "Chiffrement AES-GCM 256-bit pour toutes les données au repos, et TLS 1.3 avec Perfect Forward Secrecy pour l'ensemble des flux réseau."
        : "Data is encrypted at rest and in transit using advanced cryptographic protocols (AES-GCM 256-bit & TLS 1.3)."
    },
    {
      icon: 'vpn_key',
      title: lang === 'fr' ? 'Architecture Zero-Knowledge' : 'Zero-Knowledge Architecture',
      desc: lang === 'fr'
        ? "Vos données restent strictement privées. Vos clés maîtresses de chiffrement sont gérées par vos HSM dédiés sans accès possible de nos opérateurs."
        : "Your data remains private; we do not have access to your encryption keys. Customer-managed keys (BYOK/HYOK)."
    },
    {
      icon: 'memory',
      title: lang === 'fr' ? 'Enclaves Matérielles Isolées' : 'Confidential Computing Enclaves',
      desc: lang === 'fr'
        ? "Exécution des modèles d'IA dans des enclaves confidentielles matérielles (AMD SEV-SNP & Intel SGX) chiffrant la mémoire vive."
        : "AI copilot computation isolated inside hardware enclaves (AMD SEV-SNP & Intel SGX), preventing memory inspection."
    },
    {
      icon: 'policy',
      title: lang === 'fr' ? 'Traçabilité Immuable (Audit Trail)' : 'Immutable Audit Trail',
      desc: lang === 'fr'
        ? "Chaque écriture de métrique carbone et chaque ordre de travail GMAO est horodaté cryptographiquement dans un registre infalsifiable."
        : "Cryptographic hash chaining on every telemetry write and carbon offset transaction for audit certifiability."
    },
    {
      icon: 'shield',
      title: lang === 'fr' ? 'Surveillance SIEM & Pentests 24/7' : '24/7 SIEM & Continuous Pentests',
      desc: lang === 'fr'
        ? "Détection proactive des menaces en temps réel assistée par IA, tests d'intrusion trimestriels et programme de Bug Bounty actif."
        : "AI-assisted proactive threat detection, quarterly penetration testing by certified CREST teams, and public Bug Bounty."
    },
    {
      icon: 'passkey',
      title: lang === 'fr' ? 'Contrôle d\'Accès RBAC & SSO SAML' : 'Granular RBAC & SAML SSO',
      desc: lang === 'fr'
        ? "Intégration native Okta, Azure AD, Google Workspace avec politiques MFA obligatoires et révocation de session en temps réel."
        : "Enterprise Single Sign-On (SAML 2.0 / SCIM) with Okta, Azure AD, Google Workspace, and enforced biometric MFA."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0e0a1b] text-[#e8defb] pt-8 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#ff9d2b]/12 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[300px] bg-[#a855f7]/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-[1280px] mx-auto relative z-10">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#241a38] border border-[#ff9d2b]/35 text-xs font-mono text-[#ffc06e] shadow-[0_0_20px_rgba(255,157,43,0.2)] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
            <span>ZERO TRUST & HARDWARE-ENCRYPTED ENCLAVE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffb04f] via-[#ffc06e] to-[#ff9d2b] tracking-tight drop-shadow-[0_0_25px_rgba(255,157,43,0.35)] mb-3">
            Security Enclave and Compliance
          </h1>
          <p className="text-sm sm:text-base text-[#ffb04f]/90 font-medium tracking-wide">
            End-to-End Encryption & Compliance for Environmental Data
          </p>
        </div>

        {/* Central 3D Interactive Holographic Shield Showcase (Matching Screenshots 3 & 4) */}
        <div className="mb-14 rounded-3xl bg-gradient-to-b from-[#18112d]/90 to-[#120c22]/90 border border-[#ff9d2b]/40 p-8 sm:p-12 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(255,157,43,0.15)] relative overflow-hidden">
          
          {/* Subtle Grid Circuit Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff9d2b0a_1px,transparent_1px),linear-gradient(to_bottom,#ff9d2b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            
            {/* Holographic Glowing Shield Centerpiece */}
            <div className="relative mb-8 group cursor-pointer">
              {/* Outer Pulsing Aura */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#ff9d2b] via-[#ffc06e] to-[#ff9d2b] rounded-full blur-xl opacity-40 group-hover:opacity-75 transition-opacity animate-pulse"></div>
              
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-[#1d1434] border-2 border-[#ff9d2b] flex items-center justify-center shadow-[0_0_35px_rgba(255,157,43,0.5)]">
                <span className="material-symbols-outlined text-[64px] sm:text-[80px] text-transparent bg-clip-text bg-gradient-to-b from-[#ffc06e] to-[#ff9d2b] drop-shadow-[0_0_15px_#ff9d2b]">
                  verified_user
                </span>
                
                {/* Floating Micro Nodes */}
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#34d399] border-2 border-[#120c22] shadow-[0_0_10px_#34d399] flex items-center justify-center text-[10px] text-black font-bold">
                  ✓
                </div>
              </div>
            </div>

            {/* 3 Floating Badges from User Screenshot */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 max-w-2xl">
              <div className="px-5 py-2.5 rounded-2xl bg-[#23183d] border-2 border-[#ff9d2b]/70 shadow-[0_0_20px_rgba(255,157,43,0.3)] text-xs sm:text-sm font-mono font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff9d2b]"></span>
                <span>ISO 27001 Certified</span>
              </div>

              <div className="px-5 py-2.5 rounded-2xl bg-[#23183d] border-2 border-[#ff9d2b]/70 shadow-[0_0_20px_rgba(255,157,43,0.3)] text-xs sm:text-sm font-mono font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]"></span>
                <span>GDPR Compliant</span>
              </div>

              <div className="px-5 py-2.5 rounded-2xl bg-[#23183d] border-2 border-[#ff9d2b]/70 shadow-[0_0_20px_rgba(255,157,43,0.3)] text-xs sm:text-sm font-mono font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffb2bb]"></span>
                <span>SOC 2 Type II</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#cdc3d0] max-w-2xl leading-relaxed">
              {lang === 'fr'
                ? "L'architecture beecarbonat garantit une isolation cryptographique étanche de chaque portefeuille d'actifs. Vos métriques de durabilité et vos flux opérationnels sont chiffrés avec vos propres clés de coffre-fort."
                : "The beecarbonat architecture delivers airtight cryptographic isolation for every asset portfolio. Environmental telemetry and operations data are sealed with dedicated hardware-backed keys."}
            </p>

          </div>

          {/* 3 Pillars Summary Bar */}
          <div className="mt-10 pt-8 border-t border-[#2f224d] grid grid-cols-1 md:grid-cols-3 gap-6">
            {compliancePillars.map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#1e1535]/70 border border-[#ff9d2b]/25">
                <div className="text-xs font-mono text-[#ffc06e] font-bold uppercase mb-1">
                  {p.badge}
                </div>
                <div className="text-sm font-bold text-white mb-1.5">{p.title}</div>
                <div className="text-xs text-[#cdc3d0] leading-relaxed">{p.desc}</div>
              </div>
            ))}
          </div>

        </div>

        {/* 6 Key Architectural Security Cards (As seen in the screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((f, idx) => (
            <div 
              key={idx}
              className="rounded-2xl bg-[#161028]/90 border border-[#ff9d2b]/30 hover:border-[#ff9d2b]/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(255,157,43,0.2)] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#ff9d2b]/15 border border-[#ff9d2b]/35 flex items-center justify-center text-[#ffc06e] mb-4 shadow-[0_0_15px_rgba(255,157,43,0.25)]">
                  <span className="material-symbols-outlined text-[24px]">{f.icon}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {f.title}
                </h3>

                <p className="text-xs text-[#cdc3d0] leading-relaxed">
                  {f.desc}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-[#291f3e] flex items-center justify-between text-[11px] font-mono text-[#ffc06e]">
                <span>Norme Militaire</span>
                <span className="material-symbols-outlined text-[14px]">lock_clock</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bottom Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-[#161128] border border-[#2c2244]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#34d399] text-[24px]">verified</span>
            <div className="text-xs">
              <div className="text-white font-bold">{lang === 'fr' ? 'Demande de Rapport SOC 2 & NDA' : 'SOC 2 Report & NDA Request'}</div>
              <div className="text-[#cdc3d0]">security@beecarbonat.com • Accès sous 2h ouvrées</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-5 py-2.5 rounded-full text-xs font-bold font-mono text-[#cdc3d0] bg-[#221a36] hover:bg-[#2c2244] border border-[#3c305c] transition-colors"
            >
              ← {lang === 'fr' ? 'Retour Accueil' : 'Back Home'}
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="px-5 py-2.5 rounded-full text-xs font-bold font-mono text-[#29074a] bg-gradient-to-r from-[#ff9d2b] to-[#ffb04f] hover:brightness-110 transition-all shadow-[0_0_15px_rgba(255,157,43,0.3)]"
            >
              {lang === 'fr' ? 'Déployer sur Cloud Souverain' : 'Deploy Sovereign Cloud'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
