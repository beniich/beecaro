import { IntegrationApp, EmailItem, TranscriptItem, ArchitectureNode, PricingPlan, BiometricState } from '../types/bizos';

export const initialBiometrics: BiometricState = {
  hrvBaseline: 42,
  recoveryScore: 38,
  cognitiveLoad: 'Elevated',
  stressLevel: 'Moderate',
  wearableConnected: 'Apple Watch',
  batteryLevel: 88,
  lastSyncTime: '2 min ago',
  recommendedAction: 'Recovery is 38%. Rescheduling non-essential meetings to tomorrow. 45 min deep rest recommended.'
};

export const mockArchitectureNodes: Record<string, ArchitectureNode> = {
  core: {
    id: 'core',
    title: 'VitalAI Core',
    label: 'VitalAI Core',
    icon: 'hub',
    color: 'text-primary',
    text: 'The central nervous system. Processes inputs from all modules to generate predictive insights and automate cross-departmental workflows, maintaining cognitive clarity for leadership.',
    metrics: '99.4% Synthesized Clarity • 14ms Global Latency',
    connectedNodes: ['sales', 'hr', 'finance', 'ops']
  },
  sales: {
    id: 'sales',
    title: 'Sales Intelligence',
    label: 'Sales',
    icon: 'monitoring',
    color: 'text-secondary',
    text: 'Analyzes client sentiment, pipeline velocity, and conversion probabilities. Feeds real-time revenue projections directly into the Finance module.',
    metrics: '94% Pipeline Win Prediction • $1.2M Unlocked ARR',
    connectedNodes: ['core', 'finance']
  },
  hr: {
    id: 'hr',
    title: 'Human Capital & Bandwidth',
    label: 'HR',
    icon: 'groups',
    color: 'text-tertiary',
    text: 'Manages the employee lifecycle. Triggers automated provisioning in Ops and updates capacity planning in Core when new hires are onboarded.',
    metrics: '85% Team Bandwidth • 0-Click Provisioning',
    connectedNodes: ['core', 'ops']
  },
  finance: {
    id: 'finance',
    title: 'Dynamic Finance',
    label: 'Finance',
    icon: 'account_balance',
    color: 'text-primary',
    text: 'Replaces static spreadsheets. Constantly recalibrates cash flow and runway based on live inputs from Sales and HR modules.',
    metrics: '18 Mo Runway • Live Burn Rate Calibrated',
    connectedNodes: ['core', 'sales']
  },
  ops: {
    id: 'ops',
    title: 'Automated Operations',
    label: 'Ops',
    icon: 'settings_suggest',
    color: 'text-secondary',
    text: 'The execution engine. Handles software provisioning, access management, and routine logistical tasks triggered by other modules.',
    metrics: '42 Active Sequences • 100% Zero-Touch',
    connectedNodes: ['core', 'hr']
  }
};

