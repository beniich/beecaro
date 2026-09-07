#!/usr/bin/env node
/**
 * @file deploy-cloudflare.mjs
 * @description Script de déploiement ReclamTrack vers Cloudflare Pages (frontend)
 *              et vers cPanel (backend API).
 *
 * Usage:
 *   node scripts/deploy-cloudflare.mjs --target=frontend   (Cloudflare Pages)
 *   node scripts/deploy-cloudflare.mjs --target=backend    (cPanel SSH)
 *   node scripts/deploy-cloudflare.mjs --target=all        (les deux)
 *
 * Prérequis:
 *   1. Créer un fichier .cloudflare.env à la racine du projet
 *   2. Contenu : CF_API_TOKEN=..., CF_ACCOUNT_ID=..., CF_PROJECT_NAME=...
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// ──────────────────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────────────────
const ROOT = process.cwd();
const FRONTEND_DIR = path.join(ROOT, 'frontend');
const SHARED_DIR = path.join(ROOT, 'shared');

// Charger les variables Cloudflare depuis .cloudflare.env
const cfEnvPath = path.join(ROOT, '.cloudflare.env');
if (fs.existsSync(cfEnvPath)) {
    dotenv.config({ path: cfEnvPath });
} else {
    dotenv.config({ path: path.join(ROOT, 'cpanel.env') });
}

const {
    CF_API_TOKEN,
    CF_ACCOUNT_ID,
    CF_PROJECT_NAME = 'reclamtrack',
    CF_BRANCH = 'main',
} = process.env;

// ──────────────────────────────────────────────────────────
// Utilitaires
// ──────────────────────────────────────────────────────────
function log(icon, msg, color = '\x1b[36m') {
    console.log(`${color}${icon}  ${msg}\x1b[0m`);
}
function success(msg) { log('✅', msg, '\x1b[32m'); }
function info(msg)    { log('ℹ️ ', msg, '\x1b[36m'); }
function warn(msg)    { log('⚠️ ', msg, '\x1b[33m'); }
function error(msg)   { log('❌', msg, '\x1b[31m'); }

function run(cmd, cwd = ROOT, label = '') {
    if (label) info(`Exécution : ${label}`);
    try {
        execSync(cmd, { cwd, stdio: 'inherit', shell: true });
        return true;
    } catch (e) {
        error(`Échec : ${label || cmd}`);
        return false;
    }
}

// ──────────────────────────────────────────────────────────
// Étape 1 : Build du shared package
// ──────────────────────────────────────────────────────────
async function buildShared() {
    info('Build du package @reclamtrack/shared...');
    if (!run('npm run build', SHARED_DIR, 'tsc shared')) {
        throw new Error('Échec du build shared');
    }
    success('Shared package compilé !');
}

// ──────────────────────────────────────────────────────────
// Étape 2 : Build du frontend Next.js
// ──────────────────────────────────────────────────────────
async function buildFrontend() {
    info('Build du frontend Next.js...');
    if (!run('npm run build', FRONTEND_DIR, 'next build')) {
        throw new Error('Échec du build frontend');
    }
    success('Frontend compilé !');
}

// ──────────────────────────────────────────────────────────
// Étape 3 : Déploiement sur Cloudflare Pages via Wrangler
// ──────────────────────────────────────────────────────────
async function deployToCloudflare() {
    info('Déploiement vers Cloudflare Pages...');

    if (!CF_API_TOKEN) {
        error('CF_API_TOKEN manquant dans .cloudflare.env');
        error('Obtenez votre token : https://dash.cloudflare.com/profile/api-tokens');
        throw new Error('Config Cloudflare manquante');
    }

    if (!CF_ACCOUNT_ID) {
        error('CF_ACCOUNT_ID manquant dans .cloudflare.env');
        error('Trouvez votre Account ID dans le dashboard Cloudflare (colonne droite)');
        throw new Error('Config Cloudflare manquante');
    }

    // Dossier de sortie Next.js
    const outDir = fs.existsSync(path.join(FRONTEND_DIR, 'out'))
        ? path.join(FRONTEND_DIR, 'out')
        : path.join(FRONTEND_DIR, '.next');

    const deployCmd = [
        'npx wrangler pages deploy',
        `"${outDir}"`,
        `--project-name=${CF_PROJECT_NAME}`,
        `--branch=${CF_BRANCH}`,
        '--commit-dirty=true',
    ].join(' ');

    info(`Dossier déployé : ${outDir}`);
    info(`Projet Cloudflare : ${CF_PROJECT_NAME}`);
    info(`Branche : ${CF_BRANCH}`);

    // Injecter le token dans l'environnement
    process.env.CLOUDFLARE_API_TOKEN = CF_API_TOKEN;
    process.env.CLOUDFLARE_ACCOUNT_ID = CF_ACCOUNT_ID;

    if (!run(deployCmd, FRONTEND_DIR, 'wrangler pages deploy')) {
        throw new Error('Échec du déploiement Cloudflare Pages');
    }

    success(`Frontend déployé sur Cloudflare Pages !`);
    success(`URL : https://${CF_PROJECT_NAME}.pages.dev`);
}

// ──────────────────────────────────────────────────────────
// Étape 4 : Déploiement backend sur cPanel (bonus)
// ──────────────────────────────────────────────────────────
async function deployBackend() {
    info('Déploiement du backend (cPanel)...');
    const backendScript = path.join(ROOT, 'scripts', 'deploy-cpanel.mjs');
    if (!fs.existsSync(backendScript)) {
        warn('Script deploy-cpanel.mjs introuvable, backend non déployé.');
        return;
    }
    if (!run(`node "${backendScript}"`, ROOT, 'deploy-cpanel')) {
        warn('Déploiement backend échoué — vérifiez cpanel.env');
    } else {
        success('Backend déployé sur cPanel !');
    }
}

// ──────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const targetArg = args.find(a => a.startsWith('--target='));
    const target = targetArg ? targetArg.split('=')[1] : 'frontend';

    console.log('\n\x1b[35m╔══════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[35m║   ReclamTrack — Déploiement Cloudflare Pages  ║\x1b[0m');
    console.log('\x1b[35m╚══════════════════════════════════════════════╝\x1b[0m\n');

    info(`Cible : ${target.toUpperCase()}`);
    info(`Dossier racine : ${ROOT}`);
    info(`Projet CF Pages : ${CF_PROJECT_NAME}`);
    console.log('');

    const startTime = Date.now();

    try {
        if (target === 'frontend' || target === 'all') {
            await buildShared();
            await buildFrontend();
            await deployToCloudflare();
        }

        if (target === 'backend' || target === 'all') {
            await deployBackend();
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('');
        console.log('\x1b[32m╔══════════════════════════════════════════╗\x1b[0m');
        console.log(`\x1b[32m║  ✅  Déploiement terminé en ${elapsed}s        ║\x1b[0m`);
        console.log('\x1b[32m╚══════════════════════════════════════════╝\x1b[0m\n');

    } catch (e) {
        console.log('');
        error(`Déploiement échoué : ${e.message}`);
        process.exit(1);
    }
}

main();
