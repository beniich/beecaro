const webpush = require('web-push');
const { prisma } = require('../config/database');

// Configuration VAPID fallback si non défini
try {
  webpush.setVapidDetails(
    'mailto:admin@cafm.com',
    process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-Skv69yViEuiBIa',
    process.env.VAPID_PRIVATE_KEY || 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'
  );
} catch (e) {
  console.warn('VAPID Configuration warning:', e.message);
}

class PushService {
  async sendToUser(userId, notification) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId, active: true }
    });

    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (prefs?.quietHoursStart !== null && prefs?.quietHoursEnd !== null && prefs?.quietHoursStart !== undefined) {
      const hour = new Date().getHours();
      if (this.isQuietTime(hour, prefs.quietHoursStart, prefs.quietHoursEnd)) {
        if (notification.priority !== 'URGENT') return 0;
      }
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: typeof notification.data === 'string' ? JSON.parse(notification.data || '{}') : notification.data,
      tag: notification.type,
      requireInteraction: notification.priority === 'URGENT'
    });

    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          payload
        ).catch(err => {
          if (err.statusCode === 410) {
            return prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { active: false }
            });
          }
          throw err;
        })
      )
    );

    return results.filter(r => r.status === 'fulfilled').length;
  }

  async sendToTenant(tenantId, notification) {
    const users = await prisma.user.findMany({
      where: tenantId ? { tenantId, isActive: true } : { isActive: true }
    });
    
    await Promise.all([
      ...users.map(u => prisma.notification.create({
        data: {
          userId: u.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: typeof notification.data === 'object' ? JSON.stringify(notification.data) : notification.data,
          priority: notification.priority || 'NORMAL',
          tenantId
        }
      })),
      ...users.map(u => this.sendToUser(u.id, notification))
    ]);
  }

  async notifyWorkOrderAssigned(workOrder) {
    if (!workOrder.assignedToId) return;
    
    await this.sendToUser(workOrder.assignedToId, {
      type: 'WORK_ORDER',
      title: '📋 Nouvel ordre de travail',
      body: workOrder.title,
      data: { workOrderId: workOrder.id, url: `/work-orders/${workOrder.id}` },
      priority: workOrder.priority === 'CRITICAL' ? 'URGENT' : 'HIGH'
    });
  }

  async notifySensorAlert(sensor, value, threshold) {
    await this.sendToTenant(sensor.asset?.tenantId, {
      type: 'SENSOR',
      title: '⚠️ Alerte capteur',
      body: `${sensor.type}: ${value}${sensor.unit} (seuil: ${threshold})`,
      data: { sensorId: sensor.id, assetId: sensor.assetId },
      priority: 'HIGH'
    });
  }

  async notifyLowInventory(part) {
    await this.sendToTenant(part.tenantId, {
      type: 'INVENTORY',
      title: '📦 Stock bas',
      body: `${part.name}: ${part.quantity} restant(s)`,
      data: { partId: part.id },
      priority: 'NORMAL'
    });
  }

  isQuietTime(hour, start, end) {
    if (start < end) return hour >= start && hour < end;
    return hour >= start || hour < end;
  }
}

module.exports = new PushService();
