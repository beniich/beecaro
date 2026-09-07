export interface AdCampaignPack {
  id: string;
  brand: 'BeeCarbonat' | 'REZIDET' | 'BizOS';
  title: string;
  subtitle: string;
  tagline: string;
  format: '1080x1080 Social' | 'Web Hero 1920x1080' | 'Banner 1200x628' | 'Story 1080x1920' | 'Multi-Format Pack';
  priceBase: number; // in EUR
  estimatedImpressions: number;
  expectedCTR: number; // in %
  co2SavingsEstimate?: string;
  imageUrl: string;
  secondaryImageUrl?: string;
  accentColor: string;
  category: 'Climat & IA' | 'Immobilier & IoT' | 'Multi-Canal' | 'Social Media';
  description: string;
  features: string[];
  recommendedAudiences: string[];
  platforms: ('Instagram' | 'Facebook' | 'LinkedIn' | 'Google Ads' | 'Display B2B')[];
  badge?: string;
}

export interface AdCartItem {
  id: string;
  pack: AdCampaignPack;
  budgetPerDay: number;
  durationDays: number;
  selectedPlatforms: ('Instagram' | 'Facebook' | 'LinkedIn' | 'Google Ads' | 'Display B2B')[];
  targetAudience: string;
  customHeadline?: string;
  customCta?: string;
  subtotal: number;
}

