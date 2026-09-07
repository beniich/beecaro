const express = require('express');
const router = express.Router();
const aiAssistant = require('../services/ai/assistant.service');
const ticketCategorizer = require('../services/ai/categorization.service');
const { authMiddleware } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting : 30 questions/min max
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Trop de requêtes IA. Veuillez patienter 1 minute.' },
});

router.use(authMiddleware, aiLimiter);

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat conversationnel avec l'assistant IA
 *     tags: [AI]
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Le champ message est requis' });
    }

    const tenantId = req.user.tenantId || 'tenant-default';
    const result = await aiAssistant.chat(
      req.user.id,
      tenantId,
      message,
      Array.isArray(history) ? history : []
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'AI assistant temporarily unavailable' });
  }
});

/**
 * @swagger
 * /api/ai/categorize:
 *   post:
 *     summary: Auto-catégorisation et priorisation de ticket
 *     tags: [AI]
 */
router.post('/categorize', async (req, res) => {
  try {
    const { title, description, tenantContext } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Titre et description requis' });
    }

    const result = await ticketCategorizer.categorize(title, description, tenantContext);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Categorization failed' });
  }
});

module.exports = router;
