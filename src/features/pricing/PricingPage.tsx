import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationPage } from '../../types/bizos';
import { PayPalSubscriptionButton } from '../../components/payment/PayPalSubscriptionButton';
import { LoginModal } from '../../components/LoginModal';
import { BeeLogo } from '../../components/BeeLogo';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Building2, 
  HelpCircle, 
  ArrowRight, 
  BadgeCheck, 
  AlertTriangle,
  Lock,
  Server,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface PricingPageProps {
  onNavigate: (page: NavigationPage | string) => void;
  onOpenTrial: () => void;
  lang?: 'fr' | 'en';
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, onOpenTrial, lang = 'fr' }) => {
  const { user, profile, signInWithGoogle, signOut } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'ENTERPRISE'>('PRO');
  const [subscriptionSuccessId, setSubscriptionSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalInitialMode, setLoginModalInitialMode] = useState<'signin' | 'signup' | 'verify'>('signin');

  // Pricing calculations (Monthly vs Annual with -20% discount)
  const prices = {
    PRO: {
      monthly: 49,
      annualMonthly: 39,
      annualTotal: 468,
    },
    ENTERPRISE: {
      monthly: 199,
      annualMonthly: 159,
      annualTotal: 1908,
    },
  };

  const currentPrice =
    billingCycle === 'annual'
      ? selectedPlan === 'PRO'
        ? prices.PRO.annualTotal
        : prices.ENTERPRISE.annualTotal
      : selectedPlan === 'PRO'
      ? prices.PRO.monthly
      : prices.ENTERPRISE.monthly;

  const handleSubscriptionSuccess = (subscriptionId: string) => {
    setSubscriptionSuccessId(subscriptionId);
    setErrorMsg('');
  };

  const handleSubscriptionError = (msg: string) => {
    setErrorMsg(msg);
  };

  const openAuthWithMode = (mode: 'signin' | 'signup' | 'verify') => {
    setLoginModalInitialMode(mode);
    setLoginModalOpen(true);
  };

  const isUserVerified = profile?.isVerified || profile?.verificationStatus === 'verified';
  const hasActiveSubscription = profile?.subscriptionStatus === 'active';

  return (
    <div className="w-full min-h-screen bg-[#0a0714] text-slate-100 font-sans pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* ── HEADER & HERO ──────────────────────────────────────────────── */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BizOS • Intelligence Énergétique & CAFM ESG</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Tarifs Transparents pour une{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Décarbonation Rentable
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400">
            Pilotez vos consommations CVC, automatisez votre reporting CSRD et réduisez vos dépenses d'énergie jusqu'à 35%.
          </p>

          {/* ── BILLING CYCLE TOGGLE ────────────────────────────────────── */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-[#150f24] p-1.5 rounded-2xl border border-white/10 flex items-center gap-2 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Facturation Mensuelle
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Facturation Annuelle</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40">
                  -20% (2 mois offerts)
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── ACCOUNT STATUS & VERIFICATION BANNER ──────────────────────── */}
        {user && (
          <div className="max-w-4xl mx-auto">
            {!isUserVerified ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-amber-300">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold">Compte en attente de vérification :</span> Pour activer la facturation certifiée et les exports CSRD, vérifiez votre adresse email.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthWithMode('verify')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 transition-all shadow-sm"
                >
                  Vérifier mon compte
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  <span>Compte vérifié : <strong>{user.email}</strong> {profile?.companyName ? `(${profile.companyName})` : ''}</span>
                </div>
                {hasActiveSubscription && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 font-mono font-bold text-[11px]">
                    Plan Actif : {profile?.plan || 'PRO'}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ERROR MESSAGE ────────────────────────────────────────────── */}
        {errorMsg && (
          <div className="max-w-2xl mx-auto p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* ── SUBSCRIPTION SUCCESS BANNER ──────────────────────────────── */}
        {subscriptionSuccessId && (
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-200">Abonnement BizOS Activé !</h3>
            <p className="text-xs text-emerald-300">
              Réf Transaction : <span className="font-mono">{subscriptionSuccessId}</span>. Vos accès complets sont ouverts.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('god-mode')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all"
              >
                Accéder au Cockpit de Supervision →
              </button>
            </div>
          </div>
        )}

        {/* ── 3 PRICING TIERS ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          
          {/* 1. STARTER */}
          <div className="rounded-3xl bg-[#130e22] border border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400">Essai</span>
              </div>
              <p className="text-xs text-slate-400">
                Idéal pour auditer un premier site et évaluer le potentiel de gain énergétique.
              </p>

              <div className="py-2">
                <div className="text-3xl font-extrabold text-white">0 €</div>
                <div className="text-xs text-slate-500">Gratuit • Sans carte bancaire</div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Bâtiment / Site pilote</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Télémétrie énergétique basique</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Calcul Scope 1 et 2 manuel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Jusqu'à 3 utilisateurs</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              {user ? (
                <button
                  type="button"
                  onClick={() => onNavigate('god-mode')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all"
                >
                  Continuer avec Starter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthWithMode('signup')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-all"
                >
                  Démarrer Gratuitement
                </button>
              )}
            </div>
          </div>

          {/* 2. BIZOS PRO (POPULAR) */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#1f1738] to-[#140e24] border-2 border-amber-500/80 p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_35px_rgba(245,158,11,0.15)] scale-102 lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[11px] uppercase tracking-wider shadow-md">
              ★ Le Plus Populaire
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>BizOS Pro</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Complet
                </span>
              </div>
              <p className="text-xs text-slate-300">
                La solution complète pour optimiser la CVC, automatiser le reporting CSRD et gérer la maintenance.
              </p>

              <div className="py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-amber-400">
                    {billingCycle === 'annual' ? prices.PRO.annualMonthly : prices.PRO.monthly} €
                  </span>
                  <span className="text-xs text-slate-400">/ mois</span>
                </div>
                <div className="text-[11px] text-amber-300/80 font-mono">
                  {billingCycle === 'annual'
                    ? `Facturé 468 € / an (économie de 120 €)`
                    : `Facturation mensuelle sans engagement`}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Jusqu'à 10 bâtiments</strong> & 50 000 m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Télémétrie CVC temps réel</strong> (BACnet, Modbus, MQTT)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Bilans Scopes 1, 2 et 3</strong> certifiés CSRD</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>IA Prédictive Gemini</strong> (Détection fuites & météo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>GMAO & Bons de travail</strong> avec QR Codes équipements</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Exports PDF officiels & Rapports ESG automatisés</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => setSelectedPlan('PRO')}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-md ${
                  selectedPlan === 'PRO'
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {selectedPlan === 'PRO' ? '✓ Plan Pro Sélectionné' : 'Sélectionner le Plan Pro'}
              </button>
            </div>
          </div>

          {/* 3. ENTERPRISE */}
          <div className="rounded-3xl bg-[#130e22] border border-purple-500/30 p-6 sm:p-8 flex flex-col justify-between hover:border-purple-500/60 transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Enterprise Suite</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">Multi-Sites</span>
              </div>
              <p className="text-xs text-slate-400">
                Pour grands parcs tertiaires, foncières et industriels nécessitant haute sécurité et SLA.
              </p>

              <div className="py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {billingCycle === 'annual' ? prices.ENTERPRISE.annualMonthly : prices.ENTERPRISE.monthly} €
                  </span>
                  <span className="text-xs text-slate-400">/ mois</span>
                </div>
                <div className="text-[11px] text-purple-300 font-mono">
                  {billingCycle === 'annual'
                    ? `Facturé 1 908 € / an (économie de 480 €)`
                    : `Facturation mensuelle flexible`}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>Sites & surfaces illimités</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>Supervision Cyber God-Mode</strong> en direct</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>API REST & Webhooks</strong> temps réel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Accompagnement & Ingénieur RSE dédié</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Authentification SSO (SAML / Google / Okta)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>SLA 99.9% garanti avec contrat d'astreinte</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => setSelectedPlan('ENTERPRISE')}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                  selectedPlan === 'ENTERPRISE'
                    ? 'bg-purple-500 hover:bg-purple-400 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {selectedPlan === 'ENTERPRISE' ? '✓ Plan Enterprise Sélectionné' : 'Sélectionner Enterprise'}
              </button>
            </div>
          </div>

        </div>

        {/* ── INTERACTIVE PAYPAL CHECKOUT CARD ──────────────────────────── */}
        <div className="max-w-xl mx-auto rounded-3xl bg-[#140e24] border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Passerelle de Paiement Sécurisée BizOS</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Finaliser votre souscription : Plan {selectedPlan}
            </h3>
            <p className="text-xs text-slate-400">
              Montant à régler : <span className="text-white font-bold">{currentPrice} € TTC</span>{' '}
              ({billingCycle === 'annual' ? 'Engagement annuel' : 'Renouvellement mensuel'})
            </p>
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex justify-between items-center">
                <span className="text-slate-400">Compte associé :</span>
                <span className="text-white font-semibold font-mono">{user.email}</span>
              </div>

              {/* PayPal Component */}
              <PayPalSubscriptionButton
                planType={selectedPlan}
                billingCycle={billingCycle}
                price={currentPrice}
                onSuccess={handleSubscriptionSuccess}
                onError={handleSubscriptionError}
              />
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 leading-relaxed">
                Connectez-vous ou créez votre compte BizOS pour lier votre abonnement et recevoir votre facture certifiée.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => openAuthWithMode('signin')}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all"
                >
                  Se Connecter
                </button>
                <button
                  type="button"
                  onClick={() => openAuthWithMode('signup')}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Créer un Compte
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── FEATURE COMPARISON MATRIX ─────────────────────────────────── */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#110c20] border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-white">Comparatif Détaillé des Fonctionnalités</h3>
            <p className="text-xs text-slate-400">Choisissez la formule adaptée à la taille et aux enjeux de votre parc immobilier.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3 px-4 font-semibold">Fonctionnalité</th>
                  <th className="py-3 px-4 font-semibold text-center">Starter</th>
                  <th className="py-3 px-4 font-semibold text-center text-amber-400">Pro</th>
                  <th className="py-3 px-4 font-semibold text-center text-purple-400">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Nombre de bâtiments</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-center font-bold text-white">Jusqu'à 10</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-300">Illimité</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Télémétrie CVC & Énergie</td>
                  <td className="py-3 px-4 text-center">Manuelle / Horaires</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">Temps Réel IoT</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">Multi-protocoles & Edge</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Calculateur Scopes 1, 2, 3</td>
                  <td className="py-3 px-4 text-center">Scopes 1-2 partiel</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">Scopes 1, 2, 3 CSRD</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">Scopes 1, 2, 3 Certifié Audit</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">IA Prédictive Gemini</td>
                  <td className="py-3 px-4 text-center text-slate-600">—</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">Inclus</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">Modèles Dédiés & Fine-tuning</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">GMAO & Maintenance QR Code</td>
                  <td className="py-3 px-4 text-center text-slate-600">—</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">Inclus</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">Inclus + Alertes SMS/Email</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">API REST & Webhooks</td>
                  <td className="py-3 px-4 text-center text-slate-600">—</td>
                  <td className="py-3 px-4 text-center text-slate-400">En option</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">Accès Complet Illimité</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Support & SLA</td>
                  <td className="py-3 px-4 text-center">Email 48h</td>
                  <td className="py-3 px-4 text-center text-white">Prioritaire 12h</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-300">24/7 SLA 99.9% Dédié</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ & GUARANTEES ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-6">
          <div className="p-5 rounded-2xl bg-[#130e22] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Conformité RGPD & ISO 27001</h4>
            <p className="text-xs text-slate-400">
              Vos données de consommations sont chiffrées en transit et au repos sur des infrastructures européennes sécurisées.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#130e22] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Sans Engagement</h4>
            <p className="text-xs text-slate-400">
              Vous pouvez résilier ou faire évoluer votre abonnement à tout moment d'un simple clic depuis votre espace de gestion.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#130e22] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Facturation Entreprise</h4>
            <p className="text-xs text-slate-400">
              Factures avec TVA intracommunautaire éditées automatiquement pour votre comptabilité après chaque règlement.
            </p>
          </div>
        </div>

      </div>

      {/* ── LOGIN / REGISTRATION / VERIFICATION MODAL ────────────────── */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        initialMode={loginModalInitialMode}
        onSuccess={() => {
          setLoginModalOpen(false);
        }}
        lang={lang}
      />
    </div>
  );
};
