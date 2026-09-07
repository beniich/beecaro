import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const CPANEL_DIR = path.join(ROOT_DIR, 'cpanel-build');

console.log('🚀 Préparation du build pour cPanel...');

// 1. Créer le dossier cpanel-build
if (fs.existsSync(CPANEL_DIR)) {
    fs.rmSync(CPANEL_DIR, { recursive: true, force: true });
}
fs.mkdirSync(CPANEL_DIR, { recursive: true });

// 2. Build des projets (s'assure que tout est à jour)
console.log('📦 Compilation de shared et backend...');
execSync('npm run build --workspace=shared', { stdio: 'inherit', cwd: ROOT_DIR });
execSync('npm run build --workspace=backend', { stdio: 'inherit', cwd: ROOT_DIR });

// 3. Copier les dossiers backend et shared dans cpanel-build
console.log('📂 Copie des fichiers dist...');
const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

// On copie le code compilé de backend
copyRecursiveSync(path.join(ROOT_DIR, 'backend/dist'), path.join(CPANEL_DIR, 'backend/dist'));
// Et le module shared compilé + son package.json pour qu'il soit installable localement
copyRecursiveSync(path.join(ROOT_DIR, 'shared/dist'), path.join(CPANEL_DIR, 'shared/dist'));
fs.copyFileSync(path.join(ROOT_DIR, 'shared/package.json'), path.join(CPANEL_DIR, 'shared/package.json'));

// 4. Créer le package.json racine pour cPanel
console.log('📄 Génération du package.json pour cPanel...');
const backendPkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'backend/package.json'), 'utf8'));

// On remplace le lien du workspace par un lien fichier local pour cPanel
const dependencies = { ...backendPkg.dependencies };
dependencies['@reclamtrack/shared'] = 'file:./shared';

const cpanelPkg = {
    name: "reclamtrack-api",
    version: "1.0.0",
    description: "Backend ReclamTrack pour cPanel",
    type: "module",
    main: "backend/dist/index.js",
    scripts: {
        "start": "node backend/dist/index.js"
    },
    dependencies: dependencies
};

fs.writeFileSync(
    path.join(CPANEL_DIR, 'package.json'),
    JSON.stringify(cpanelPkg, null, 2)
);

// Copier .env
if (fs.existsSync(path.join(ROOT_DIR, '.env'))) {
    fs.copyFileSync(path.join(ROOT_DIR, '.env'), path.join(CPANEL_DIR, '.env'));
    console.log('🔑 Fichier .env copié.');
}

console.log('\n✅ Terminé ! Le dossier "cpanel-build" est prêt.');
console.log('👉 Prochaines étapes :');
console.log('1. Compressez le contenu du dossier "cpanel-build" en un fichier .zip');
console.log('2. Uploadez ce .zip dans votre Gestionnaire de fichiers cPanel (ex: dans /home/user/api)');
console.log('3. Dans cPanel, allez dans "Setup Node.js App"');
console.log('4. Définissez "Application root" vers votre dossier (ex: api)');
console.log('5. Cliquez sur "Run NPM Install" (cPanel lira le package.json généré et installera tout sans erreur)');
console.log('6. Ajoutez votre variable MONGODB_URI dans l\'interface cPanel.');
