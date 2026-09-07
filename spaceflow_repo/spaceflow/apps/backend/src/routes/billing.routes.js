const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const {
  createCheckoutSession,
  createBillingPortalSession,
  constructWebhookEvent,
  syncSubscriptionToTenant,
  recordSubscriptionInvoice,
  PLANS
} = require('../services/stripe.service');
const logger = require('../utils/logger');

// ─── 1. LISTE DES PLANS ───────────────────────────────────────────────────────
/**
 * GET /api/billing/plans
 * Retourne la grille des plans, tarifs (mensuel/annuel) et quotas
 */
router.get('/plans', (req, res) => {
  res.json({
    plans: PLANS,
    intervals: {
      MONTHLY: { label: 'Mensuel', discountPercent: 0 },
      YEARLY: { label: 'Annuel', discountPercent: 20, badge: '2 mois offerts' }
    }
  });
});

// ─── 2. ÉTAT DU PLAN ACTUEL DU TENANT ─────────────────────────────────────────
/**
 * GET /api/billing/current
 * Récupère les détails du plan actif, statut d'abonnement et consommation des quotas
 */
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant context manquant' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        billingInterval: true,
        subscriptionStatus: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        trialEndsAt: true,
        maxUsers: true,
        maxAssets: true,
        maxTicketsPerMonth: true,
        features: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true
      }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Organisation introuvable' });
    }

    // Calculer la consommation réelle
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [currentUsersCount, currentAssetsCount, monthlyTicketsCount] = await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.asset.count({ where: { tenantId } }),
      prisma.ticket.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth }
        }
      })
    ]);

    const planDef = PLANS[tenant.plan] || PLANS.FREE;

    res.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug
      },
      subscription: {
        plan: tenant.plan,
        planName: planDef.name,
        interval: tenant.billingInterval,
        status: tenant.subscriptionStatus,
        currentPeriodStart: tenant.currentPeriodStart,
        currentPeriodEnd: tenant.currentPeriodEnd,
        cancelAtPeriodEnd: tenant.cancelAtPeriodEnd,
        trialEndsAt: tenant.trialEndsAt,
        hasPaymentMethod: Boolean(tenant.stripeCustomerId)
      },
      usage: {
        users: {
          current: currentUsersCount,
          max: tenant.maxUsers,
          isUnlimited: tenant.maxUsers === -1,
          percent: tenant.maxUsers > 0 ? Math.min(100, Math.round((currentUsersCount / tenant.maxUsers) * 100)) : 0
        },
        assets: {
          current: currentAssetsCount,
          max: tenant.maxAssets,
          isUnlimited: tenant.maxAssets === -1,
          percent: tenant.maxAssets > 0 ? Math.min(100, Math.round((currentAssetsCount / tenant.maxAssets) * 100)) : 0
        },
        tickets: {
          current: monthlyTicketsCount,
          max: tenant.maxTicketsPerMonth,
          isUnlimited: tenant.maxTicketsPerMonth === -1,
          percent: tenant.maxTicketsPerMonth > 0 ? Math.min(100, Math.round((monthlyTicketsCount / tenant.maxTicketsPerMonth) * 100)) : 0
        }
      },
      features: tenant.features || planDef.features
    });
  } catch (err) {
    logger.error({ err: err.message }, 'Erreur récupération abonnement actuel');
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ─── 3. CRÉATION D'UNE SESSION CHECKOUT ────────────────────────────────────────
/**
 * POST /api/billing/checkout
 * Body: { planKey: 'STARTER' | 'PRO' | 'BUSINESS', interval: 'MONTHLY' | 'YEARLY', successUrl, cancelUrl }
 */
router.post('/checkout', authMiddleware, requireRole('ADMIN', 'OWNER'), async (req, res) => {
  try {
    const { planKey, interval = 'MONTHLY', successUrl, cancelUrl } = req.body;
    if (!planKey || !PLANS[planKey]) {
      return res.status(400).json({ error: 'Plan spécifié invalide' });
    }

    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant context manquant' });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({ error: 'Organisation introuvable' });
    }

    const result = await createCheckoutSession({
      tenant,
      user: req.user,
      planKey,
      interval,
      successUrl,
      cancelUrl
    });

    res.json(result);
  } catch (err) {
    logger.error({ err: err.message }, 'Erreur création checkout Stripe');
    res.status(500).json({ error: err.message || 'Impossible de créer la session de paiement' });
  }
});

