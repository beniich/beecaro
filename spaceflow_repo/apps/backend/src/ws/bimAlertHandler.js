const { logger } = require("../lib/logger.js");
const { wsManager } = require("./websocketServer.js");
const { metrics } = require("../monitoring/metrics.js");
const { prisma } = require("../config/database.js"); // Utilise database.js au lieu de prisma.js

const VALID_ALERT_TYPES = [
  "subscribe", 
  "acknowledge", 
  "dismiss", 
  "request_history",
  "set_threshold",
];

const bimAlertHandler = {
  /**
   * Traite les messages client pour le canal alerts
   */
  async handleClientMessage(ws, message, modelId) {
    const { type } = message;
    
    if (!VALID_ALERT_TYPES.includes(type)) {
      wsManager.send(ws, { 
        type: "error", 
        message: `Unknown alert action: ${type}`,
      });
      return;
    }

    switch (type) {
      case "subscribe":
        // Déjà géré à la connexion
        wsManager.send(ws, { type: "subscribed", channel: "alerts" });
        break;

      case "acknowledge":
        await this.handleAcknowledge(ws, message, modelId);
        break;

      case "dismiss":
        await this.handleDismiss(ws, message, modelId);
        break;

      case "request_history":
        await this.handleHistoryRequest(ws, message, modelId);
        break;

      case "set_threshold":
        await this.handleThresholdSet(ws, message, modelId);
        break;
    }
  },

  async handleAcknowledge(ws, message, modelId) {
    const { alertId } = message;
    if (!alertId) return;

    try {
      await prisma.alert.update({
        where: { id: alertId },
        data: {
          acknowledgedAt: new Date(),
          acknowledgedBy: ws.user.sub,
        },
      });

      // Broadcaster aux autres clients
      wsManager.broadcast(
        `${ws.user.orgId}:${modelId}`,
        {
          type: "alert_acknowledged",
          alertId,
          acknowledgedBy: ws.user.sub,
          timestamp: Date.now(),
        },
        (otherWs) => otherWs.id !== ws.id
      );
    } catch (error) {
      logger.error("Acknowledge failed", { error: error.message });
    }
  },

  async handleDismiss(ws, message, modelId) {
    const { alertId, reason } = message;
    if (!alertId) return;

    try {
      await prisma.alert.update({
        where: { id: alertId },
        data: {
          dismissedAt: new Date(),
          dismissedBy: ws.user.sub,
          dismissedReason: reason,
        },
      });
    } catch (error) {
      logger.error("Dismiss failed", { error: error.message });
    }
  },

  async handleHistoryRequest(ws, message, modelId) {
    const { since, limit = 50 } = message;
    
    try {
      const alerts = await prisma.alert.findMany({
        where: {
          modelId,
          tenantId: ws.user.orgId,
          createdAt: { 
            gte: new Date(since || Date.now() - 24 * 3600 * 1000) 
          },
        },
        orderBy: { createdAt: "desc" },
        take: Math.min(parseInt(limit) || 50, 200),
      });

      wsManager.send(ws, { type: "alert_history", alerts });
    } catch (error) {
      wsManager.send(ws, { type: "error", message: "Failed to fetch history" });
    }
  },

  async handleThresholdSet(ws, message, modelId) {
    const { sensorId, min, max } = message;
    if (!sensorId) return;

    try {
      await prisma.sensorThreshold.upsert({
        where: { sensorId },
        create: {
          sensorId,
          minValue: min,
          maxValue: max,
          setBy: ws.user.sub,
        },
        update: {
          minValue: min,
          maxValue: max,
          updatedBy: ws.user.sub,
          updatedAt: new Date(),
        },
      });

      wsManager.send(ws, { type: "threshold_updated", sensorId, min, max });
      metrics.alertThresholdsSet.inc();
    } catch (error) {
      wsManager.send(ws, { type: "error", message: "Failed to set threshold" });
    }
  },
};

/**
 * Helper pour broadcaster une nouvelle alerte (utilisé par les workers IoT)
 */
async function emitAlert(tenantId, modelId, alertData) {
  // Persister
  const alert = await prisma.alert.create({
    data: {
      tenantId,
      modelId,
      severity: alertData.severity || "warning",
      title: alertData.title,
      location: alertData.location,
      sensorId: alertData.sensorId,
      assetId: alertData.assetId,
      value: alertData.value,
      threshold: alertData.threshold,
    },
  }).catch(err => {
    logger.error("Failed to persist alert", { error: err.message });
    return null;
  });

  // Broadcaster
  if (alert) {
    wsManager.broadcastAlert(tenantId, modelId, alert);
    metrics.alertsEmitted.inc({ severity: alert.severity });
  }
}

module.exports = { bimAlertHandler, emitAlert };
