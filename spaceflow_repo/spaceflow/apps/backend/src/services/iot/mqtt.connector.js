/**
 * mqtt.connector.js — Connecteur IoT MQTT (Horizon 3 BeeCarbonat)
 * Protocoles : MQTT (capteurs modernes), extensible vers BACnet / LoRaWAN
 *
 * Pattern : subscribe → parse → corrélation asset → persist IoTReading
 */
const mqtt = require('mqtt');
const { prisma } = require('../../config/database');

class MQTTConnector {
  constructor(config) {
    this.connectorId = config.id;
    this.tenantId = config.tenantId;
    this.cfg = config.config; // { brokerUrl, username, password, topics[], qos }
    this.client = null;
    this.running = false;
  }

  /**
   * Connecte au broker et subscribe aux topics configurés
   */
  async start() {
    if (this.running) return;

    this.client = mqtt.connect(this.cfg.brokerUrl, {
      username:     this.cfg.username,
      password:     this.cfg.password,
      clientId:     `BeeCarbonat-${this.connectorId}-${Date.now()}`,
      reconnectPeriod: 5000,
      connectTimeout: 10_000,
    });

    this.client.on('connect', async () => {
      console.info(`[IoT][MQTT] Connected — connector ${this.connectorId}`);
      this.running = true;

      // Subscribe à tous les topics configurés
      const topics = this.cfg.topics || ['BeeCarbonat/#'];
      this.client.subscribe(topics, { qos: this.cfg.qos || 1 });

      await prisma.ioTConnector.update({
        where: { id: this.connectorId },
        data: { status: 'ACTIVE', lastSeenAt: new Date() },
      });
    });

    this.client.on('message', async (topic, payload) => {
      await this._handleMessage(topic, payload.toString());
    });

    this.client.on('error', async (err) => {
      console.error(`[IoT][MQTT] Error — ${err.message}`);
      await prisma.ioTConnector.update({
        where: { id: this.connectorId },
        data: { status: 'ERROR' },
      }).catch(() => {});
    });

    this.client.on('offline', async () => {
      this.running = false;
      await prisma.ioTConnector.update({
        where: { id: this.connectorId },
        data: { status: 'INACTIVE' },
      }).catch(() => {});
    });
  }

  /**
   * Traite un message MQTT entrant
   * Format attendu : JSON { metric, value, unit, assetRef? }
   */
  async _handleMessage(topic, rawPayload) {
    let parsed;
    try {
      parsed = JSON.parse(rawPayload);
    } catch {
      // Payload brut (ex: valeur numérique simple)
      parsed = { value: parseFloat(rawPayload), metric: 'raw', unit: 'unknown' };
    }

    const { metric, value, unit, assetRef, quality } = parsed;

    if (value === undefined || isNaN(value)) return;

    // Résolution de l'asset via assetRef (externalRef du capteur)
    let assetId = null;
    if (assetRef) {
      const asset = await prisma.asset.findFirst({
        where: { tenantId: this.tenantId, bimRef: assetRef },
        select: { id: true },
      });
      assetId = asset?.id || null;
    }

    // Persist la lecture
    await prisma.ioTReading.create({
      data: {
        connectorId: this.connectorId,
        assetId,
        topic,
        metric: metric || topic.split('/').pop(),
        value,
        unit: unit || 'unknown',
        quality: quality || 'GOOD',
        readAt: new Date(),
      },
    });

    // Update lastSeen
    await prisma.ioTConnector.update({
      where: { id: this.connectorId },
      data: { lastSeenAt: new Date() },
    }).catch(() => {});
  }

  /**
   * Déconnecte proprement le client MQTT
   */
  stop() {
    if (this.client) {
      this.client.end(true);
      this.client = null;
      this.running = false;
      console.info(`[IoT][MQTT] Stopped — connector ${this.connectorId}`);
    }
  }
}

// ─── Manager : un connecteur par IoTConnector actif ──────────────────────────
const activeConnectors = new Map();

async function startAllConnectors(tenantId) {
  const connectors = await prisma.ioTConnector.findMany({
    where: { tenantId, protocol: 'MQTT', status: { not: 'ERROR' } },
  });

  for (const cfg of connectors) {
    if (!activeConnectors.has(cfg.id)) {
      const conn = new MQTTConnector(cfg);
      await conn.start();
      activeConnectors.set(cfg.id, conn);
    }
  }
}

function stopConnector(connectorId) {
  const conn = activeConnectors.get(connectorId);
  if (conn) {
    conn.stop();
    activeConnectors.delete(connectorId);
  }
}

module.exports = { MQTTConnector, startAllConnectors, stopConnector };
