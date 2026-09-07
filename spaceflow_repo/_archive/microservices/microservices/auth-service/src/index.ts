
import express from 'express';
import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';

dotenv.config();

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3001;
const serviceName = 'auth-service';

// Kafka Setup
const kafka = new Kafka({
  clientId: serviceName,
  brokers: [(process.env.KAFKA_BROKER || 'kafka:9092')]
});

export const producer = kafka.producer(); // Export producer for routes

const run = async () => {
  try {
    await producer.connect();
    console.log(`✅ ${serviceName} Kafka Producer connected`);
  } catch (e) {
    console.error(`❌ ${serviceName} Kafka connection error:`, e);
  }
};

run();

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ service: serviceName, status: 'active' });
});

app.listen(port, () => {
  console.log(`🚀 ${serviceName} listening on port ${port}`);
});
