# Guide de Déploiement Google Play Store (Architecture Capacitor Android)

Cette application **BeeCarbonat CAFM & Digital Twin 3D** est configurée pour être compilée en **Android App Bundle (.aab)** et déployée sur la **Google Play Console**.

---

## 1. Structure du Projet Android

- **Configuration Capacitor** : `/capacitor.config.ts`
- **Application ID** : `com.beecarbonat.cafm`
- **Nom de l'application** : `BeeCarbonat CAFM & Digital Twin`
- **Bridge Natif** : `/src/services/nativeCapacitor.ts` (Gestion Status Bar, Haptics 3D, bouton Retour matériel Android)

---

## 2. Commandes de Compilation & Synchronisation

### Étape A : Initialiser le dossier natif Android (si premier déploiement)
```bash
npx cap add android
```

### Étape B : Compiler le code React/Vite et synchroniser avec Android
```bash
npm run cap:build
```

### Étape C : Ouvrir dans Android Studio
```bash
npm run cap:open
```

---

## 3. Génération de l'Android App Bundle (.aab) pour Google Play

Dans **Android Studio** :
1. Allez dans le menu : **Build > Generate Signed Bundle / APK...**
2. Sélectionnez **Android App Bundle (.aab)**
3. Sélectionnez votre **Key Store** (fichier `.jks` sécurisé) et vos mots de passe de signature
4. Choisissez la variante de build : **release**
5. Cliquez sur **Finish** -> Le fichier `.aab` est généré dans `android/app/release/app-release.aab`

---

## 4. Checklist pour la Google Play Console

1. **Compte Développeur Google Play** :
   - Connectez-vous sur [Google Play Console](https://play.google.com/console).
2. **Création de la fiche d'application** :
   - Nom : *BeeCarbonat - CAFM, GMAO & Jumeau Numérique 3D*
   - Langue par défaut : Français / Anglais
   - Catégorie : *Productivité / Entreprise / Outils*
3. **Politique de confidentialité & Autorisations** :
   - URL de confidentialité (ex: `https://votre-domaine.com/privacy`)
   - Permissions : Caméra (scan QR codes équipements GMAO)
4. **Fiche Play Store & Graphismes** :
   - Icône d'application haute résolution : `512 x 512 px` (PNG 32 bits)
   - Bannière graphique : `1024 x 500 px`
   - Captures d'écran smartphone : au moins 2 captures (ex: Scène 3D IFC et Tableau de bord GMAO).
5. **Envoi pour validation** :
   - Importez `app-release.aab` dans le canal **Production** ou **Test Ouvert / Fermé**.
   - Validez le déploiement.
