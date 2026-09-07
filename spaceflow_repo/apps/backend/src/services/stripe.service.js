const { prisma } = require('../config/database');
const logger = require('../utils/logger');

let Stripe = null;
try {
  Stripe = require('stripe');
} catch (e) {
  // Stripe optional
}

let stripeInstance = null;

const getStripe = () => {
  if (!stripeInstance) {
    if (!Stripe) {
      throw new Error("Le package Stripe n'est pas disponible");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2024-06-20'
    });
  }
  return stripeInstance;
};

// ─── PLANS DE SOUSCRIPTION GMAO BEECARBONIT ──────────────────────────────────
const PLANS = {
  FREE: {
    key: 'FREE',
    name: 'Free',
    description: 'Pour tester le produit, TPE et solos',
    price: { monthly: 0, yearly: 0 },
    priceIds: {
      monthly: null,
      yearly: null
    },
    quotas: {
      maxUsers: 3,
      maxAssets: 10,
      maxTicketsPerMonth: 50,
      maxSites: 1
    },
    features: {
      preventive: false,
      reportsPdfExcel: false,
      bim: false,
      apiKeys: false,
      webhooks: false,
      multiSite: false,
      auditLogs: false,
      sso: false,
      supportPriority: false,
      support247: false
    }
  },
  STARTER: {
    key: 'STARTER',
    name: 'Starter',
    description: 'Pour PME et startups en croissance',
    price: { monthly: 29, yearly: 24 }, // 24€/mois facturé annuellement (288€/an)
    priceIds: {
      monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly_placeholder',
      yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly_placeholder'
    },
    quotas: {
      maxUsers: -1, // Illimité
      maxAssets: 100,
      maxTicketsPerMonth: -1,
      maxSites: 1
    },
    features: {
      preventive: true,
      reportsPdfExcel: true,
      bim: false,
      apiKeys: false,
      webhooks: false,
      multiSite: false,
      auditLogs: false,
      sso: false,
      supportPriority: false,
      support247: false
    }
  },
  PRO: {
    key: 'PRO',
    name: 'Pro',
    description: 'Pour entreprises industrielles et multi-sites',
    price: { monthly: 79, yearly: 65 }, // 65€/mois facturé annuellement (780€/an)
    priceIds: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_placeholder',
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly_placeholder'
    },
    quotas: {
      maxUsers: -1,
      maxAssets: -1, // Illimité
      maxTicketsPerMonth: -1,
      maxSites: 5
    },
    features: {
      preventive: true,
      reportsPdfExcel: true,
      bim: true,
      apiKeys: true,
      webhooks: true,
      multiSite: true,
      auditLogs: false,
      sso: false,
      supportPriority: true,
      support247: false
    }
  },
  BUSINESS: {
    key: 'BUSINESS',
    name: 'Business',
    description: 'Pour grands comptes, ETI et organisations complexes',
    price: { monthly: 149, yearly: 125 }, // 125€/mois facturé annuellement (1500€/an)
    priceIds: {
      monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || 'price_business_monthly_placeholder',
      yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || 'price_business_yearly_placeholder'
    },
    quotas: {
      maxUsers: -1,
      maxAssets: -1,
      maxTicketsPerMonth: -1,
      maxSites: -1
    },
    features: {
      preventive: true,
      reportsPdfExcel: true,
      bim: true,
      apiKeys: true,
      webhooks: true,
      multiSite: true,
      auditLogs: true,
      sso: true,
      mfaEnforced: true,
      sla: '99.9%',
      supportPriority: true,
      support247: true
    }
  },
  ENTERPRISE: {
    key: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Sur devis — On-premise, intégrations custom & SLA 99.99%',
    price: { monthly: 'custom', yearly: 'custom' },
    priceIds: {
      monthly: null,
      yearly: null
    },
    quotas: {
      maxUsers: -1,
      maxAssets: -1,
      maxTicketsPerMonth: -1,
      maxSites: -1
    },
    features: {
      preventive: true,
      reportsPdfExcel: true,
      bim: true,
      apiKeys: true,
      webhooks: true,
      multiSite: true,
      auditLogs: true,
      sso: true,
      mfaEnforced: true,
      onPremise: true,
      dedicatedInstance: true,
      customDev: true,
      sla: '99.99%',
      supportPriority: true,
      support247: true
    }
  }
};

/**
 * Créer ou récupérer un Stripe Customer pour une organisation (Tenant)
 */
const getOrCreateTenantCustomer = async ({ tenant, user }) => {
  const stripe = getStripe();
  if (tenant.stripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(tenant.stripeCustomerId);
      if (!existing.deleted) return existing;
    } catch (err) {
      logger.warn({ tenantId: tenant.id, err: err.message }, 'Stripe customer introuvable, création d\'un nouveau');
    }
  }

  const customer = await stripe.customers.create({
    email: user?.email,
    name: tenant.name,
    metadata: {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      createdById: user?.id
    }
  });

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { stripeCustomerId: customer.id }
  });

  return customer;
};

/**
 * Créer une session Stripe Checkout pour souscrire à un plan
 */
