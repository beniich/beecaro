/**
 * ai.controller.js — Aether AI Core (Horizon 3)
 * Moteur IA Agentif avec Google Gemini + Function Calling
 * Fallback vers un mode "Simulation Avancée" si GEMINI_API_KEY absent.
 */
const { prisma } = require('../config/database');

// ─── Gemini Function Calling Tools ──────────────────────────────────────────

const AETHER_TOOLS = [
  {
    name: 'get_asset_status',
    description: 'Récupère le statut, la santé et le compte des actifs (équipements) du bâtiment.',
    parameters: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_open_work_orders',
    description: 'Liste les ordres de travail en cours ou en attente.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Nombre maximum de résultats à retourner. Défaut: 5.' }
      },
      required: []
    }
  },
  {
    name: 'get_iot_anomalies',
    description: 'Récupère les dernières lectures IoT anormales (seuil dépassé).',
    parameters: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'create_work_order_action',
    description: 'Crée un ordre de travail de maintenance dans le système. À utiliser quand l\'utilisateur demande explicitement de créer un ordre.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Titre de l\'ordre de travail' },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], description: 'Priorité de l\'intervention' },
        assetName: { type: 'string', description: 'Nom de l\'équipement concerné' }
      },
      required: ['title', 'priority']
    }
  }
];

// ─── Tool Executors ──────────────────────────────────────────────────────────

async function executeTool(toolName, args) {
  switch (toolName) {
    case 'get_asset_status': {
      const [total, breakdown, lowHealth] = await Promise.all([
        prisma.asset.count(),
        prisma.asset.count({ where: { status: 'BREAKDOWN' } }),
        prisma.asset.count({ where: { healthScore: { lt: 50 } } })
      ]);
      return { totalAssets: total, assetsInBreakdown: breakdown, assetsLowHealth: lowHealth };
    }
    case 'get_open_work_orders': {
      const limit = args?.limit || 5;
      const orders = await prisma.workOrder.findMany({
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { number: true, title: true, priority: true, status: true }
      });
      return { count: orders.length, orders };
    }
    case 'get_iot_anomalies': {
      // Récupère les dernières lectures de capteurs à haute valeur
      const readings = await prisma.sensorReading.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { sensor: { select: { type: true, unit: true } } }
      });
      const anomalies = readings.filter(r => {
        if (r.sensor?.type === 'temperature' && r.value > 25) return true;
        if (r.sensor?.type === 'vibration' && r.value > 7) return true;
        return false;
      });
      return { anomalyCount: anomalies.length, recentAnomalies: anomalies.map(a => ({
        type: a.sensor?.type,
        value: a.value,
        unit: a.sensor?.unit,
        at: a.createdAt
      }))};
    }
    case 'create_work_order_action': {
      const { title, priority, assetName } = args;
      let asset = await prisma.asset.findFirst({
        where: assetName ? { name: { contains: assetName } } : undefined
      });
      const systemUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      const wo = await prisma.workOrder.create({
        data: {
          number: `WO-AI-${Date.now().toString().slice(-6)}`,
          title, priority: priority || 'HIGH', type: 'CORRECTIVE',
          status: 'PENDING', scheduledAt: new Date(),
          assetId: asset?.id || null,
          createdById: systemUser?.id || 'system'
        }
      });
      return { created: true, workOrderNumber: wo.number, workOrderId: wo.id };
    }
    default:
      return { error: 'Unknown tool' };
  }
}

// ─── Gemini AI Query Handler ─────────────────────────────────────────────────

async function queryWithGemini(prompt) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `Tu es Aether, l'assistant IA expert de la plateforme BeeCarbonat.
Tu gères les bâtiments, les équipements (actifs), les ordres de travail (maintenance), 
les capteurs IoT et la performance énergétique.
Tu réponds toujours en français, de façon concise et professionnelle.
Tu as accès à des outils pour interroger la base de données en temps réel.
Quand tu as les données, tu fournis une analyse synthétique et des recommandations concrètes.`,
    tools: [{ functionDeclarations: AETHER_TOOLS }]
  });

  const chat = model.startChat();

  // Premier tour : envoi de la question utilisateur
  let result = await chat.sendMessage(prompt);
  let response = result.response;

  // Boucle d'exécution des function calls (max 5 tours)
  let iterations = 0;
  while (response.functionCalls()?.length > 0 && iterations < 5) {
    iterations++;
    const functionCalls = response.functionCalls();
    const toolResults = [];

    for (const call of functionCalls) {
      const toolOutput = await executeTool(call.name, call.args);
      toolResults.push({
        functionResponse: { name: call.name, response: { output: JSON.stringify(toolOutput) } }
      });
    }

    result = await chat.sendMessage(toolResults);
    response = result.response;
  }

  return response.text();
}