export const mockIntegrations: IntegrationApp[] = [
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    category: 'Productivity',
    description: 'Real-time two-way synchronization with Gmail, Google Calendar, Drive, and Meet.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFbQRo6nrQdHAlIS_Z6Q1zAvcRxPXasKkOKO5tQA3EUO8sD1B6-Y0XFEm85O9aRQDosguOxjAm6E-IssOG2RYH8KR2Npwx2ZpoX9gj8L50kPvUcqgZVa1dESRP60E_S5y2DCnKuANFp48QHIp948tCzPRcfuelkGorZLqIVHurZPDFm5ymzlRW4Xc-nW-uLsKbp9JF2cKEd-dwSPJnnoVOwopTJc0Z9wRsFsbEj-e3sNjt2biwDm47AQ',
    isPopular: true,
    connected: true,
    colorBorder: 'border-primary/40',
    dataFlowRate: '124 events/min',
    capabilities: ['InboxAI Deep Sync', 'Calendar Auto-Protection', 'Drive Doc Extraction']
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Instant meeting takeaways, executive digests, and cognitive break triggers straight into channels.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfNCcMKiM-ndtyWE0qqX8Dqhss90jIdOVmMZJ3BK2CowuJXNINGvXEudRozkxsTYCl1LO7Ko0b08e3_I6uIKhIqBK6TdCB0VjeUX6n0SAdAqn0FAA6Ovvj0mO209xa1XDJ5FGcnjh_k_Gshkmy4EdygP6JfLsbYVIigDlEb9fzSnhxBP9UwPAAJwozEUfmSClbreRQ2HhsvlFC-4ResiaUnvhDC0_CFpmypRVyJhW0DAxb8wL-3VwHw',
    isPopular: true,
    connected: true,
    colorBorder: 'border-secondary/40',
    dataFlowRate: '88 msgs/sec',
    capabilities: ['MeetAI Bot in #engineering', 'Urgent Ping Filtering', 'Founder Status Broadcast']
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    description: 'Auto-generates structured documentation, meeting notes databases, and strategy docs.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPWJaq6IQGWDtC_woc8U7uXx66but34ZEZJ6EIBPVmBKQA1goEVJtfvzhASuj3ms1vP-uosYx74kwWSPKs_gNM4pLycblqdD4qEYmT-ZVgRD4iTt9vGzNETavPT9r891tGN7VUron1ObktOIyoMBVjwxzjnYsjr6ZYD9FT1JFFSDpjF2gY6rwbaWvMoMdzHMrqFuH9AcZnLc1k-lDNtTACEhSk65idMXIzZVeVn4C9NLanYcSf4qRS_g',
    isPopular: true,
    connected: false,
    colorBorder: 'border-primary/40',
    dataFlowRate: '12 pages/day',
    capabilities: ['Auto-wiki synthesis', 'Action item synchronization', 'Roadmap alignment']
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    description: 'Bi-directional pipeline updates, executive call transcripts, and automated deal stage elevation.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwXRY2C8vh7mlomARmiZv0s9JUYJNbzc6CjF1XCCZs4RUqRi56HncHfZvHWkNOp4U5TCYJBNKzv6bc_gs7Eutjlk-trCYtB0eIvSGF91phKxVjN8rZOti9MEqBaU1TUmzLF6om_eQXSEtS-ZhzV6fB2M9PeLW8WRQCBKqG5gxY_F3hpTmWZ3jvhOw9cNnKk25MnHT3GCo6lkIz38TG7A7CvPAJZZaZOyWClQ3nFhFQQti4_KWjvnXGQw',
    isPopular: true,
    connected: true,
    colorBorder: 'border-secondary/40',
    dataFlowRate: '340 contacts/hr',
    capabilities: ['Predictive pipeline velocity', 'Contact sentiment radar', 'Automated meeting prep']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    description: 'Enterprise CRM data enrichment, opportunity health scoring, and stakeholder alignment graphs.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHLqaAKBcnDNJL28pwQ95aI3sNyA5yfj_EcBSQ088iFH8kcFacgQTLdyWsvCYEgpoObkuTLirtesN4-uuQ4Dvl5SfCNF1u2pp6jgR1zbMfiBJbEqk-JTxXq8iWONBxQXP50S0KQ3L-qVg0Gd_JnRv-mdYepaa78nNZlP3iwxFayceomjcHzoiOaW3nJnN_GR3GVkTzXZB5bHF3kGgST6Nv564rNKxbpaYTCVVK3_xFK2LkRzsFuAw9pQ',
    isPopular: true,
    connected: false,
    colorBorder: 'border-primary/40',
    dataFlowRate: 'Custom API sync',
    capabilities: ['Enterprise Graph', 'Multi-stakeholder mapping', 'ACV prediction']
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'Communication',
    description: 'Live audio stream ingestion with ultra-fast diarization and real-time cognitive coaching overlay.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5rpeuyLMRwnGuGSmv4cFlA_2q_FkIfT4CWxjsQJNwZP88mFsW1zbQHVomVd1mLfaXU8kYDibHE2wizAFyMBJp2QfwfhRkzquoHT4lsBLG0-LsIfzezagiChQwxyYHQe8x69DnF6GCxgfSFCXDglbjRL6RxMLoGwwDwRUqi2vC5Itzl2lBc2pgoLSyy48CqFCWPyWeNu1YHeGgKSwSuDthwotnaqXg0tdV4Bt0X40CuPKFXfKxtjZWUA',
    isPopular: true,
    connected: true,
    colorBorder: 'border-primary/40',
    dataFlowRate: 'Live audio stream',
    capabilities: ['99.8% Diarization', 'Sentiment live gauge', 'Objection handling assistant']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Finance',
    description: 'Live MRR, ARR, churn acceleration, and burn calibration feeding directly into ExitReady valuation models.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNhXe0XtNChy_1EbL5GipoBUUq-cBQM0QLTStLd3kurh7KBNRBE4fsNUEMhE9Ryw86ptxQZiX4Vr-kfhFyRfbfL_dg0lKT7GYqSwQztMIj2iMdxuLiGjM__2U8OR-uNmwM5vNSE35fLweaX6kieHbn7VAQUh4Rl03BtYH6Awn5EK2LjFkzRwdYaJY2yiE0Ku9ti4CE1r4XkMcPPidzp1T3ndytsX43ISlPrg6M0kFzCeEApCmh49hn9w',
    isPopular: true,
    connected: true,
    colorBorder: 'border-primary/40',
    dataFlowRate: 'Live webhook stream',
    capabilities: ['Instant ARR telemetry', 'LTV/CAC ratio auto-calc', 'Runway scenario modeling']
  },
  {
    id: 'jira',
    name: 'Jira',
    category: 'Productivity',
    description: 'Converts meeting decisions and customer feedback into prioritized sprint tickets automatically.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBy1CV86P_wd22Rw968hgPJV68A8YdDYGQPr7mAVoWQvli9s9aqbur3mQi0pepVBZ2LN8WcIBf5mdxOCfUJIqVQpzW8Wlqn1OvU0v30qRzQyb4CvDAWNec99TEkvK91syOpjwH2lukFGAMNoCdfAckU7YEvds5JbHZntV3CSV2G696Ex9ggBaDH3-q-DBxSnkJKgzm_PsKU_xCky3CEO6qkum6wMONo2JZVzBTOJt8HGMq5J4Lh0Jp6CA',
    isPopular: true,
    connected: false,
    colorBorder: 'border-secondary/40',
    dataFlowRate: 'Real-time webhook',
    capabilities: ['Autonomous ticket drafting', 'Velocity prediction', 'Dependency graphing']
  },
  {
    id: 'linear',
    name: 'Linear',
    category: 'Productivity',
    description: 'Blazing fast issue creation, cycle tracking, and project health metrics synced directly to founder dashboards.',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    isPopular: true,
    connected: true,
    colorBorder: 'border-primary/40',
    dataFlowRate: 'Instant sync',
    capabilities: ['Fast task ingestion', 'Cycle velocity sync', 'AI bug triage']
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'Productivity',
    description: 'Extract design comments, review requests, and prototype milestones into project roadmaps.',
    logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100&auto=format&fit=crop&q=80',
    isPopular: false,
    connected: false,
    colorBorder: 'border-secondary/40',
    dataFlowRate: 'On-demand sync',
    capabilities: ['Design milestone tracking', 'Client feedback parsing', 'Asset indexing']
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Productivity',
    description: 'Track PR velocity, release readiness, and engineering bandwidth for high-accuracy product milestones.',
    logo: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=100&auto=format&fit=crop&q=80',
    isPopular: true,
    connected: true,
    colorBorder: 'border-primary/40',
    dataFlowRate: 'Live repo webhooks',
    capabilities: ['Release velocity tracking', 'Code review bottlenecks', 'Dev capacity scoring']
  },
  {
    id: 'wordpress',
    name: 'WordPress (Plugin Officiel)',
    category: 'Productivity',
    description: 'Plugin WordPress prêt à installer (.zip) pour intégrer les cockpits BeeCarbonat, le marché carbone et la GMAO via le shortcode [beecarbonat] ou dans wp-admin.',
    logo: 'https://s.w.org/style/images/about/WordPress-logotype-wmark.png',
    isPopular: true,
    connected: true,
    colorBorder: 'border-primary/40',
    dataFlowRate: 'Extension ZIP v1.0.0',
    capabilities: ['Shortcode [beecarbonat]', 'Gutenberg & Elementor', 'Menu wp-admin direct', 'Téléchargement direct .zip']
  },
  {
    id: 'posthog',
    name: 'PostHog / Mixpanel',
    category: 'Analytics',
    description: 'User engagement curves and retention anomalies tied to product experiments.',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    isPopular: false,
    connected: true,
    colorBorder: 'border-secondary/40',
    dataFlowRate: 'Telemetry stream',
    capabilities: ['Activation funnel analysis', 'Retention health score', 'Feature adoption radar']
  }
];