// ─── 4. PORTAIL CLIENT STRIPE ─────────────────────────────────────────────────
/**
 * POST /api/billing/portal
 * Redirige l'administrateur vers le portail de gestion d'abonnement Stripe
 */
router.post('/portal', authMiddleware, requireRole('ADMIN', 'OWNER'), async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

    if (!tenant?.stripeCustomerId) {
      return res.status(400).json({
        error: 'NO_ACTIVE_SUBSCRIPTION',
        message: 'Aucun compte de facturation actif. Veuillez souscrire à un plan au préalable.'
      });
    }

    const url = await createBillingPortalSession(tenant.stripeCustomerId, req.body.returnUrl);
    res.json({ url });
  } catch (err) {
    logger.error({ err: err.message }, 'Erreur génération URL portail Stripe');
    res.status(500).json({ error: err.message || 'Impossible d\'ouvrir le portail de facturation' });
  }
});

// ─── 5. HISTORIQUE DES FACTURES ───────────────────────────────────────────────
/**
 * GET /api/billing/invoices
 * Récupère l'historique des factures du tenant
 */
router.get('/invoices', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'Tenant manquant' });

    const invoices = await prisma.subscriptionInvoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ invoices });
  } catch (err) {
    logger.error({ err: err.message }, 'Erreur récupération factures');
    res.status(500).json({ error: 'Erreur interne lors de la récupération des factures' });
  }
});

// ─── 6. WEBHOOK STRIPE ────────────────────────────────────────────────────────
/**
 * POST /api/billing/webhook
 * Handler Stripe Webhooks (Sécurisé par signature Stripe)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    const rawPayload = req.rawBody || req.body;
    event = constructWebhookEvent(rawPayload, signature);
  } catch (err) {
    logger.error({ err: err.message }, 'Erreur signature Webhook Stripe');
    return res.status(400).json({ error: `Webhook Signature Error: ${err.message}` });
  }

  logger.info({ eventType: event.type, eventId: event.id }, 'Événement Stripe Webhook reçu');

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { tenantId, planKey } = session.metadata || {};

        if (session.subscription) {
          const { getSubscription } = require('../services/stripe.service');
          const subscription = await getSubscription(session.subscription);
          if (subscription) {
            await syncSubscriptionToTenant(subscription);
          }
        } else if (tenantId && planKey) {
          const planDef = PLANS[planKey] || PLANS.FREE;
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              plan: planKey,
              stripeCustomerId: session.customer,
              subscriptionStatus: 'ACTIVE',
              maxUsers: planDef.quotas.maxUsers,
              maxAssets: planDef.quotas.maxAssets,
              maxTicketsPerMonth: planDef.quotas.maxTicketsPerMonth,
              features: planDef.features
            }
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await syncSubscriptionToTenant(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        
        const freePlan = PLANS.FREE;
        await prisma.tenant.updateMany({
          where: {
            OR: [
              { stripeSubscriptionId: subscription.id },
              { stripeCustomerId: customerId }
            ]
          },
          data: {
            plan: 'FREE',
            subscriptionStatus: 'CANCELED',
            stripeSubscriptionId: null,
            maxUsers: freePlan.quotas.maxUsers,
            maxAssets: freePlan.quotas.maxAssets,
            maxTicketsPerMonth: freePlan.quotas.maxTicketsPerMonth,
            features: freePlan.features
          }
        });
        logger.info({ subscriptionId: subscription.id }, 'Abonnement résilié — Tenant repassé en FREE');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await recordSubscriptionInvoice(invoice);

        // Mettre à jour le statut du tenant à ACTIVE si besoin
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        await prisma.tenant.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: 'ACTIVE' }
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await recordSubscriptionInvoice(invoice);

        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        await prisma.tenant.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: 'PAST_DUE' }
        });
        logger.warn({ invoiceId: invoice.id, customerId }, 'Paiement facture échoué — Tenant marqué PAST_DUE');
        break;
      }

      default:
        logger.debug({ eventType: event.type }, 'Événement Stripe non traité');
    }

    res.json({ received: true });
  } catch (err) {
    logger.error({ err: err.message, eventType: event.type }, 'Erreur traitement Webhook Stripe');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