// ─── Fallback Simulation (si pas de clé Gemini) ───────────────────────────────

async function queryWithSimulation(prompt) {
  const cleanPrompt = (prompt || '').toLowerCase();
  const [assetCount, workOrderCount, breakdownAssets] = await Promise.all([
    prisma.asset.count(),
    prisma.workOrder.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
    prisma.asset.findMany({ where: { status: 'BREAKDOWN' }, take: 5 })
  ]);

  let reply = '';
  let widget = null;

  if (cleanPrompt.includes('anomalie') || cleanPrompt.includes('refroidisseur') || cleanPrompt.includes('alpha')) {
    reply = `J'ai analysé la télémétrie des refroidisseurs du Bâtiment Alpha. Une anomalie de surchauffe (+1.2°C) a été isolée sur le groupe frigorifique CHLR-02.`;
    widget = {
      type: 'anomaly', title: 'Anomalie Détectée : CHLR-02',
      description: 'Température d\'approche du condenseur +1.2°C. Risque d\'entartrage estimé à 89%.',
      metrics: [
        { label: 'ΔT Actuel', value: '3.4°C (+1.2)' },
        { label: 'Rendement Perdu', value: '4.5%' },
        { label: 'Santé Équipement', value: '78%' }
      ],
      assetName: 'Refroidisseur CHLR-02',
      recommendations: ['Detartrage chimique des tubes condenseur', 'Ajuster consigne eau glacée à 7°C']
    };
  } else if (cleanPrompt.includes('énergie') || cleanPrompt.includes('hvac') || cleanPrompt.includes('consommation')) {
    reply = `Analyse SRE : hausse de 12% sur les zones centrales entre 12h-14h. Potentiel de réduction de 18% par ajustement HVAC.`;
    widget = {
      type: 'energy', title: 'Plan d\'Optimisation Énergétique',
      metrics: [{ label: 'Conso Estimée', value: '8,450 kWh' }, { label: 'Économie Cible', value: '3,800 €/mois' }],
      recommendations: ['Passer les zones inoccupées en mode ECO', 'Ajuster consigne à 21.5°C']
    };
  } else {
    reply = `Analyse du parc : ${assetCount} actifs répertoriés, ${workOrderCount} ordres de travail en cours, ${breakdownAssets.length} équipements en panne. Stabilité SRE globale : 96.4%.`;
    widget = {
      type: 'status', title: 'État Global du Parc',
      metrics: [
        { label: 'Actifs Total', value: String(assetCount) },
        { label: 'OT en cours', value: String(workOrderCount) },
        { label: 'En panne', value: String(breakdownAssets.length) }
      ]
    };
  }
  return { reply, widget };
}

// ─── Controller Exports ───────────────────────────────────────────────────────

exports.queryAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'prompt required' });

    if (process.env.GEMINI_API_KEY) {
      // Mode IA Réelle (Gemini)
      const replyText = await queryWithGemini(prompt);
      return res.json({ reply: replyText, widget: null, powered_by: 'gemini', timestamp: new Date().toISOString() });
    } else {
      // Mode Simulation Avancée
      const { reply, widget } = await queryWithSimulation(prompt);
      return res.json({ reply, widget, powered_by: 'simulation', timestamp: new Date().toISOString() });
    }
  } catch (err) {
    console.error('[Aether] queryAI error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.createWorkOrderFromAI = async (req, res) => {
  try {
    const { title, description, priority, assetName } = req.body;

    let asset = await prisma.asset.findFirst({
      where: { name: { contains: assetName || 'CHLR' } }
    });
    if (!asset) asset = await prisma.asset.findFirst();

    const systemUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    const workOrder = await prisma.workOrder.create({
      data: {
        number: `WO-AI-${Date.now().toString().slice(-6)}`,
        title: title || 'Maintenance préventive recommandée par Aether AI',
        description: description || 'Intervention automatisée sur anomalie détectée par télémétrie SRE.',
        type: 'PREVENTIVE',
        priority: priority || 'HIGH',
        status: 'PENDING',
        scheduledAt: new Date(),
        assetId: asset?.id || null,
        createdById: req.user?.id || systemUser?.id || 'system'
      }
    });

    res.status(201).json({ success: true, message: 'Ordre de travail créé par Aether AI !', workOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
