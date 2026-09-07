const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY || 'dummy_api_key_for_testing';
const genai = new GoogleGenerativeAI(apiKey);

class TicketCategorizer {
  constructor() {
    this.model = genai.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
  }

  async categorize(title, description, tenantContext = { assets: [] }) {
    if (!process.env.GEMINI_API_KEY) {
      return {
        category: 'AUTRE',
        suggestedPriority: 'MEDIUM',
        suggestedAssetName: null,
        keywords: ['maintenance'],
        confidence: 0.5,
      };
    }

    const prompt = `Analyse ce ticket de maintenance industrielle.
Titre : ${title}
Description : ${description}
Contexte (assets du tenant) : ${(tenantContext.assets || []).map(a => `- ${a.name} (${a.type || 'standard'})`).join('\n')}

Catégories possibles :
- MECANIQUE (panne machine, fuite, casse)
- ELECTRIQUE (court-circuit, panne moteur)
- HYDRAULIQUE (fuite liquide, pression)
- PNEUMATIQUE (air comprimé)
- AUTOMATISME (PLC, capteur, automate)
- SECURITE (urgence sécurité)
- QUALITE (défaut produit)
- ENVIRONNEMENT (fuite produit, pollution)
- AUTRE

Réponds UNIQUEMENT en JSON strict au format suivant :
{
  "category": "CATÉGORIE",
  "suggestedPriority": "LOW|MEDIUM|HIGH|URGENT|CRITICAL",
  "suggestedAssetName": "nom asset si identifiable ou null",
  "keywords": ["mot1", "mot2"],
  "confidence": 0.0-1.0
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const json = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(json);
    } catch (error) {
      console.error('Categorization failed:', error);
      return {
        category: 'AUTRE',
        suggestedPriority: 'MEDIUM',
        suggestedAssetName: null,
        keywords: [],
        confidence: 0,
      };
    }
  }
}

module.exports = new TicketCategorizer();
