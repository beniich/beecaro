
import express from 'express';
import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db';
import complaintRoutes from './routes/complaints';
import { startSLAWorker } from './workers/slaWorker';

dotenv.config();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
// Security middlewares
app.use(helmet());
const xssClean = require('xss-clean');
app.use(xssClean());

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3002;
const serviceName = 'complaints-service';

// Kafka Setup
const kafka = new Kafka({
  clientId: serviceName,
  brokers: [(process.env.KAFKA_BROKER || 'kafka:9092')]
});

export const producer = kafka.producer();

const run = async () => {
  try {
    await producer.connect();
    console.log(`✅ ${serviceName} Kafka Producer connected`);

    // Start SLA breach worker (polls every 5 min)
    startSLAWorker();
  } catch (e) {
    console.error(`❌ ${serviceName} Kafka connection error:`, e);
    // Still start SLA worker even without Kafka (will fail gracefully per complaint)
    startSLAWorker();
  }
};

app.use('/api/complaints', complaintRoutes);

app.get('/', (req, res) => {
  res.json({ service: serviceName, status: 'active' });
});

if (process.env.NODE_ENV !== 'test') {
  run();
  app.listen(port, () => {
    console.log(`🚀 ${serviceName} listening on port ${port}`);
  });
}

export { app };
