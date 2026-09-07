const { prisma } = require('../config/database');
const { PLANS } = require('../services/stripe.service');
const logger = require('../utils/logger');

/**
 * Middleware pour bloquer l'accès si une fonctionnalité n'est pas incluse dans le plan du tenant
 * @param {string} featureName - Ex: 'bim', 'apiKeys', 'multiSite', 'auditLogs', 'preventive', 'reportsPdfExcel'
 */
const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant context manquant' });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, plan: true, features: true, subscriptionStatus: true }
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant introuvable' });
      }

      // Récupérer la définition du plan actuel
      const planDef = PLANS[tenant.plan] || PLANS.FREE;
      const tenantFeatures = (tenant.features && typeof tenant.features === 'object') ? tenant.features : planDef.features;

      const hasAccess = Boolean(tenantFeatures?.[featureName]);

      if (!hasAccess) {
        return res.status(403).json({
          error: 'FEATURE_NOT_AVAILABLE',
          message: `La fonctionnalité '${featureName}' n'est pas incluse dans votre plan ${tenant.plan}.`,
          currentPlan: tenant.plan,
          requiredPlan: featureName === 'bim' || featureName === 'apiKeys' ? 'PRO' : 'BUSINESS',
          upgradeUrl: '/billing'
        });
      }

      next();
    } catch (err) {
      logger.error({ err: err.message, featureName }, 'Erreur vérification feature flag billing');
      next(err);
    }
  };
};

/**
 * Middleware pour vérifier les quotas avant création de ressources
 * @param {'users' | 'assets' | 'tickets'} quotaType
 */
const checkQuota = (quotaType) => {
  return async (req, res, next) => {
    try {
      const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant context manquant' });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          plan: true,
          maxUsers: true,
          maxAssets: true,
          maxTicketsPerMonth: true,
          subscriptionStatus: true
        }
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant introuvable' });
      }

      if (quotaType === 'users') {
        if (tenant.maxUsers !== -1) {
          const currentCount = await prisma.user.count({ where: { tenantId } });
          if (currentCount >= tenant.maxUsers) {
            return res.status(403).json({
              error: 'QUOTA_EXCEEDED',
              quota: 'users',
              current: currentCount,
              max: tenant.maxUsers,
              message: `Vous avez atteint la limite de ${tenant.maxUsers} utilisateurs pour votre plan ${tenant.plan}. Passez au plan supérieur pour ajouter plus d'utilisateurs.`,
              upgradeUrl: '/billing'
            });
          }
        }
      } else if (quotaType === 'assets') {
        if (tenant.maxAssets !== -1) {
          const currentCount = await prisma.asset.count({ where: { tenantId } });
          if (currentCount >= tenant.maxAssets) {
            return res.status(403).json({
              error: 'QUOTA_EXCEEDED',
              quota: 'assets',
              current: currentCount,
              max: tenant.maxAssets,
              message: `Vous avez atteint la limite de ${tenant.maxAssets} équipements pour votre plan ${tenant.plan}. Passez au plan Pro pour un nombre d'équipements illimité.`,
              upgradeUrl: '/billing'
            });
          }
        }
      } else if (quotaType === 'tickets') {
        if (tenant.maxTicketsPerMonth !== -1) {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const currentCount = await prisma.ticket.count({
            where: {
              tenantId,
              createdAt: { gte: startOfMonth }
            }
          });
          if (currentCount >= tenant.maxTicketsPerMonth) {
            return res.status(403).json({
              error: 'QUOTA_EXCEEDED',
              quota: 'tickets',
              current: currentCount,
              max: tenant.maxTicketsPerMonth,
              message: `Vous avez atteint la limite de ${tenant.maxTicketsPerMonth} tickets pour ce mois dans votre plan ${tenant.plan}. Passez au plan Starter ou supérieur pour des tickets illimités.`,
              upgradeUrl: '/billing'
            });
          }
        }
      }

      next();
    } catch (err) {
      logger.error({ err: err.message, quotaType }, 'Erreur vérification quotas billing');
      next(err);
    }
  };
};

module.exports = {
  requireFeature,
  checkQuota
};
