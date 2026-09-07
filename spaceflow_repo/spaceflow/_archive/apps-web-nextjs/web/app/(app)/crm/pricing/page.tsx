const PLANS = [
  {
    name: 'Starter',
    price: 99,
    unit: '/ mois / bâtiment',
    badge: null,
    features: [
      '5 bâtiments inclus',
      '50 actifs',
      'Gestion des WO basique',
      'Notifications email',
      'Support 24/72h',
    ],
    cta: 'Commencer',
    ctaStyle: 'border border-zinc-700 text-zinc-300 hover:border-zinc-500',
  },
  {
    name: 'Professional',
    price: 299,
    unit: '/ mois / bâtiment',
    badge: 'Le plus populaire',
    features: [
      'Bâtiments illimités',
      'Actifs illimités',
      'Scanner QR & Mobile PWA',
      'Modules ESG & Énergie',
      'BIM & Digital Twin',
      'API & Webhooks',
      'Support 24/24h',
    ],
    cta: 'Démarrer le Pro',
    ctaStyle: 'bg-brand-orange text-black hover:bg-orange-600 shadow-[0_0_20px_rgba(243,128,32,0.4)]',
  },
  {
    name: 'Enterprise',
    price: null,
    unit: 'Sur devis',
    badge: null,
    features: [
      'Tout le plan Professional',
      'Intégrations ERP (SAP, Oracle...)',
      'IA Prédictive & Copilot ESG',
      'SSO & LDAP',
      'SLA 99.9% garanti',
      'Onboarding dédié',
      'Support CSM dédié',
    ],
    cta: 'Contacter les ventes',
    ctaStyle: 'border border-brand-cyan text-brand-cyan hover:bg-brand-cyan/10',
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-full bg-zinc-950 text-zinc-100 font-sans p-8 lg:p-12 flex flex-col items-center gap-12 max-w-[1400px] mx-auto w-full">
      
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
          Tarification Transparente
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
          Plans & Tarifs
        </h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Des plans adaptés à chaque taille d'organisation, du PME jusqu'aux grands groupes immobiliers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`relative bg-zinc-900 rounded-2xl border p-8 flex flex-col gap-6 transition-transform hover:-translate-y-1 duration-200 ${
              plan.badge ? 'border-brand-orange shadow-[0_0_30px_rgba(243,128,32,0.15)]' : 'border-zinc-800'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-black text-[10px] font-bold font-mono uppercase px-3 py-1 rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold tracking-tight mb-3">{plan.name}</h2>
              {plan.price ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{plan.price}€</span>
                  <span className="text-zinc-500 text-xs font-mono">{plan.unit}</span>
                </div>
              ) : (
                <div className="text-4xl font-bold text-brand-cyan">Devis</div>
              )}
            </div>

            <ul className="space-y-3 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <span className="w-4 h-4 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center text-[10px] shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button className={`w-full py-3 rounded-xl text-sm font-bold font-mono uppercase tracking-wider transition-all ${plan.ctaStyle}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-600 text-center">
        Tous les prix sont HT. Engagement mensuel ou annuel (−20%). 14 jours d'essai gratuit sans carte bancaire.
      </p>
    </div>
  );
}