const createCheckoutSession = async ({ tenant, user, planKey, interval = 'MONTHLY', successUrl, cancelUrl }) => {
  const plan = PLANS[planKey];
  if (!plan) throw new Error(`Plan inconnu: ${planKey}`);
  if (planKey === 'FREE' || planKey === 'ENTERPRISE') {
    throw new Error(`Le plan ${planKey} ne nécessite pas de checkout Stripe direct`);
  }

  const intervalNormalized = interval.toLowerCase() === 'yearly' ? 'yearly' : 'monthly';
  const priceId = plan.priceIds[intervalNormalized];

  // Mode Fallback pour dev / mock
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
    logger.info({ planKey, intervalNormalized }, '[Stripe] Mode simulation dev actif');
    const targetUrl = `${successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing`}?simulated=true&plan=${planKey}&interval=${intervalNormalized}`;
    return { sessionId: 'sess_simulated_gmao', url: targetUrl, customerId: 'cus_simulated' };
  }

  const stripe = getStripe();
  const customer = await getOrCreateTenantCustomer({ tenant, user });

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
    cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?canceled=true`,
    metadata: {
      tenantId: tenant.id,
      planKey,
      interval: intervalNormalized.toUpperCase()
    },
    subscription_data: {
      metadata: {
        tenantId: tenant.id,
        planKey,
        interval: intervalNormalized.toUpperCase()
      }
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required'
  });

  return { sessionId: session.id, url: session.url, customerId: customer.id };
};

/**
 * Créer un lien vers le portail client Stripe (gestion abonnement & factures)
 */
const createBillingPortalSession = async (stripeCustomerId, returnUrl) => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
    return returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing`;
  }
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing`
  });
  return session.url;
};

/**
 * Vérifier la signature d'un webhook Stripe
 */
const constructWebhookEvent = (payload, signature) => {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
  );
};

/**
 * Récupérer les détails d'un abonnement Stripe
 */
const getSubscription = async (subscriptionId) => {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId);
};

/**
 * Synchroniser les données d'abonnement Stripe dans la base de données Tenant
 */
const syncSubscriptionToTenant = async (subscription) => {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { stripeCustomerId: customerId },
        { stripeSubscriptionId: subscription.id }
      ]
    }
  });

  if (!tenant) {
    logger.warn({ customerId, subscriptionId: subscription.id }, 'Tenant introuvable pour synchronisation abonnement');
    return null;
  }

  // Déterminer le plan à partir des métadonnées ou du priceId
  let planKey = subscription.metadata?.planKey || tenant.plan;
  const priceId = subscription.items?.data?.[0]?.price?.id;

  // Si non trouvé dans metadata, chercher dans les PLANS
  if (!subscription.metadata?.planKey && priceId) {
    for (const [key, p] of Object.entries(PLANS)) {
      if (p.priceIds?.monthly === priceId || p.priceIds?.yearly === priceId) {
        planKey = key;
        break;
      }
    }
  }

  const planDef = PLANS[planKey] || PLANS.FREE;
  const interval = subscription.items?.data?.[0]?.price?.recurring?.interval === 'year' ? 'YEARLY' : 'MONTHLY';

  // Map Stripe status to Prisma SubscriptionStatus
  let statusMap = {
    active: 'ACTIVE',
    trialing: 'TRIALING',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
    incomplete: 'INCOMPLETE',
    paused: 'PAUSED'
  };
  const subscriptionStatus = statusMap[subscription.status] || 'ACTIVE';

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      plan: planKey,
      billingInterval: interval,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      subscriptionStatus,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      maxUsers: planDef.quotas.maxUsers,
      maxAssets: planDef.quotas.maxAssets,
      maxTicketsPerMonth: planDef.quotas.maxTicketsPerMonth,
      features: planDef.features
    }
  });

  logger.info({ tenantId: tenant.id, planKey, subscriptionStatus }, 'Abonnement tenant synchronisé avec succès');
  return updatedTenant;
};

/**
 * Enregistrer ou mettre à jour une facture Stripe dans la base de données
 */
const recordSubscriptionInvoice = async (invoice) => {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  const tenant = await prisma.tenant.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!tenant) {
    logger.warn({ customerId, invoiceId: invoice.id }, 'Tenant introuvable pour enregistrer la facture');
    return null;
  }

  const record = await prisma.subscriptionInvoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      tenantId: tenant.id,
      stripeInvoiceId: invoice.id,
      stripeCustomerId: customerId,
      amountDue: invoice.amount_due || 0,
      amountPaid: invoice.amount_paid || 0,
      currency: invoice.currency || 'eur',
      status: invoice.status || 'paid',
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null
    },
    update: {
      amountDue: invoice.amount_due || 0,
      amountPaid: invoice.amount_paid || 0,
      status: invoice.status || 'paid',
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf
    }
  });

  return record;
};

module.exports = {
  getStripe,
  PLANS,
  getOrCreateTenantCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  constructWebhookEvent,
  getSubscription,
  syncSubscriptionToTenant,
  recordSubscriptionInvoice
};
