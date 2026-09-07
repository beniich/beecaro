
import express from 'express';
import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import { Metric } from './models/Metric';

dotenv.config();

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3005;
const serviceName = 'analytics-service';

// Kafka Setup
const kafka = new Kafka({
  clientId: serviceName,
  brokers: [(process.env.KAFKA_BROKER || 'kafka:9092')]
});

const consumer = kafka.consumer({ groupId: `${serviceName}-group` });

const run = async () => {
  try {
    await consumer.connect();
    console.log(`✅ ${serviceName} Kafka Consumer connected`);

    // Subscribe to topics
    await consumer.subscribe({ topic: 'complaint-events', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = JSON.parse(message.value?.toString() || '{}');
        console.log(`📥 [${serviceName}] Received on ${topic}:`, payload.type);

        try {
          if (topic === 'complaint-events' && payload.type === 'COMPLAINT_CREATED') {
            // Increment total complaints
            await Metric.findOneAndUpdate(
              { key: 'total_complaints' },
              { $inc: { value: 1 }, $set: { lastUpdated: new Date() } },
              { upsert: true, new: true }
            );

            // Increment by status
            await Metric.findOneAndUpdate(
              { key: `complaints_status_${payload.status}` },
              { $inc: { value: 1 }, $set: { lastUpdated: new Date() } },
              { upsert: true, new: true }
            );
          }

          if (topic === 'complaint-events' && payload.type === 'COMPLAINT_STATUS_UPDATED') {
            // Decrement old status
            await Metric.findOneAndUpdate(
              { key: `complaints_status_${payload.oldStatus}` },
              { $inc: { value: -1 }, $set: { lastUpdated: new Date() } },
              { upsert: true }
            );

            // Increment new status
            await Metric.findOneAndUpdate(
              { key: `complaints_status_${payload.newStatus}` },
              { $inc: { value: 1 }, $set: { lastUpdated: new Date() } },
              { upsert: true }
            );
          }

        } catch (err) {
          console.error('Error updating metrics:', err);
        }
      },
    });
  } catch (e) {
    console.error(`❌ ${serviceName} Kafka connection error:`, e);
  }
};

run();

// API to expose specific metrics
app.get('/api/analytics/metrics', async (req, res) => {
  try {
    const metrics = await Metric.find();
    const formatted = metrics.reduce((acc: any, m) => {
      acc[m.key] = m.value;
      return acc;
    }, {});
    res.json(formatted);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.get('/', (req, res) => {
  res.json({ service: serviceName, status: 'active' });
});

app.listen(port, () => {
  console.log(`🚀 ${serviceName} listening on port ${port}`);
});
