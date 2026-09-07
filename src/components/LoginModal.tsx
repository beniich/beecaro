import React, { useState } from 'react';
import { BeeLogo } from './BeeLogo';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  Globe, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Building2, 
  Phone, 
  KeyRound, 
  RefreshCw,
  Sparkles,
  Check
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  onOpenTrial?: () => void;
  initialMode?: 'signin' | 'signup' | 'verify' | 'forgot';
  lang?: 'fr' | 'en';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
  lang = 'fr'
}) => {
  const { 
    user,
    profile,
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    sendVerificationEmail,
    verifyAccountWithCode,
    resetPassword,
    customDomain,
    formatAuthError 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'verify' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('facility_manager');
  const [termsAccepted, setTermsAccepted] = useState(true);
  
  // Verification code state
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password strength helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passScore = getPasswordStrength(password);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setAuthError(null);
      setAuthSuccessMsg(null);
      const cred = await signInWithGoogle();
      setIsGoogleLoading(false);
      onSuccess(cred.user.email || 'operator@bizos.ai');
      onClose();
    } catch (err: any) {
      setIsGoogleLoading(false);
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.error('Firebase Google Auth error:', err);
        setAuthError(formatAuthError(err, lang));
      }
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const cred = await signInWithEmail(email, password);
        setIsLoading(false);
        onSuccess(cred.user.email || email);
        onClose();
      } else if (mode === 'signup') {
        if (!termsAccepted) {
          setIsLoading(false);
          setAuthError(lang === 'fr' ? 'Veuillez accepter les conditions d\'utilisation.' : 'Please accept terms.');
          return;
        }

        const cred = await signUpWithEmail(email, password, displayName, role, companyName, phone);
        setIsLoading(false);
        // Switch to verification step right away
        setAuthSuccessMsg(
          lang === 'fr'
            ? 'Compte créé avec succès ! Un e-mail de confirmation vous a été adressé.'
            : 'Account created! A confirmation email has been sent.'
        );
        setMode('verify');
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setIsLoading(false);
        setAuthSuccessMsg(
          lang === 'fr' 
            ? 'Un e-mail de réinitialisation vous a été envoyé ! Vérifiez votre boîte de réception.'
            : 'A password reset link has been sent to your email inbox.'
        );
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      setIsLoading(false);
      setAuthError(formatAuthError(err, lang));
    }
  };

  // Handle Account Verification
  const handleVerifyCodeSubmit = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = customCode || verificationCode;
    if (!codeToVerify) {
      setAuthError(lang === 'fr' ? 'Veuillez renseigner le code de vérification' : 'Please enter verification code');
      return;
    }

    setIsVerifying(true);
    setAuthError(null);

    try {
      const verified = await verifyAccountWithCode(codeToVerify);
      if (verified) {
        setVerificationSuccess(true);
        setAuthSuccessMsg(lang === 'fr' ? 'Félicitations ! Votre compte BizOS est vérifié.' : 'Account verified successfully!');
        setTimeout(() => {
          onSuccess(user?.email || email);
          onClose();
        }, 1200);
      } else {
        setAuthError(
          lang === 'fr'
            ? 'Code invalide ou expiré. Essayez avec le code sandbox : BIZ-2026'
            : 'Invalid code. Try sandbox code: BIZ-2026'
        );
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erreur lors de la vérification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      await sendVerificationEmail();
      setAuthSuccessMsg(
        lang === 'fr'
          ? 'Nouvel e-mail de vérification expédié !'
          : 'New verification email dispatched!'
      );
    } catch (err: any) {
      setAuthError(err.message || 'Impossible de renvoyer le mail');
    }
  };

  const handleQuickDemo = (roleKey: 'founder' | 'executive' | 'lead') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(`${roleKey}@bizos.ai`);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0714]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#140e24] border border-[#a855f7]/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/80 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Fermer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5 flex flex-col items-center">
          <div className="mb-2">
            <BeeLogo size="lg" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'signin' && (lang === 'fr' ? 'Connexion à BizOS' : 'Sign in to BizOS')}
            {mode === 'signup' && (lang === 'fr' ? 'Créer un Compte BizOS' : 'Create BizOS Account')}
            {mode === 'verify' && (lang === 'fr' ? 'Vérification du Compte' : 'Account Verification')}
            {mode === 'forgot' && (lang === 'fr' ? 'Mot de passe oublié' : 'Reset Password')}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {mode === 'verify'
              ? (lang === 'fr' ? 'Validez votre identité pour débloquer la facturation et le pilotage des sites.' : 'Verify your identity to unlock billing and site controls.')
              : (lang === 'fr' ? 'Plateforme unifiée ESG, Télémétrie CVC et Gestion de Patrimoine Immobilier.' : 'Unified ESG, HVAC telemetry and facility management platform.')}
          </p>

          {/* Domain & Security Badge */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Serveur : <strong>{customDomain}</strong></span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
          </div>
        </div>

        {/* Tabs: Sign In / Sign Up / Verification */}
        {mode !== 'forgot' && (
          <div className="flex bg-[#1b152d] p-1 rounded-2xl border border-white/10 mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setAuthError(null); setAuthSuccessMsg(null); }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signin' 
                  ? 'bg-amber-500 text-black font-bold shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'fr' ? 'Connexion' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setAuthError(null); setAuthSuccessMsg(null); }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signup' 
                  ? 'bg-amber-500 text-black font-bold shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'fr' ? 'Inscription' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('verify'); setAuthError(null); setAuthSuccessMsg(null); }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'verify' 
                  ? 'bg-amber-500 text-black font-bold shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'fr' ? 'Vérification' : 'Verification'}
            </button>
          </div>
        )}

        {/* Error Feedback */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Success Feedback */}
        {authSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{authSuccessMsg}</span>
          </div>
        )}

        {/* ── MODE: ACCOUNT VERIFICATION ─────────────────────────────────────── */}
        {mode === 'verify' ? (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-[#1b152d] border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Vérification de Sécurité</h4>
                  <p className="text-xs text-slate-400">
                    Email : <strong className="text-white">{user?.email || email || 'votre email'}</strong>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Pour garantir la conformité RGPD et sécuriser vos accès de télémétrie, saisissez le code OTP à 6 chiffres ou validez directement votre compte en mode sandbox.
              </p>

              <form onSubmit={handleVerifyCodeSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Code OTP (ou code test sandbox)
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="ex: 123456 ou BIZ-2026"
                    className="w-full bg-[#0d0918] border border-white/20 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-center font-mono tracking-widest text-white placeholder-slate-600 outline-none uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="submit"
                    disabled={isVerifying || verificationSuccess}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : verificationSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Compte Validé !</span>
                      </>
                    ) : (
                      <span>Vérifier le Code</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifyCodeSubmit(undefined, 'BIZ-2026')}
                    disabled={isVerifying || verificationSuccess}
                    className="w-full py-2.5 px-4 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span>Valider (Code Test BIZ-2026)</span>
                  </button>
                </div>
              </form>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/5">
                <span>Pas reçu de code ?</span>
                <button
                  type="button"
                  onClick={handleResendVerificationEmail}
                  className="text-amber-400 hover:underline font-medium"
                >
                  Renvoyer l'e-mail
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMode('signin')}
              className="w-full text-center text-xs text-slate-400 hover:text-white"
            >
              ← Revenir à la connexion
            </button>
          </div>
        ) : (
          /* ── MODE: SIGN IN / SIGN UP / FORGOT ──────────────────────────────── */
          <>
            {/* Google Firebase Login Button */}
            {mode !== 'forgot' && (
              <div className="mb-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md active:scale-98 border border-slate-300"
                >
                  {isGoogleLoading ? (
                    <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      <span>Continuer avec Google (Firebase OAuth)</span>
                    </>
                  )}
                </button>

                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                    ou formulaire sécurisé
                  </span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuthSubmit} className="space-y-3 text-left">
              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Nom & Prénom *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Jean Dupont"
                          className="w-full bg-[#1b152d] border border-white/15 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Entreprise / Organisation *
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme Immobilier"
                          className="w-full bg-[#1b152d] border border-white/15 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Rôle Opérationnel *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-[#1b152d] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="facility_manager">Facility Manager (Gestionnaire Technique)</option>
                      <option value="technician">Technicien CVC & Énergie (Interventions)</option>
                      <option value="admin">Directeur RSE / ESG (Pilote Bilan Carbone)</option>
                      <option value="tenant">Exploitant / Locataire (Demandes)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Adresse Email Professionnelle *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="direction@entreprise.com"
                    className="w-full bg-[#1b152d] border border-white/15 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-slate-300">
                      Mot de passe *
                    </label>
                    {mode === 'signin' && (
                      <button 
                        type="button" 
                        onClick={() => { setMode('forgot'); setAuthError(null); setAuthSuccessMsg(null); }}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#1b152d] border border-white/15 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>

                  {/* Password strength indicator on signup */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <div className={`h-1 flex-1 rounded-full ${passScore >= 1 ? 'bg-red-500' : 'bg-slate-700'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${passScore >= 2 ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${passScore >= 3 ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${passScore >= 4 ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                      <span className="text-[10px] text-slate-400 ml-1">
                        {passScore <= 1 ? 'Faible' : passScore <= 3 ? 'Moyen' : 'Robuste'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {mode === 'signup' && (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded bg-[#1b152d] border-white/20 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-400 leading-tight">
                    J'accepte les conditions générales d'utilisation et la politique de confidentialité de BizOS.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full mt-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <span>
                      {mode === 'signin' && 'Se Connecter à BizOS'}
                      {mode === 'signup' && 'Créer mon Compte & Vérifier'}
                      {mode === 'forgot' && 'Envoyer le Lien de Réinitialisation'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setAuthError(null); setAuthSuccessMsg(null); }}
                  className="w-full text-center text-xs text-amber-400 hover:underline pt-2"
                >
                  ← Retour à la connexion
                </button>
              )}
            </form>

            {/* Quick Demo Login */}
            <div className="mt-5 p-3 rounded-2xl bg-[#1b152d] border border-white/10">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2 text-center">
                ⚡ Accès Démo Instantané (1-Clic)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickDemo('founder')}
                  className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Directeur RSE</span>
                </button>
                <button
                  onClick={() => handleQuickDemo('executive')}
                  className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Facility Manager</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
