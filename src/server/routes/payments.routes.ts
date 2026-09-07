import { Router } from 'express';
import { 
  createSubscription, 
  verifySubscription, 
  verifyWebhookSignature, 
  processWebhookEvent,
  createPayPalOrder,
  capturePayPalOrder
} from '../services/paypal.service';
import { updateUser } from '../services/auth.service';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';

export const paymentsRouter = Router();
export const paypalRouter = Router();

paymentsRouter.use(auditMiddleware('PAYMENT'));
paypalRouter.use(auditMiddleware('PAYPAL'));

// ── Payments Router (/api/payments) ─────────────────────────────
paymentsRouter.post('/create-subscription', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { planId, returnUrl, cancelUrl } = req.body;
    const userId = req.user?.userId || 'usr-default';
    
    const subResult = await createSubscription(planId, userId, returnUrl, cancelUrl);
    res.json({ success: true, ...subResult });
  } catch (error: any) {
    console.error('[API Billing] Create subscription error:', error.message);
    res.status(500).json({ error: 'Impossible de créer la souscription PayPal' });
  }
});

paymentsRouter.post('/init-sub', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { subscriptionId, planType } = req.body;
    const userId = req.user?.userId || 'usr-default';

    const updated = await updateUser(userId, {
      paypalSubscriptionId: subscriptionId,
      subscriptionStatus: 'active',
      role: 'PRO',
      plan: planType || 'PRO',
    });

    res.json({
      success: true,
      message: 'Abonnement activé et associé avec succès !',
      user: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── PayPal Router (/api/paypal) ──────────────────────────────────
paypalRouter.post('/verify-subscription', async (req, res) => {
  try {
    const { subscriptionId, userId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ error: 'subscriptionId manquant' });
    }

    const subscription = await verifySubscription(subscriptionId);

    if (subscription.status === 'ACTIVE' || subscription.status === 'APPROVED' || subscription.simulated) {
      if (userId) {
        await updateUser(userId, {
          subscriptionStatus: 'active',
          role: 'PRO',
          paypalSubscriptionId: subscriptionId,
        });
      }
      return res.json({ success: true, status: 'ACTIVE', subscription });
    }

    return res.status(400).json({ success: false, status: subscription.status });
  } catch (error: any) {
    console.error('PayPal Verify Error:', error.message);
    res.status(500).json({ error: "Erreur lors de la vérification de l'abonnement" });
  }
});

paypalRouter.get('/config', (req, res) => {
  res.json({
    clientId:
      process.env.PAYPAL_CLIENT_ID ||
      'BAAd4qjSxz7BLyZM95yOWEO0G7s2OUm_qDWLGEgwpeUEG1NNH6_02kGPlhmr8OK98lbscHbMVIin7NGhdc',
    appName: process.env.PAYPAL_APP_NAME || 'bizos',
    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
    currency: 'EUR',
    plans: {
      PRO: {
        monthly: 49,
        annualMonthly: 39,
        planId: process.env.PAYPAL_PLAN_ID_PRO || 'P-PRO-BIZOS',
      },
      ENTERPRISE: {
        monthly: 199,
        annualMonthly: 159,
        planId: process.env.PAYPAL_PLAN_ID_ENTERPRISE || 'P-ENTERPRISE-BIZOS',
      },
    },
  });
});

paypalRouter.post('/create-order', async (req: any, res) => {
  try {
    const { amount, currency, planType, userId } = req.body;
    const order = await createPayPalOrder(
      amount ? Number(amount) : planType === 'ENTERPRISE' ? 199 : 49,
      currency || 'EUR',
      planType || 'PRO',
      userId || req.user?.userId || 'usr-bizos'
    );
    res.json(order);
  } catch (error: any) {
    console.error('PayPal Create Order Error:', error.message);
    res.status(500).json({ error: error.message || 'Impossible de créer la commande PayPal' });
  }
});

paypalRouter.post('/capture-order', async (req: any, res) => {
  try {
    const { orderId, userId, planType } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId requis' });
    }
    const capture = await capturePayPalOrder(orderId, userId || req.user?.userId, planType || 'PRO');
    res.json({ success: true, capture });
  } catch (error: any) {
    console.error('PayPal Capture Order Error:', error.message);
    res.status(500).json({ error: error.message || 'Impossible de finaliser le paiement PayPal' });
  }
});

paypalRouter.post('/webhook', async (req, res) => {
  try {
    const isValid = await verifyWebhookSignature(req.headers as any, req.body);
    if (!isValid && process.env.NODE_ENV === 'production') {
      console.warn('[PayPal Webhook] Signature invalide rejetée.');
      return res.status(400).json({ error: 'Signature de webhook invalide' });
    }

    const result = await processWebhookEvent(req.body);
    res.status(200).json({ status: 'OK', ...result });
  } catch (err: any) {
    console.error('[PayPal Webhook] Erreur:', err.message);
    res.status(500).json({ error: 'Erreur lors du traitement du Webhook' });
  }
});