export const mockStandardEmails: EmailItem[] = [
  {
    id: 'email-1',
    sender: 'Marketing Newsletter',
    senderInitials: 'MN',
    email: 'deals@summerblast.io',
    subject: "Don't miss our summer sale! 50% off all items...",
    snippet: "Our biggest blowout of the season is here. Use code FLASH50 at checkout.",
    time: '9:41 AM',
    category: 'Newsletter'
  },
  {
    id: 'email-2',
    sender: 'Client: Sarah Jenkins',
    senderInitials: 'SJ',
    email: 'sarah.jenkins@acmecorp.com',
    subject: 'URGENT: Contract review needed before Q3 close...',
    snippet: 'Hey Alexandre, we need the revised SLA terms signed by today at 5 PM to get board approval.',
    time: 'Yesterday',
    category: 'High Priority',
    tag: 'Contract',
    sentiment: 'Urgent',
    suggestedReply: "Hi Sarah,\n\nI've reviewed the updated SLA clauses with our legal counsel and everything looks solid. Signed agreement attached.\n\nBest,\nAlexandre"
  },
  {
    id: 'email-3',
    sender: 'Internal IT Support',
    senderInitials: 'IT',
    email: 'noreply-it@corp.internal',
    subject: 'Server maintenance scheduled for this weekend. Expect downtime...',
    snippet: 'All non-critical databases will undergo security patching between 02:00 and 06:00 UTC.',
    time: 'Tuesday',
    category: 'System'
  },
  {
    id: 'email-4',
    sender: 'Lunch Order Robot',
    senderInitials: 'LR',
    email: 'orders@cateringbot.app',
    subject: 'Your order has been placed and will arrive at 12:30.',
    snippet: 'Mediterranean grain bowl + sparkling water is scheduled for delivery.',
    time: 'Monday',
    category: 'System'
  }
];

