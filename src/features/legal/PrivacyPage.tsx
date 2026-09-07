import React from 'react';
import { NavigationPage } from '../../types/bizos';

interface PrivacyPageProps {
  onNavigate: (page: NavigationPage) => void;
  lang?: 'fr' | 'en';
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate, lang = 'fr' }) => {
  const quickSummaries = [
    {
      icon: 'database',
      title: lang === 'fr' ? 'Collecte des Données :' : 'Data Collection:',
      desc: lang === 'fr' 
        ? "Nous recueillons des données télémétriques et environnementales pour optimiser les performances de la plateforme et offrir des analyses prédictives personnalisées."
        : "We collect telemetry and environmental data to improve platform performance and offer personalized predictive insights."
    },
    {
      icon: 'pie_chart',
      title: lang === 'fr' ? 'Utilisation des Données :' : 'Data Usage:',
      desc: lang === 'fr'
        ? "Utilisées exclusivement pour l'analyse d'efficience énergétique, la sécurité des passerelles IoT et l'amélioration continue de l'expérience utilisateur."
        : "Used for energy efficiency analysis, IoT gateway security, and enhancing seamless user experience."
    },
    {
      icon: 'admin_panel_settings',
      title: lang === 'fr' ? 'Droits des Utilisateurs :' : 'User Rights:',
      desc: lang === 'fr'
        ? "Vous conservez le contrôle absolu sur vos données : accès souverain, portabilité, rectification, anonymisation et suppression immédiate sur demande."
        : "You have complete control over your data, including sovereignty, access, correction, portability, and permanent deletion."
    }
  ];

  const policySections = [
    {
      id: 'intro',
      title: lang === 'fr' ? 'Introduction' : 'Introduction',
      content: lang === 'fr'
        ? "beecarbonat (BeeCarbonIt Platform) est une plateforme de durabilité environnementale et d'intelligence opérationnelle. Nous collectons des données strictement nécessaires pour optimiser l'empreinte carbone, garantir la sécurité des infrastructures et restituer des métriques de pilotage haute fidélité."
        : "beecarbonat (BeeCarbonIt Platform) is an environmental sustainability and operations intelligence platform. We collect data strictly necessary to improve carbon footprint efficiency, safeguard smart infrastructure, and provide real-time sustainability insights."
    },
    {
      id: 'collect',
      title: lang === 'fr' ? 'Informations Collectées' : 'Information We Collect',
      content: lang === 'fr'
        ? "Nous recueillons des données techniques relatives aux consommations d'énergie (kWh, CO2eq), les métriques d'équipements IoT (BACnet, Modbus, MQTT), ainsi que les informations de profil professionnel et d'accès sécurisé fournies lors de la configuration de votre compte."
        : "We collect technical telemetry data regarding energy consumption (kWh, CO2eq), smart IoT asset telemetry (BACnet, Modbus, MQTT), and professional authentication credentials provided during workspace provisioning."
    },
    {
      id: 'usage',
      title: lang === 'fr' ? 'Utilisation de Vos Informations' : 'How We Use Your Information',
      content: lang === 'fr'
        ? "Les données alimentent nos moteurs d'intelligence artificielle pour détecter les anomalies de surconsommation, prévoir les maintenances prédictives FFT, générer les bilans CSRD et adapter les recommandations en temps réel sans jamais revendre vos données."
        : "We process information using isolated AI engines to detect thermal and energy spikes, generate CSRD regulatory audits, run FFT predictive diagnostics, and continuously optimize facility decarbonization without third-party reselling."
    },
    {
      id: 'sharing',
      title: lang === 'fr' ? 'Partage & Divulgation' : 'Data Sharing & Disclosure',
      content: lang === 'fr'
        ? "beecarbonat ne commercialise aucune donnée. Les partages sont restreints aux sous-traitants certifiés de notre enclave souveraine (hébergement ISO 27001 / SOC 2 en Union Européenne) et aux intégrations autorisées par votre organisation (ERP, GMAO, API tierces)."
        : "beecarbonat never sells personal or corporate data. Disclosures are strictly limited to certified sovereign enclave sub-processors (ISO 27001 / SOC 2 European clusters) and client-authorized enterprise integrations."
    },
    {
      id: 'retention',
      title: lang === 'fr' ? 'Conservation des Données' : 'Data Retention',
      content: lang === 'fr'
        ? "Vos séries temporelles et historiques d'audits sont conservés pendant la durée active de votre abonnement .bee OS, avec archivage chiffré. À la clôture du compte, une purge automatique complète intervient sous 30 jours calendaires."
        : "Time-series telemetry and compliance audits are retained for the duration of your active .bee OS subscription. Upon workspace termination, cryptographic purge and data shredding occur within 30 calendar days."
    },
    {
      id: 'rights',
      title: lang === 'fr' ? 'Vos Droits & Choix' : 'Your Rights & Choices',
      content: lang === 'fr'
        ? "En vertu du RGPD et des réglementations internationales, vous disposez d'un droit d'accès, d'export sous format JSON/CSV normalisé, d'opposition aux traitements automatisés et de révocation des clés de chiffrement de votre organisation à tout moment."
        : "Under GDPR and global data sovereignty frameworks, you have the right to access, export in standard JSON/CSV schemas, restrict automated processing, and revoke enterprise encryption keys at any moment."
    },
    {
      id: 'security',
      title: lang === 'fr' ? 'Mesures de Sécurité' : 'Security Measures',
      content: lang === 'fr'
        ? "Chiffrement AES-256 au repos et TLS 1.3 en transit, segmentation réseau Zero-Trust, authentification multifacteur (MFA/SSO SAML), et surveillance continue contre les intrusions par notre Security Enclave certifiée SOC 2 Type II."
        : "AES-256 encryption at rest and TLS 1.3 in transit, Zero-Trust network segmentation, biometric & SSO SAML enforcement, and 24/7 SIEM monitoring verified through our SOC 2 Type II security enclave."
    },
    {
      id: 'updates',
      title: lang === 'fr' ? 'Mises à Jour de la Politique' : 'Updates to Policy',
      content: lang === 'fr'
        ? "Toute mise à jour substantielle sera notifiée au moins 15 jours à l'avance via votre console d'administration et par email. L'historique des versions demeure consultable publiquement avec horodatage blockchain infalsifiable."
        : "Material policy updates are notified at least 15 days in advance via your administration console and registered email. Version changelogs remain publicly verifiable with immutable timestamping."
    }
  ];

  return (
    <div className="min-h-screen bg-[#110c20] text-[#e8defb] pt-8 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glows matching the aesthetic */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ff9d2b]/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-1/4 w-[500px] h-[250px] bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1240px] mx-auto relative z-10">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#271d3c] border border-[#ff9d2b]/30 text-xs font-mono text-[#ffc06e] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
            <span>RGPD, SOC 2 & SOUVERAINETÉ DES DONNÉES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ffb04f] via-[#ffc06e] to-[#ff9d2b] tracking-tight drop-shadow-[0_0_25px_rgba(255,157,43,0.35)] mb-3">
            Privacy Policy and Data Protection
          </h1>
          <p className="text-sm sm:text-base text-[#ffb04f]/90 font-medium tracking-wide">
            BeeCarbonIt Environmental Sustainability Platform & .bee OS
          </p>
        </div>

        {/* Quick Summary Big Banner Card */}
        <div className="mb-10 rounded-2xl bg-[#161128]/90 border border-[#ff9d2b]/40 p-6 sm:p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(255,157,43,0.12)]">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#ff9d2b]"></span>
            <span>{lang === 'fr' ? 'Résumé Exécutif' : 'Quick Summary'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickSummaries.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#201835]/60 border border-[#ff9d2b]/20 hover:border-[#ff9d2b]/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#ff9d2b]/15 border border-[#ff9d2b]/30 flex items-center justify-center text-[#ffc06e] flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,157,43,0.2)]">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[#ffc06e] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#cdc3d0] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8 Detailed Policy Cards Grid (As seen in the user's screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {policySections.map((sec, idx) => (
            <div 
              key={sec.id}
              className="rounded-2xl bg-[#17112a]/80 border border-[#ff9d2b]/25 hover:border-[#ff9d2b]/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(255,157,43,0.18)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-[#ff9d2b] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ff9d2b]/10 border border-[#ff9d2b]/20">
                    Art. 0{idx + 1}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
                </div>

                <h3 className="text-base font-bold text-white mb-2.5 leading-snug">
                  {sec.title}
                </h3>

                <p className="text-xs text-[#cdc3d0] leading-relaxed">
                  {sec.content}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#291f3e] flex items-center justify-between text-[11px] text-[#ffc06e] font-mono">
                <span>Conforme RGPD</span>
                <span className="material-symbols-outlined text-[14px]">verified</span>
              </div>
            </div>
          ))}
        </div>

        {/* Back and Contact Navigation */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-[#161128] border border-[#2c2244]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffc06e] text-[24px]">contact_support</span>
            <div className="text-xs">
              <div className="text-white font-bold">{lang === 'fr' ? 'Délégué à la Protection des Données (DPO)' : 'Data Protection Officer (DPO)'}</div>
              <div className="text-[#cdc3d0]">dpo@beecarbonat.com • Réponse certifiée sous 24h</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 rounded-full text-xs font-bold font-mono text-[#cdc3d0] bg-[#221a36] hover:bg-[#2c2244] border border-[#3c305c] transition-colors"
            >
              ← {lang === 'fr' ? 'Retour Accueil' : 'Back Home'}
            </button>
            <button
              onClick={() => onNavigate('security')}
              className="px-4 py-2 rounded-full text-xs font-bold font-mono text-[#29074a] bg-gradient-to-r from-[#ff9d2b] to-[#ffb04f] hover:brightness-110 transition-all shadow-[0_0_15px_rgba(255,157,43,0.3)]"
            >
              {lang === 'fr' ? 'Voir Security Enclave →' : 'View Security Enclave →'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
