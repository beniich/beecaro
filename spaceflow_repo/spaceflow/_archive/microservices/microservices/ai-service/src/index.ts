import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'kafka:9092';

// --- AI Provider Configuration ---
// Set AI_PROVIDER=lmstudio to use LM Studio, or AI_PROVIDER=ollama (default)
const AI_PROVIDER = process.env.AI_PROVIDER || 'ollama';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const LMSTUDIO_URL = process.env.LMSTUDIO_URL || 'http://localhost:1234';
const LMSTUDIO_MODEL = process.env.LMSTUDIO_MODEL || 'local-model'; // nom affiché dans LM Studio

app.use(cors());
app.use(express.json());

// --- Unified AI Chat Function ---
async function callAI(prompt: string, systemPrompt: string = '', model: string = 'llama3'): Promise<string> {
  if (AI_PROVIDER === 'lmstudio') {
    // LM Studio uses OpenAI-compatible API
    const response = await axios.post(`${LMSTUDIO_URL}/v1/chat/completions`, {
      model: LMSTUDIO_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: false,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data.choices[0].message.content;
  } else {
    // Ollama API
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model,
      prompt,
      system: systemPrompt,
      stream: false,
    });
    return response.data.response;
  }
}

// --- Synchronous AI Chat Endpoint ---
const aiRoutes = express.Router();

aiRoutes.post('/chat', async (req, res) => {
  const { prompt, model = 'llama3', system = '' } = req.body;

  try {
    const text = await callAI(prompt, system, model);
    res.json({ success: true, response: text, provider: AI_PROVIDER });
  } catch (error: any) {
    console.error(`[${AI_PROVIDER}] Error:`, error.message);
    res.status(500).json({
      success: false,
      error: `Communication error with ${AI_PROVIDER === 'lmstudio' ? 'LM Studio' : 'Ollama'}.`,
    });
  }
});

// --- Health Check ---
aiRoutes.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ai-service',
    provider: AI_PROVIDER,
    endpoint: AI_PROVIDER === 'lmstudio' ? LMSTUDIO_URL : OLLAMA_URL,
  });
});

app.use('/api/ai', aiRoutes);

// --- Kafka Asynchronous Integration ---
const initKafka = async () => {
  try {
    const kafka = new Kafka({
      clientId: 'ai-service',
      brokers: [KAFKA_BROKER],
    });

    const consumer = kafka.consumer({ groupId: 'ai-service-group' });
    await consumer.connect();
    console.log('🤖 Connected to Kafka Broker.');

    await consumer.subscribe({ topic: 'complaint.created', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          if (!message.value) return;
          const payload = JSON.parse(message.value.toString());
          console.log(`🧠 AI processing event from ${topic}:`, payload);

          // Auto-analyze complaint with AI
          if (payload.description) {
            const analysis = await callAI(
              `Analyze this customer complaint and suggest a priority level (low/medium/high/critical) and a brief action plan:\n\n"${payload.description}"`,
              'You are a customer support AI assistant for ReclamTrack. Be concise and professional.',
            );
            console.log(`✅ AI Analysis for complaint ${payload.id}:`, analysis);
            // TODO: Publish result to 'complaint.analyzed' Kafka topic
          }
        } catch (err) {
          console.error('Failed processing Kafka message:', err);
        }
      },
    });
  } catch (err) {
    console.error('Kafka initialization failed in AI Service. Continuing without Kafka...', err);
  }
};

app.listen(PORT, () => {
  console.log(`🤖 AI Service running on port ${PORT}`);
  console.log(`🔌 Provider: ${AI_PROVIDER.toUpperCase()} @ ${AI_PROVIDER === 'lmstudio' ? LMSTUDIO_URL : OLLAMA_URL}`);
  initKafka();
});
