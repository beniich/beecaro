import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { 
  auth, 
  googleProvider, 
  db, 
  setCachedGoogleAccessToken, 
  getCachedGoogleAccessToken,
  GOOGLE_WORKSPACE_SCOPES 
} from '../lib/firebase';
import { api } from '../services/api';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  companyName?: string;
  phone?: string;
  photoURL?: string;
  role: 'admin' | 'facility_manager' | 'technician' | 'tenant' | 'viewer' | 'PRO';
  subscriptionStatus?: 'active' | 'inactive' | 'past_due' | 'cancelled';
  plan?: 'PRO' | 'ENTERPRISE';
  paypalSubscriptionId?: string;
  domain?: string;
  isVerified?: boolean;
  verificationStatus?: 'verified' | 'pending' | 'unverified';
  lastLoginAt?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  googleAccessToken: string | null;
  jwtToken: string | null;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithEmail: (email: string, pass: string) => Promise<UserCredential>;
  signUpWithEmail: (
    email: string, 
    pass: string, 
    displayName: string, 
    role?: UserProfile['role'],
    companyName?: string,
    phone?: string
  ) => Promise<UserCredential>;
  sendVerificationEmail: () => Promise<void>;
  verifyAccountWithCode: (code: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  customDomain: string;
  logAuditAction: (action: string, category: string, details: string) => Promise<void>;
  formatAuthError: (error: any, lang?: 'fr' | 'en') => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [googleAccessToken, setGoogleAccessTokenState] = useState<string | null>(getCachedGoogleAccessToken());
  const [jwtToken, setJwtToken] = useState<string | null>(localStorage.getItem('token'));
  const customDomain = 'beecarbonat.ricecloud.net';

  const syncBackendSession = async (firebaseUser: User, idToken?: string) => {
    try {
      const tokenToVerify = idToken || await firebaseUser.getIdToken();
      const backendRes = await api.loginWithGoogle(tokenToVerify, {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        photoUrl: firebaseUser.photoURL || '',
        sub: firebaseUser.uid
      });
      if (backendRes?.token) {
        setJwtToken(backendRes.token);
      }
      return backendRes;
    } catch (e) {
      console.warn('[AuthContext] Backend JWT session sync warning:', e);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      }
    } catch (e) {
      console.warn('Could not refresh profile from Firestore:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Sync with Node.js backend for JWT session
          await syncBackendSession(currentUser);

          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            // Update lastLogin
            await setDoc(userDocRef, {
              lastLoginAt: new Date().toISOString()
            }, { merge: true });
          } else {
            // Determine role: default admin for workspace owner email, facility_manager for others
            const initialRole: UserProfile['role'] = 
              currentUser.email === 'beniich.contact@gmail.com' ? 'admin' : 'facility_manager';
            
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Enterprise Operator',
              photoURL: currentUser.photoURL || undefined,
              role: initialRole,
              subscriptionStatus: currentUser.email === 'beniich.contact@gmail.com' ? 'active' : 'inactive',
              plan: currentUser.email === 'beniich.contact@gmail.com' ? 'ENTERPRISE' : undefined,
              domain: customDomain,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }

          // Write audit log entry
          try {
            await addDoc(collection(db, 'audit_logs'), {
              userId: currentUser.uid,
              userEmail: currentUser.email || '',
              action: 'USER_SESSION_ACTIVE',
              category: 'AUTH',
              details: `Session verified via domain ${customDomain}`,
              timestamp: new Date().toISOString()
            });
          } catch (e) {
            // Non-blocking audit
          }

        } catch (err) {
          console.error('Error syncing user profile with Firestore:', err);
          setProfile({
            userId: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Enterprise Operator',
            photoURL: currentUser.photoURL || undefined,
            role: currentUser.email === 'beniich.contact@gmail.com' ? 'admin' : 'facility_manager',
            subscriptionStatus: currentUser.email === 'beniich.contact@gmail.com' ? 'active' : 'inactive',
            domain: customDomain,
            lastLoginAt: new Date().toISOString()
          });
        }
      } else {
        setProfile(null);
        setCachedGoogleAccessToken(null);
        setGoogleAccessTokenState(null);
        localStorage.removeItem('token');
        setJwtToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(cred);
      if (credential?.accessToken) {
        setCachedGoogleAccessToken(credential.accessToken);
        setGoogleAccessTokenState(credential.accessToken);
      }
      
      const idToken = await cred.user.getIdToken();
      await syncBackendSession(cred.user, idToken);

      return cred;
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.error('Google Sign-In Error:', err);
      }
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<UserCredential> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      return cred;
    } catch (err) {
      console.error('Email Sign-In Error:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (
    email: string, 
    pass: string, 
    displayName: string, 
    role: UserProfile['role'] = 'facility_manager',
    companyName?: string,
    phone?: string
  ): Promise<UserCredential> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      
      // Update Auth displayName
      if (displayName) {
        await firebaseUpdateProfile(cred.user, { displayName });
      }

      // Send Firebase Email Verification
      try {
        await sendEmailVerification(cred.user);
      } catch (verifErr) {
        console.warn('Could not auto-send verification email:', verifErr);
      }

      // Create Firestore User Document
      const assignedRole: UserProfile['role'] = 
        email === 'beniich.contact@gmail.com' ? 'admin' : role;

      const newProfile: UserProfile = {
        userId: cred.user.uid,
        email: cred.user.email || email,
        displayName: displayName || email.split('@')[0],
        companyName: companyName || '',
        phone: phone || '',
        photoURL: undefined,
        role: assignedRole,
        domain: customDomain,
        isVerified: false,
        verificationStatus: 'pending',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setProfile(newProfile);

      return cred;
    } catch (err) {
      console.error('Email Sign-Up Error:', err);
      throw err;
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error('Aucun utilisateur connecté');
    await sendEmailVerification(auth.currentUser);
  };

  const verifyAccountWithCode = async (code: string): Promise<boolean> => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    // In standard / sandbox mode: accept OTP verification code (e.g. 6-digit or test code BIZ-2026 or 123456)
    const validCodes = ['BIZ-2026', '123456', '888888'];
    const isValid = code.trim().length === 6 || validCodes.includes(code.trim().toUpperCase());

    if (isValid) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          isVerified: true,
          verificationStatus: 'verified',
          verifiedAt: new Date().toISOString()
        });

        setProfile(prev => prev ? { ...prev, isVerified: true, verificationStatus: 'verified' } : null);
        return true;
      } catch (err) {
        console.warn('Firestore update failed for verification, applying in-memory:', err);
        setProfile(prev => prev ? { ...prev, isVerified: true, verificationStatus: 'verified' } : null);
        return true;
      }
    }
    return false;
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      console.error('Password Reset Error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      if (user) {
        try {
          await addDoc(collection(db, 'audit_logs'), {
            userId: user.uid,
            userEmail: user.email || '',
            action: 'USER_LOGOUT',
            category: 'AUTH',
            details: 'Signed out from session',
            timestamp: new Date().toISOString()
          });
        } catch (e) {}
      }
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign Out Error:', err);
      throw err;
    }
  };

  const logAuditAction = async (action: string, category: string, details: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'audit_logs'), {
        userId: user.uid,
        userEmail: user.email || '',
        action,
        category,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  };

  const formatAuthError = (error: any, lang: 'fr' | 'en' = 'fr'): string => {
    const code = error?.code || '';
    if (lang === 'fr') {
      switch (code) {
        case 'auth/invalid-email':
          return 'Adresse email invalide.';
        case 'auth/user-disabled':
          return 'Ce compte utilisateur a été désactivé.';
        case 'auth/user-not-found':
          return 'Aucun compte trouvé avec cet email.';
        case 'auth/wrong-password':
          return 'Mot de passe incorrect.';
        case 'auth/invalid-credential':
          return 'Identifiants invalides. Vérifiez votre email et mot de passe.';
        case 'auth/email-already-in-use':
          return 'Cet email est déjà associé à un compte existant.';
        case 'auth/weak-password':
          return 'Le mot de passe doit comporter au moins 6 caractères.';
        case 'auth/popup-closed-by-user':
          return 'La fenêtre de connexion Google a été fermée.';
        case 'auth/popup-blocked':
          return 'La fenêtre popup a été bloquée par le navigateur.';
        case 'auth/network-request-failed':
          return 'Erreur de connexion réseau.';
        default:
          return error?.message || 'Une erreur est survenue lors de l\'authentification.';
      }
    } else {
      switch (code) {
        case 'auth/invalid-email':
          return 'Invalid email address format.';
        case 'auth/user-disabled':
          return 'This user account has been disabled.';
        case 'auth/user-not-found':
          return 'No user found with this email.';
        case 'auth/wrong-password':
          return 'Incorrect password.';
        case 'auth/invalid-credential':
          return 'Invalid credentials. Please verify your email and password.';
        case 'auth/email-already-in-use':
          return 'An account already exists with this email.';
        case 'auth/weak-password':
          return 'Password must be at least 6 characters.';
        case 'auth/popup-closed-by-user':
          return 'Google sign-in popup was closed.';
        case 'auth/popup-blocked':
          return 'Sign-in popup was blocked by browser.';
        case 'auth/network-request-failed':
          return 'Network connection error.';
        default:
          return error?.message || 'An error occurred during authentication.';
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      googleAccessToken,
      jwtToken,
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      sendVerificationEmail,
      verifyAccountWithCode,
      resetPassword,
      signOut, 
      refreshProfile,
      customDomain,
      logAuditAction,
      formatAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
