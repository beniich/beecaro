/**
 * rag.service.js — Pipeline RAG pour l'assistant IA BeeCarbonat
 * Horizon 3 : IA Générative Opérationnelle
 *
 * Architecture :
 *   Query → Embed → pgvector similarity search → LLM completion
 *   Guardrails : sortie toujours accompagnée d'un disclaimer expert
 */
const axios = require('axios');
const { prisma } = require('../../config/database');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── Embedding ────────────────────────────────────────────────────────────────

/**
 * Génère un embedding OpenAI pour un texte donné
 * (remplaçable par un modèle self-hosted pour conformité RGPD)
 */
async function embed(text) {
  const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback: vecteur nul (développement sans API key)
    console.warn('[RAG] No OPENAI_API_KEY — using zero vector fallback');
    return new Array(1536).fill(0);
  }

  const res = await axios.post(
    'https://api.openai.com/v1/embeddings',
    { model, input: text.slice(0, 8000) },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 10_000 }
  );
  return res.data.data[0].embedding;
}

// ─── Retrieval ────────────────────────────────────────────────────────────────

/**
 * Récupère les K documents les plus proches via pgvector
 * @param {string} tenantId
 * @param {number[]} queryEmbedding
 * @param {number} k — nombre de chunks à récupérer
 */
async function retrieveDocuments(tenantId, queryEmbedding, k = 10) {
  // pgvector operator <-> = cosine distance
  const result = await pool.query(
    `SELECT id, title, content, source, "assetId"
     FROM "AssetDocument"
     WHERE "tenantId" = $1
       AND embedding IS NOT NULL
     ORDER BY embedding <-> $2::vector
     LIMIT $3`,
    [tenantId, `[${queryEmbedding.join(',')}]`, k]
  );
  return result.rows;
}

// ─── Generation ───────────────────────────────────────────────────────────────

function buildPrompt(query, docs, context = 'GENERAL') {
  const contextDocs = docs
    .map((d, i) => `[Source ${i + 1}: ${d.source} — ${d.title}]\n${d.content}`)
    .join('\n\n');

  const systemPrompts = {
    WO_SUMMARY:
      'Tu es un assistant CAFM expert. Résume les interventions de maintenance de façon concise et structurée.',
    ASSET_DIAG:
      "Tu es un expert en maintenance d'équipements. Fournis un diagnostic préliminaire basé sur les données disponibles.",
    ESG:
      'Tu es un expert en développement durable et reporting CSRD. Aide à interpréter les données énergétiques.',
    GENERAL:
      'Tu es un assistant pour les Facility Managers. Réponds uniquement à partir des données internes fournies.',
  };

  return {
    system: systemPrompts[context] || systemPrompts.GENERAL,
    user: `Données internes disponibles :\n\n${contextDocs}\n\n---\nQuestion : ${query}\n\nRéponds de façon précise et factuelle. Si tu n'as pas assez d'informations, dis-le clairement.`,
  };
}

/**
 * Appel au LLM (OpenAI GPT-4o-mini par défaut, ou self-hosted Mistral)
 */
async function callLLM(prompt, temperature = 0.3) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    return {
      content: '[Mode développement — API key LLM non configurée]',
      tokens: 0,
    };
  }

  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      temperature,
      max_tokens: 600,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
    },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 30_000 }
  );

  return {
    content: res.data.choices[0].message.content,
    tokens: res.data.usage.total_tokens,
  };
}

// ─── Guardrail ────────────────────────────────────────────────────────────────
const DISCLAIMER =
  '\n\n---\n⚠️ *Réponse générée par IA à partir des données internes. À valider par un expert avant toute décision opérationnelle.*';

// ─── Pipeline principal ───────────────────────────────────────────────────────

/**
 * Pipeline RAG complet : query → embed → retrieve → generate
 *
 * @param {Object} params
 * @param {string} params.tenantId
 * @param {string} params.userId
 * @param {string} params.query
 * @param {'GENERAL'|'WO_SUMMARY'|'ASSET_DIAG'|'ESG'} params.context
 * @param {string} [params.sessionId] — si existant, continue la session
 */
async function ragQuery({ tenantId, userId, query, context = 'GENERAL', sessionId }) {
  // 1. Embed la question
  const embedding = await embed(query);

  // 2. Retrieve les documents pertinents
  const docs = await retrieveDocuments(tenantId, embedding, 10);

  // 3. Build prompt + call LLM
  const prompt = buildPrompt(query, docs, context);
  const { content, tokens } = await callLLM(prompt, context === 'ESG' ? 0.1 : 0.3);

  // 4. Apply guardrail
  const answer = content + DISCLAIMER;

  // 5. Persist session
  let session;
  if (sessionId) {
    session = await prisma.aISession.findUnique({ where: { id: sessionId } });
    if (session) {
      const messages = session.messages || [];
      messages.push(
        { role: 'user', content: query, timestamp: new Date() },
        { role: 'assistant', content: answer, timestamp: new Date() }
      );
      session = await prisma.aISession.update({
        where: { id: sessionId },
        data: { messages, tokenCount: { increment: tokens } },
      });
    }
  }

  if (!session) {
    session = await prisma.aISession.create({
      data: {
        tenantId,
        userId,
        context,
        messages: [
          { role: 'user', content: query, timestamp: new Date() },
          { role: 'assistant', content: answer, timestamp: new Date() },
        ],
        tokenCount: tokens,
      },
    });
  }

  return {
    sessionId: session.id,
    answer,
    sourcesCount: docs.length,
    tokens,
  };
}

module.exports = { ragQuery, embed };
