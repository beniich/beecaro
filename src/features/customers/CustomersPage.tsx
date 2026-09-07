import React from 'react';
import { NavigationPage } from '../../types/bizos';
import { mockTestimonials } from '../../data/bizosData';

interface CustomersPageProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTrial: () => void;
  lang?: 'fr' | 'en';
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  onNavigate,
  onOpenTrial,
  lang = 'fr'
}) => {
  return (
    <div className="w-full relative overflow-hidden pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
      {/* Ambient background glow */}
      <div className="absolute top-16 left-1/3 w-[600px] h-[350px] bg-[#ffb2bb]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2c273c]/80 border border-[#ecd7ff]/25 text-xs font-mono text-slate-900 dark:text-slate-200 shadow-[0_0_20px_rgba(216,180,254,0.15)] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
          <span>{lang === 'fr' ? 'HISTOIRES DE FONDATEURS' : 'FOUNDER CASE STUDIES'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#e8defb] tracking-tight leading-[1.1] mb-6">
          {lang === 'fr' ? (
            <>
              Ils dirigent avec sérénité et <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                multiplient leur impact.
              </span>
            </>
          ) : (
            <>
              They Lead with Serenity and <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                Multiply Their Impact.
              </span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          {lang === 'fr'
            ? "Découvrez comment plus de 50 000 fondateurs et dirigeants utilisent BizOS pour éradiquer le surmenage et accélérer leurs cycles d'exécution."
            : "Discover how over 50,000 founders and executive leaders harness BizOS to eliminate fatigue and operate with precision."}
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 relative z-10">
        {mockTestimonials.map((t, idx) => (
          <div
            key={idx}
            className="p-8 rounded-3xl bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl text-slate-900 dark:text-slate-200">“</span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#2c273c] text-[#34d399] border border-[#34d399]/30">
                  {t.metric}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>
            </div>

            <div className="pt-4 border-t border-[#373147]">
              <div className="font-bold text-sm text-[#e8defb]">{t.author}</div>
              <div className="text-xs text-[#968e9a] mt-0.5">{t.role}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Deep-Dive Case Study (Lumina Technologies) */}
      <section className="mb-20 bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-mono text-slate-900 dark:text-slate-200 uppercase tracking-widest font-semibold">
              {lang === 'fr' ? 'ÉTUDE DE CAS EN VEDETTE' : 'FEATURED CASE STUDY'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#e8defb] tracking-tight">
              Lumina Technologies : +$1.2M d'ARR débloqués en protégeant l'énergie des fondateurs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              En couplant l'Oura Ring d'Elena Vance avec le moteur InboxAI et les triggers MeetAI vers Jira, l'équipe produit a accéléré son cycle de livraison de 45% tout en maintenant un score de récupération moyen supérieur à 78%.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-3.5 rounded-2xl bg-[#221c31] border border-slate-200 dark:border-slate-800">
                <div className="text-2xl font-black text-slate-900 dark:text-slate-200 font-mono">14h</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Gagnées / semaine</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#221c31] border border-slate-200 dark:border-slate-800">
                <div className="text-2xl font-black text-orange-500 font-mono">0</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Burnout recensé</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#221c31] border border-slate-200 dark:border-slate-800">
                <div className="text-2xl font-black text-[#34d399] font-mono">99.4%</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Alignement équipe</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#221c31] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ecd7ff] to-[#ffb2bb] p-[1.5px] mx-auto mb-4">
              <div className="w-full h-full bg-[#151024] rounded-[14px] flex items-center justify-center text-slate-900 dark:text-slate-200 font-bold text-xl">
                EV
              </div>
            </div>
            <h4 className="text-base font-bold text-[#e8defb]">Elena Vance</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">CEO & Co-founder, Lumina</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed mb-6">
              "BizOS est devenu notre couche cognitive invisible. Je ne pourrais plus imaginer diriger sans."
            </p>
            <button
              onClick={onOpenTrial}
              className="w-full bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:scale-102 transition-transform"
            >
              Rejoindre les Fondateurs BizOS
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
