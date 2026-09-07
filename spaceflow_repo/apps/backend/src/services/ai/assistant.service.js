const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../../config/database');
const logger = require('../../utils/logger');

const apiKey = process.env.GEMINI_API_KEY || 'dummy_api_key_for_testing';
const genai = new GoogleGenerativeAI(apiKey);

// Définition des tools (function calling)
const tools = [
  {
    name: 'get_tickets',
    description: 'Récupère les tickets selon des filtres',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'] },
        limit: { type: 'number', default: 10 },
      },
    },
  },
  {
    name: 'get_asset_health',
    description: 'Récupère le score de santé d\'un équipement',
    parameters: {
      type: 'object',
      properties: {
        assetId: { type: 'string' },
        assetName: { type: 'string' },
      },
    },
  },
  {
    name: 'get_kpis',
    description: 'Récupère des KPIs de maintenance (MTBF, MTTR, etc.)',
    parameters: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['7d', '30d', '90d', '1y'] },
        assetId: { type: 'string' },
      },
    },
  },
];

class AIAssistant {
  constructor() {
    this.model = genai.getGenerativeModel({
      model: 'gemini-1.5-pro',
      tools: [{ functionDeclarations: tools }],
      systemInstruction: `Tu es un assistant IA pour BeeCarbonIT, une plateforme de gestion de maintenance (GMAO / CAFM).
Tu aides les utilisateurs à comprendre leurs données de maintenance. Sois concis, précis, et utilise des emojis pour structurer tes réponses.
Tu peux :
- Analyser les tickets et Work Orders
- Expliquer les KPIs (MTBF, MTTR, OEE)
- Identifier des tendances
- Suggérer des actions
Tu ne peux PAS :
- Modifier des données (lecture seule)
- Donner des conseils médicaux ou juridiques
- Prédire l'avenir avec certitude`,
    });
  }

  async chat(userId, tenantId, message, history = []) {
    const traceId = `ai-${Date.now()}`;
    try {
      if (!process.env.GEMINI_API_KEY) {
        return {
          response: "🤖 Mode Démo IA : L'assistant BeeCarbonIT est prêt. Veuillez configurer GEMINI_API_KEY pour activer les réponses en temps réel.",
          functionCalls: [],
          history: [...history, { role: 'user', content: message }, { role: 'model', content: "Mode Démo" }],
        };
      }

      const chat = this.model.startChat({
        history: history.map(msg => ({
          role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      });

      const contextualMessage = `[Tenant: ${tenantId}] ${message}`;
      let result = await chat.sendMessage(contextualMessage);

      const functionCalls = result.response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        const functionResults = await Promise.all(
          functionCalls.map(async (call) => {
            const args = call.args;
            const functionResult = await this.executeFunction(call.name, args, tenantId);
            return {
              functionResponse: {
                name: call.name,
                response: functionResult,
              },
            };
          })
        );

        result = await chat.sendMessage(functionResults);
      }

      const response = result.response.text();

      logger.info('AI assistant used', {
        userId,
        tenantId,
        traceId,
        messageLength: message.length,
        functionsCalled: functionCalls?.map(f => f.name) || [],
      });

      return {
        response,
        functionCalls: functionCalls?.map(f => f.name) || [],
        history: [
          ...history,
          { role: 'user', content: message },
          { role: 'model', content: response },
        ],
      };
    } catch (error) {
      logger.error('AI assistant error', { error: error.message, traceId });
      throw new Error('AI assistant temporarily unavailable');
    }
  }

  async executeFunction(name, args, tenantId) {
    const tenantFilter = { tenantId };

    switch (name) {
      case 'get_tickets': {
        const tickets = await prisma.ticket.findMany({
          where: {
            ...tenantFilter,
            ...(args.status && { status: args.status }),
            ...(args.priority && { priority: args.priority }),
          },
          include: { asset: true, assignedTo: true },
          take: args.limit || 10,
          orderBy: { createdAt: 'desc' },
        });
        return { tickets: this.sanitize(tickets) };
      }

      case 'get_asset_health': {
        const asset = await prisma.asset.findFirst({
          where: {
            ...tenantFilter,
            ...(args.assetId ? { id: args.assetId } : { name: args.assetName }),
          },
          include: {
            workOrders: {
              where: {
                createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
              },
            },
          },
        });
        return asset
          ? {
              healthScore: asset.healthScore,
              recentWorkOrders: asset.workOrders?.length || 0,
              status: asset.status,
            }
          : { error: 'Asset not found' };
      }

      case 'get_kpis': {
        const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[args.period] || 30;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const tickets = await prisma.ticket.findMany({
          where: { ...tenantFilter, createdAt: { gte: since } },
        });
        const workOrders = await prisma.workOrder.findMany({
          where: { ...tenantFilter, createdAt: { gte: since } },
        });

        return {
          period: args.period,
          ticketsCount: tickets.length,
          workOrdersCount: workOrders.length,
          mttr: this.calculateMTTR(workOrders),
          mtbf: this.calculateMTBF(workOrders),
        };
      }

      default:
        return { error: 'Unknown function' };
    }
  }

  sanitize(data) {
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (['password', 'token', 'secret', 'apiKey'].includes(key)) {
          return '[REDACTED]';
        }
        return value;
      })
    );
  }

  calculateMTTR(workOrders) {
    const completed = workOrders.filter(w => w.completedAt && w.startedAt);
    if (completed.length === 0) return 0;
    const totalMinutes = completed.reduce((sum, wo) => {
      return sum + (new Date(wo.completedAt).getTime() - new Date(wo.startedAt).getTime()) / (1000 * 60);
    }, 0);
    return Math.round(totalMinutes / completed.length);
  }

  calculateMTBF(workOrders) {
    const failures = workOrders.filter(w => w.priority === 'CRITICAL');
    if (failures.length < 2) return null;
    const periods = [];
    for (let i = 1; i < failures.length; i++) {
      periods.push(
        (new Date(failures[i].createdAt).getTime() - new Date(failures[i - 1].createdAt).getTime()) / (1000 * 60 * 60)
      );
    }
    return Math.round(periods.reduce((a, b) => a + b, 0) / periods.length);
  }
}

module.exports = new AIAssistant();