export const initialAdPacks: AdCampaignPack[] = [
  {
    id: 'beecarbonat-social-1080',
    brand: 'BeeCarbonat',
    title: "L'intelligence au service du climat",
    subtitle: "Maximize Sustainability ROI with BeeCarbonat's AI-driven platform",
    tagline: "Greener Future: 100% Tracked • Measurable Impact. Optimized ROI.",
    format: '1080x1080 Social',
    priceBase: 490,
    estimatedImpressions: 450000,
    expectedCTR: 3.8,
    co2SavingsEstimate: '-45% Empreinte Carbone',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRv3jJhpt9YAV4JcxXYZZ0XGiCUse8p5dFmKrvKC7r10twaoyb-FusYO16b2ZkZiYqR8-Drops92kKze-BCfL7B4vTPFFCJIQm0wHFq7oYJsd4yC4ph2t5DEWEYPvbAgt18ycHUv5e4tFXNnBd3fTfTmBoZ0-HAaB_QiHNTYpHTxued5t7VUWHqtYNrpJf7B-DqOTF6Mh5FGHJxvt9iUFMte6y7Tr-ANdu1o-cLLaF3GEZEQZKfDKUjg',
    accentColor: '#ff8a00',
    category: 'Climat & IA',
    badge: 'TOP VENTE PUB',
    description: 'Campagne haute visibilité sur Meta (Instagram / Facebook) et LinkedIn ciblant les directeurs RSE, CFOs et décideurs CleanTech.',
    features: [
      'Format optimisé 1080x1080 Carré Ultra-Glow',
      'Badge interactif "Greener Future: 100% Tracked"',
      'Ciblage automatique des décideurs RSE & PropTech',
      'Rapport d’impact carbone & ROI publicitaire en temps réel'
    ],
    recommendedAudiences: ['Directeurs RSE / ESG', 'Dirigeants de PME & ETI', 'Gestionnaires Immobiliers & Bâtiments'],
    platforms: ['Instagram', 'Facebook', 'LinkedIn']
  },
  {
    id: 'beecarbonat-eco-city',
    brand: 'BeeCarbonat',
    title: "Réduisez votre empreinte avec l'IA",
    subtitle: "Suivi Carbone & Intelligence Environnementale en temps réel",
    tagline: "Pilotez vos émissions Scope 1, 2 et 3 avec nos modèles prédictifs.",
    format: 'Multi-Format Pack',
    priceBase: 850,
    estimatedImpressions: 890000,
    expectedCTR: 4.2,
    co2SavingsEstimate: '-45% CO2 Réduit',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRv3jJhpt9YAV4JcxXYZZ0XGiCUse8p5dFmKrvKC7r10twaoyb-FusYO16b2ZkZiYqR8-Drops92kKze-BCfL7B4vTPFFCJIQm0wHFq7oYJsd4yC4ph2t5DEWEYPvbAgt18ycHUv5e4tFXNnBd3fTfTmBoZ0-HAaB_QiHNTYpHTxued5t7VUWHqtYNrpJf7B-DqOTF6Mh5FGHJxvt9iUFMte6y7Tr-ANdu1o-cLLaF3GEZEQZKfDKUjg',
    accentColor: '#ff8a00',
    category: 'Climat & IA',
    badge: 'RECOMMANDÉ',
    description: 'Pack complet intégrant la ville éco-connectée isométrique, les panneaux solaires intelligents et l’indicateur de réduction d’empreinte -45%.',
    features: [
      'Visuel 3D Isométrique Ultra-Glow ville connectée',
      'Jauge interactive de réduction -45% Carbone',
      'Déploiement simultané Google Display & Réseaux Sociaux',
      'A/B Testing de conversion généré par IA'
    ],
    recommendedAudiences: ['Directeurs Financiers', 'Directeurs du Développement Durable', 'Collectivités & Smart Cities'],
    platforms: ['LinkedIn', 'Google Ads', 'Display B2B', 'Instagram']
  },
  {
    id: 'rezidet-smart-warehouse',
    brand: 'REZIDET',
    title: "Maîtrisez chaque mètre carré",
    subtitle: "Optimisez la gestion et la sécurité de vos actifs et de vos opérations",
    tagline: "RFID, serrures intelligentes, capteurs temps réel et sécurité des actifs.",
    format: '1080x1080 Social',
    priceBase: 620,
    estimatedImpressions: 520000,
    expectedCTR: 3.6,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb5WTbdxJl-DhHwwTV0nLCvLZgAtGhFbq7PvSyP-LmMU7uyYZZM3cC3jDAapnz4gzAJtzTzUY0LE3Q-P1qG7GSvUWHL9quauetpaCYOL6w2gzO-1owsjos813yiVW4NCBkQUJvd82ARL0PM8RrKPqKM7JyIpt2yCDAwaTjjgt8Ju01utbzUcYdZmXOXmVJ_AY-X-hR2RzCtjWRz8rSptpS-OC1YFPhDYujHJp2-xaqkBNZUPXQPxZsXQ',
    accentColor: '#ff9a1f',
    category: 'Immobilier & IoT',
    badge: 'ENTREPRISE B2B',
    description: 'Visuel haute technologie mettant en avant l’entrepôt connecté, les puces RFID, les serveurs informatiques et la sécurité périmétrique.',
    features: [
      'Schéma interactif circuit imprimé & entrepôt connecté',
      'Mise en valeur de la traçabilité RFID & biométrique',
      'Campagne ciblée directeurs logistiques et supply chain',
      'Intégration d’un formulaire de prise de démo directe'
    ],
    recommendedAudiences: ['Directeurs Supply Chain & Logistique', 'Facility Managers', 'Directeurs des Opérations'],
    platforms: ['LinkedIn', 'Display B2B', 'Facebook']
  },
  {
    id: 'rezidet-savings-roi',
    brand: 'REZIDET',
    title: "Transformez vos coûts en levier de croissance",
    subtitle: "+30% SAVINGS sur vos coûts immobiliers réduits",
    tagline: "Approuvé par 500+ entreprises pour optimiser leur ROI immobilier.",
    format: '1080x1080 Social',
    priceBase: 580,
    estimatedImpressions: 610000,
    expectedCTR: 4.5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2wWFKTQzy91-zp8dA4Ir3IkRx-2MbEK6PlbjGaYIh-ZA3GgDBMAZ5vBGpLLZ9RG1q6WBcovqjJt6t8uWMbTQWFjDL19BpKf6tEwNo23NvlNwPiMcMp1qLWUnxEq16MUGoVLYJtuoB_eFyzGJ77Yx4DDUQsyXnLId0hD4QJIwntoxRhg_nZtamMParh-wBw7kt0Lv0ybk3jDcnE9JKWkPxF_4rCEaxiMskhKb_TznfuQdvQiaEQHv39w',
    accentColor: '#ff8a00',
    category: 'Immobilier & IoT',
    badge: 'FORTE CONVERSION',
    description: 'Bannière axée sur le ROI financier immédiat (+30% Savings) et la skyline urbaine connectée pour attirer les décideurs financiers.',
    features: [
      'Call to action marquant "Demandez une démo"',
      'Badge graphique 3D "+30% SAVINGS Coûts Immobiliers"',
      'Génération de leads qualifiés B2B',
      'Tunnel de conversion optimisé mobile et desktop'
    ],
    recommendedAudiences: ['Directeurs Immobiliers / Real Estate', 'CFO & Contrôleurs de Gestion', 'Investisseurs Fonciers'],
    platforms: ['LinkedIn', 'Google Ads', 'Instagram']
  },
  {
    id: 'rezidet-ai-buildings',
    brand: 'REZIDET',
    title: "L'intelligence artificielle au service de vos bâtiments",
    subtitle: "Réseau neuronal de capteurs IoT, énergie et maintenance prédictive",
    tagline: "Un cerveau centralisé pour piloter température, sécurité, et maintenance.",
    format: 'Multi-Format Pack',
    priceBase: 740,
    estimatedImpressions: 720000,
    expectedCTR: 3.9,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2wWFKTQzy91-zp8dA4Ir3IkRx-2MbEK6PlbjGaYIh-ZA3GgDBMAZ5vBGpLLZ9RG1q6WBcovqjJt6t8uWMbTQWFjDL19BpKf6tEwNo23NvlNwPiMcMp1qLWUnxEq16MUGoVLYJtuoB_eFyzGJ77Yx4DDUQsyXnLId0hD4QJIwntoxRhg_nZtamMParh-wBw7kt0Lv0ybk3jDcnE9JKWkPxF_4rCEaxiMskhKb_TznfuQdvQiaEQHv39w',
    accentColor: '#ff9800',
    category: 'Immobilier & IoT',
    description: 'Bannière avec sphère IA centrale lumineuse connectée à une constellation de capteurs intelligents et actionneurs de bâtiments.',
    features: [
      'Graphisme sphère centrale IA haute résolution',
      'Maillage IoT & capteurs environnementaux animés',
      'Format adapté display programmatique et carrousel',
      'Suivi automatisé du coût par acquisition (CPA)'
    ],
    recommendedAudiences: ['Directeurs Techniques & Maintenance', 'Bureaux d’Études Énergie', 'Promoteurs Immobiliers'],
    platforms: ['LinkedIn', 'Display B2B', 'Google Ads']
  },
  {
    id: 'beecarbonat-hero-full-web',
    brand: 'BeeCarbonat',
    title: "BeeCarbonat Web Platform Experience",
    subtitle: "Environmental Sustainability Platform for a Greener Future",
    tagline: "Plateforme complète avec Navbar Glass, Hero 3D, Suivi Carbone et IA Prédictive.",
    format: 'Web Hero 1920x1080',
    priceBase: 990,
    estimatedImpressions: 1200000,
    expectedCTR: 4.8,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRv3jJhpt9YAV4JcxXYZZ0XGiCUse8p5dFmKrvKC7r10twaoyb-FusYO16b2ZkZiYqR8-Drops92kKze-BCfL7B4vTPFFCJIQm0wHFq7oYJsd4yC4ph2t5DEWEYPvbAgt18ycHUv5e4tFXNnBd3fTfTmBoZ0-HAaB_QiHNTYpHTxued5t7VUWHqtYNrpJf7B-DqOTF6Mh5FGHJxvt9iUFMte6y7Tr-ANdu1o-cLLaF3GEZEQZKfDKUjg',
    accentColor: '#ff8a00',
    category: 'Multi-Canal',
    badge: 'PACK SUITE COMPLÈTE',
    description: 'La page d’atterrissage interactive complète BeeCarbonat avec intégration du panier publicitaire, du formulaire d’inscription et du tracking temps réel.',
    features: [
      'Header Flottant Glass-Panel avec Logo Bee et Navigation',
      'Hero text avec effet Glow orange et illustration Isométrique',
      'Cartes de fonctionnalités interactives (Suivi Carbone & IA)',
      'Tunnel d’achat publicitaire et panier de commande intégré'
    ],
    recommendedAudiences: ['Grand Public Éco-Engagé', 'Entreprises B2B / ESG', 'Investisseurs Impact'],
    platforms: ['Google Ads', 'LinkedIn', 'Instagram', 'Facebook', 'Display B2B']
  }
];
