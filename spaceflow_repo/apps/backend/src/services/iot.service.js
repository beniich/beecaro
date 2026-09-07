const { prisma } = require('../config/database');

/**
 * Simule les capteurs IoT en générant des données en temps réel
 * pour la température, humidité, énergie, vibration
 */
const startIoTSimulation = (io) => {
  setInterval(async () => {
    try {
      const sensors = await prisma.sensor.findMany({ take: 20 });
      
      for (const sensor of sensors) {
        // Génération de valeurs réalistes selon le type
        let newValue = sensor.value;
        switch (sensor.type) {
          case 'temperature':
            newValue = 18 + Math.random() * 8; // 18-26°C
            break;
          case 'humidity':
            newValue = 40 + Math.random() * 20; // 40-60%
            break;
          case 'energy':
            newValue = Math.random() * 50; // 0-50 kWh
            break;
          case 'vibration':
            newValue = Math.random() * 10; // 0-10 mm/s
            break;
          default:
            newValue = sensor.value + (Math.random() - 0.5) * 2;
        }

        // Sauvegarder la lecture
        await prisma.sensorReading.create({
          data: { value: newValue, sensorId: sensor.id }
        });

        // Mettre à jour la valeur du capteur
        await prisma.sensor.update({
          where: { id: sensor.id },
          data: { value: newValue }
        });

        // Émettre l'événement en temps réel
        io.emit('sensor:reading', {
          sensorId: sensor.id,
          type: sensor.type,
          value: Math.round(newValue * 100) / 100,
          unit: sensor.unit,
          timestamp: new Date().toISOString()
        });

        // Dashboard update
        io.emit('dashboard:update', {
          type: 'sensor',
          timestamp: new Date().toISOString(),
          data: { sensorId: sensor.id, value: newValue, type: sensor.type }
        });

        // Trigger Webhook on Critical Anomalies (Ex: Temperature > 25°C)
        if (sensor.type === 'temperature' && newValue > 25) {
          const { dispatchWebhook } = require('./webhook.service');
          // Using a free mock webhook endpoint for demo purposes
          const WEBHOOK_URL = process.env.SRE_WEBHOOK_URL || 'https://webhook.site/BeeCarbonat-sre-demo';
          dispatchWebhook(WEBHOOK_URL, 'iot.anomaly.critical', {
            sensorId: sensor.id,
            type: sensor.type,
            value: Math.round(newValue * 100) / 100,
            unit: sensor.unit,
            thresholdExceeded: true,
            message: 'Temperature critical threshold exceeded (SLA Breach Risk)'
          });
        }
      }
    } catch (error) {
      console.error('Erreur simulation IoT:', error.message);
    }
  }, 5000); // Toutes les 5 secondes
};

module.exports = { startIoTSimulation };