export const mockMeetingTranscript: TranscriptItem[] = [
  {
    id: 't-1',
    speaker: 'Sarah (Product)',
    speakerRole: 'VP Product',
    speakerInitials: 'S',
    avatarColor: 'text-primary',
    time: '10:04 AM',
    text: 'We need to finalize the roadmap by Friday. Are we aligned on pushing the AI integrations to Phase 2?'
  },
  {
    id: 't-2',
    speaker: 'Marcus (Engineering)',
    speakerRole: 'Head of Engineering',
    speakerInitials: 'M',
    avatarColor: 'text-secondary',
    time: '10:05 AM',
    text: "Yes, that gives the data team breathing room. I'll document the API requirements for Phase 1 by tomorrow end of day.",
    actionItem: {
      title: 'Document API requirements for Phase 1',
      assignee: 'Marcus',
      dueDate: 'Tomorrow',
      confidence: 0.99
    }
  },
  {
    id: 't-3',
    speaker: 'Alexandre (Founder)',
    speakerRole: 'CEO',
    speakerInitials: 'A',
    avatarColor: 'text-tertiary',
    time: '10:07 AM',
    text: 'Approved. Make sure the enterprise security specs are locked in first so we don’t block the Lumina pilot.'
  },
  {
    id: 't-4',
    speaker: 'Sarah (Product)',
    speakerRole: 'VP Product',
    speakerInitials: 'S',
    avatarColor: 'text-primary',
    time: '10:08 AM',
    text: 'Got it. I will sync with Lumina’s CTO on Thursday at 2 PM to confirm their SOC2 requirements.',
    actionItem: {
      title: 'Confirm SOC2 requirements with Lumina CTO',
      assignee: 'Sarah',
      dueDate: 'Thursday 2 PM',
      confidence: 0.98
    }
  }
];

