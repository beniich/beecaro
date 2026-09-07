
import express from 'express';
import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import { connectDB } from './config/db';
import teamRoutes from './routes/teams';

dotenv.config();

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3003;
const serviceName = 'teams-service';

// Kafka Setup
const kafka = new Kafka({
  clientId: serviceName,
  brokers: [(process.env.KAFKA_BROKER || 'kafka:9092')]
});

export const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: `${serviceName}-group` });

const run = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    console.log(`✅ ${serviceName} Kafka Producer & Consumer connected`);

    // Subscribe to complaint events for Saga
    await consumer.subscribe({ topic: 'complaint-events', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value?.toString() || '{}';
        try {
          const payload = JSON.parse(value);

          if (topic === 'complaint-events' && payload.type === 'COMPLAINT_CREATED') {
            console.log(`🔄 [Saga] Handling COMPLAINT_CREATED for assignment: ${payload.complaintId}`);

            // 1. Find a Team (Mock Logic)
            // In real app, query DB for available team based on category/location
            // const team = await Team.findOne({ status: 'disponible', specialties: payload.category });

            // Mock: Just pick a random mock team ID or assume success
            const mockTeamId = "65d4b8e1f9a1b2c3d4e5f6g7"; // Example ID
            const success = true; // Simulate success

            if (success) {
              console.log(`✅ [Saga] Assigned Team ${mockTeamId} to Complaint ${payload.complaintId}`);

              await producer.send({
                topic: 'complaint-events',
                messages: [{
                  value: JSON.stringify({
                    type: 'COMPLAINT_ASSIGNED',
                    complaintId: payload.complaintId,
                    teamId: mockTeamId,
                    timestamp: new Date()
                  })
                }]
              });
            } else {
              console.log(`❌ [Saga] Failed to assign team for Complaint ${payload.complaintId}`);
              await producer.send({
                topic: 'complaint-events',
                messages: [{
                  value: JSON.stringify({
                    type: 'ASSIGNMENT_FAILED',
                    complaintId: payload.complaintId,
                    reason: 'No teams available',
                    timestamp: new Date()
                  })
                }]
              });
            }
          }
        } catch (err) {
          console.error('Error processing message:', err);
        }
      }
    });

  } catch (e) {
    console.error(`❌ ${serviceName} Kafka connection error:`, e);
  }
};

run();

// HTTP Webhook for Saga
app.post('/events', async (req, res) => {
  const { topic, ...message } = req.body;
  const payload = message.data;

  console.log(`📥 [HTTP] Saga Event on ${topic}:`, message.eventType);

  if (topic === 'complaint-events' && message.eventType === 'COMPLAINT_CREATED') {
    console.log(`🔄 [Saga HTTP] Handling COMPLAINT_CREATED for assignment: ${payload.complaintId}`);

    const mockTeamId = "65d4b8e1f9a1b2c3d4e5f6g7";
    const success = true;

    const eventData = success ? {
      type: 'COMPLAINT_ASSIGNED',
      complaintId: payload.complaintId,
      teamId: mockTeamId,
      timestamp: new Date()
    } : {
      type: 'ASSIGNMENT_FAILED',
      complaintId: payload.complaintId,
      reason: 'No teams available',
      timestamp: new Date()
    };

    // Send back to Backend (Orchestrator) 
    try {
      await axios.post('http://localhost:5009/events', {
        topic: 'complaint-events',
        eventType: eventData.type,
        timestamp: new Date().toISOString(),
        data: eventData
      });
      console.log(`✅ [Saga HTTP] Sent response ${eventData.type} to Backend`);
    } catch (e: any) {
      console.error('❌ Failed to send Saga response to Backend:', e.message);
    }
  }

  res.json({ received: true });
});

app.use('/api/teams', teamRoutes);

app.get('/', (req, res) => {
  res.json({ service: serviceName, status: 'active' });
});

app.listen(port, () => {
  console.log(`🚀 ${serviceName} listening on port ${port}`);
});
