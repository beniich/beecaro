const fs = require('fs');
const path = require('path');

const services = [
    'auth-service',
    'complaints-service',
    'teams-service',
    'notification-service',
    'analytics-service',
    'inventory-service'
];

const baseDir = path.join(__dirname, '../microservices');

const packageJsonTemplate = (name) => ({
    name: `BeeCarbonat-${name}`,
    version: "1.0.0",
    main: "dist/index.js",
    scripts: {
        "start": "node dist/index.js",
        "build": "tsc",
        "dev": "ts-node-dev --respawn src/index.ts"
    },
    dependencies: {
        "kafkajs": "^2.2.4",
        "express": "^4.18.2",
        "dotenv": "^16.3.1",
        "mongoose": "^7.5.0",
        "cors": "^2.8.5"
    },
    devDependencies: {
        "typescript": "^5.2.2",
        "@types/node": "^20.5.9",
        "@types/express": "^4.17.17",
        "ts-node-dev": "^2.0.0"
    }
});

const tsConfigTemplate = {
    "compilerOptions": {
        "target": "es2016",
        "module": "commonjs",
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
    }
};

const indexTemplate = (name) => `
import express from 'express';
import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const serviceName = '${name}';

// Kafka Setup
const kafka = new Kafka({
  clientId: serviceName,
  brokers: [(process.env.KAFKA_BROKER || 'kafka:9092')]
});

const consumer = kafka.consumer({ groupId: \`\${serviceName}-group\` });
const producer = kafka.producer();

const run = async () => {
  // Connect to Kafka
  try {
    await consumer.connect();
    await producer.connect();
    console.log(\`✅ \${serviceName} connected to Kafka\`);

    // Subscribe to all topics for now (demonstration)
    await consumer.subscribe({ topic: new RegExp(/.*\.*/) , fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(\`📥 [\${serviceName}] Received on \${topic}: \`, message.value?.toString());
        // Handle events here
      },
    });
  } catch (e) {
    console.error(\`❌ \${serviceName} Kafka connection error:\`, e);
  }
};

run();

// Basic Health Check
app.get('/', (req, res) => {
  res.json({ service: serviceName, status: 'active' });
});

app.listen(port, () => {
  console.log(\`🚀 \${serviceName} listening on port \${port}\`);
});
`;

const dockerfileTemplate = `
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
`;

services.forEach(service => {
    const serviceDir = path.join(baseDir, service);
    const srcDir = path.join(serviceDir, 'src');

    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }

    // Write package.json
    fs.writeFileSync(
        path.join(serviceDir, 'package.json'),
        JSON.stringify(packageJsonTemplate(service), null, 2)
    );

    // Write tsconfig.json
    fs.writeFileSync(
        path.join(serviceDir, 'tsconfig.json'),
        JSON.stringify(tsConfigTemplate, null, 2)
    );

    // Write src/index.ts
    fs.writeFileSync(
        path.join(srcDir, 'index.ts'),
        indexTemplate(service)
    );

    // Write Dockerfile
    fs.writeFileSync(
        path.join(serviceDir, 'Dockerfile'),
        dockerfileTemplate
    );

    console.log(`✅ Scaffolded ${service}`);
});