export const mockPricingPlans: PricingPlan[] = [
  {
    id: 'free-bee',
    name: 'FREE.bee',
    badge: 'Découverte & Solo',
    priceMonthly: 24,
    priceAnnually: 19,
    description: 'Digital Newspapers - downloadable - non subscription - with permanent rights & accès découverte.',
    features: [
      'Digital Newspapers & Rapports téléchargeables',
      'Droits d\'usage permanents sans expiration',
      'InboxAI Standard (1 compte connecté, tri IA basique)',
      'MeetAI Transcription (5h d\'enregistrements / mois)',
      'Synchronisation des wearables & score de clarté',
      'Accès web sécurisé & support communautaire'
    ],
    cta: 'Démarrer avec FREE.bee'
  },
  {
    id: 'starter-bee',
    name: 'Starter.bee',
    badge: 'Solopreneurs & PME',
    priceMonthly: 65,
    priceAnnually: 52,
    description: 'Digital Newspapers - downloadable - non subscription - with permanent rights & automatisation pour indépendants.',
    features: [
      'Toutes les options FREE.bee incluses',
      'InboxAI Avancé avec apprentissage de style (3 comptes)',
      'MeetAI Transcriptions étendues (25h / mois) & extraction des actions',
      'Bouclier de calendrier automatique & synchronisation continue',
      'Intégrations Slack, Google Workspace & Notion',
      'Export PDF/EPUB haute définition avec droits permanents',
      'Support prioritaire par email sous 24h'
    ],
    cta: 'Choisir Starter.bee'
  },
  {
    id: 'pro-bee',
    name: 'pro.bee',
    badge: 'Le Plus Populaire',
    priceMonthly: 125,
    priceAnnually: 99,
    description: 'Digital Newspapers - downloadable - non subscription - with permanent rights & OS opérationnel complet pour équipes en croissance.',
    features: [
      'Architecture symbiotique complète (Ventes, RH, Finance, Ops)',
      'InboxAI & MeetAI illimités avec 99.8% de précision de diarisation',
      'CallCopilot en direct pour pitchs, négociations et investisseurs',
      'Toutes les intégrations Cloud (Stripe, HubSpot, Linear, Jira, Zoom)',
      'Téléchargements illimités de rapports stratégiques & journaux pro',
      'Chambre de données M&A et valorisation continue',
      'Support prioritaire 24/7 & gestionnaire de succès dédié'
    ],
    cta: 'Souscrire à pro.bee',
    highlighted: true
  },
  {
    id: 'business-bee',
    name: 'business.bee',
    badge: 'Grands Comptes & Enterprise',
    priceMonthly: 700,
    priceAnnually: 560,
    description: 'Digital Newspapers - downloadable - non subscription - with permanent rights & gouvernance globale multi-entités et IA sur-mesure.',
    features: [
      'Toutes les capacités pro.bee pour équipes & multi-sites illimités',
      'Modèles LLM fine-tunés sur les connaissances privées de votre entreprise',
      'Droits de licence et distribution institutionnelle permanente',
      'SLA Garanti 99.98% avec infrastructure souveraine dédiée',
      'Sécurité certifiée SOC2 Type II, HIPAA & conformité RGPD',
      'Connecteurs ERP sur-mesure (SAP, Salesforce, Dynamics 365)',
      'Executive Coach dédié & revue stratégique trimestrielle'
    ],
    cta: 'Déployer business.bee'
  }
];

export const mockTestimonials = [
  {
    author: 'Elena Vance',
    role: 'Co-founder & CEO, Lumina AI ($18M Series A)',
    quote: 'BizOS saved me from complete founder burnout. By syncing my Whoop data with my meeting calendar, the AI automatically blocks 90 minutes of deep focus when my recovery is low. My team moves 2x faster.',
    metric: '+38% Energy Baseline'
  },
  {
    author: 'Julien Moreau',
    role: 'Founder, AeroSpace Logistics',
    quote: 'InboxAI drafts replies that sound exactly like my communication style. I used to spend 3 hours every evening clearing emails; now it takes 15 minutes of one-click approvals.',
    metric: '14 hrs/week Reclaimed'
  },
  {
    author: 'David Chen',
    role: 'Managing Partner, Nexus Ventures',
    quote: 'MeetAI is unlike any transcription tool. It doesn’t just output text; it writes the Jira tickets, updates HubSpot, and alerts our lead engineer on Slack without human intervention.',
    metric: '100% Zero-Touch Ops'
  }
];
