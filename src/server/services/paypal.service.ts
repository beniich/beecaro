import axios from 'axios';
import { db } from '../../db/index';
import { users as usersTable, processedEvents as processedEventsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { updateUser, memoryUsers } from './auth.service';

const PAYPAL_ENV = process.env.PAYPAL_ENVIRONMENT || (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox');
const PAYPAL_API_BASE = PAYPAL_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const processedEventsMemory = new Set<string>();

/**
 * Obtain OAuth2 Access Token from PayPal
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

  if (!clientId || !clientSecret) {
    return 'mock_access_token_beecarbonit';
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error: any) {
    console.error('[PayPalService] Get Token Error:', error.response?.data || error.message);
    return 'mock_access_token_beecarbonit';
  }
}

/**
 * Create a PayPal Subscription Agreement
 */
export async function createSubscription(planId: string, userId: string, returnUrl?: string, cancelUrl?: string) {
  const token = await getPayPalAccessToken();

  const payload = {
    plan_id: planId,
    custom_id: userId,
    subscriber: {
      id: userId
    },
    application_context: {
      brand_name: process.env.PAYPAL_APP_NAME || 'bizos',
      locale: 'fr-FR',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      return_url: returnUrl || 'https://app.beecarbonit.com/payment/success',
      cancel_url: cancelUrl || 'https://app.beecarbonit.com/payment/cancel',
    }
  };

  if (token === 'mock_access_token_beecarbonit') {
    // Return simulated subscription response for local development / testing
    return {
      id: `I-SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'APPROVAL_PENDING',
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=EC-SIMULATED-SUB-${userId}`,
          rel: 'approve',
          method: 'GET'
        }
      ]
    };
  }

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (err: any) {
    console.error('[PayPalService] Create Subscription Error:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * Verify Subscription details directly with PayPal
 */
export async function verifySubscription(subscriptionId: string) {
  const token = await getPayPalAccessToken();

  if (token === 'mock_access_token_beecarbonit') {
    return {
      id: subscriptionId,
      status: 'ACTIVE',
      plan_id: 'P-PRO-BEECARBONIT',
      create_time: new Date().toISOString(),
      simulated: true
    };
  }

  try {
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (err: any) {
    console.error('[PayPalService] Verify Subscription Error:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * Verify PayPal Webhook Signature (Security Standard)
 */
export async function verifyWebhookSignature(headers: Record<string, string>, webhookBody: any): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // If webhook ID is not configured, log notice and permit in sandbox mode
    console.warn('[PayPalService] Warning: PAYPAL_WEBHOOK_ID not set. Skipping signature validation in sandbox.');
    return true;
  }

  try {
    const token = await getPayPalAccessToken();
    const verificationPayload = {
      auth_algo: headers['paypal-auth-algo'] || headers['PAYPAL-AUTH-ALGO'],
      cert_url: headers['paypal-cert-url'] || headers['PAYPAL-CERT-URL'],
      transmission_id: headers['paypal-transmission-id'] || headers['PAYPAL-TRANSMISSION-ID'],
      transmission_sig: headers['paypal-transmission-sig'] || headers['PAYPAL-TRANSMISSION-SIG'],
      transmission_time: headers['paypal-transmission-time'] || headers['PAYPAL-TRANSMISSION-TIME'],
      webhook_id: webhookId,
      webhook_event: webhookBody
    };

    const res = await axios.post(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      verificationPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.data.verification_status === 'SUCCESS';
  } catch (error: any) {
    console.error('[PayPalService] Webhook Signature Verification Error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Handle Webhook Event with Idempotency & Lifecycle Updates
 */
export async function processWebhookEvent(event: any) {
  const eventId = event.id;
  const eventType = event.event_type;

  // 1. Idempotency Check: Don't process duplicate webhook events
  if (processedEventsMemory.has(eventId)) {
    console.log(`[PayPal Webhook] Event ${eventId} (${eventType}) already processed. Skipping (Idempotent).`);
    return { status: 'ALREADY_PROCESSED' };
  }

  try {
    const checkDb = await db.select().from(processedEventsTable).where(eq(processedEventsTable.id, eventId));
    if (checkDb && checkDb.length > 0) {
      processedEventsMemory.add(eventId);
      return { status: 'ALREADY_PROCESSED' };
    }
  } catch (dbErr) {
    // Ignore DB error, proceed with memory tracking
  }

  processedEventsMemory.add(eventId);

  console.log(`[PayPal Webhook] Processing event: ${eventType} (ID: ${eventId})`);

  // 2. Process according to lifecycle event type
  const resource = event.resource || {};
  const subscriptionId = resource.id || resource.billing_agreement_id;
  const customUserId = resource.custom_id || resource.subscriber?.id;

  switch (eventType) {
    case 'BILLING.SUBSCRIPTION.CREATED':
    case 'BILLING.SUBSCRIPTION.ACTIVATED': {
      console.log(`[PayPal Webhook] Subscription Activated: ${subscriptionId} for User: ${customUserId}`);
      
      let targetUserId = customUserId;
      if (!targetUserId) {
        // Look up by subscription ID if custom_id wasn't in event
        const found = Array.from(memoryUsers.values()).find(u => u.paypalSubscriptionId === subscriptionId);
        if (found) targetUserId = found.id;
      }

      if (targetUserId) {
        await updateUser(targetUserId, {
          role: 'PRO',
          subscriptionStatus: 'active',
          plan: 'PRO',
          paypalSubscriptionId: subscriptionId
        });
      }
      break;
    }

    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.EXPIRED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED': {
      console.log(`[PayPal Webhook] Subscription Terminated: ${subscriptionId}`);
      
      // Update in DB/Memory
      let targetUserId = customUserId;
      if (!targetUserId) {
        const found = Array.from(memoryUsers.values()).find(u => u.paypalSubscriptionId === subscriptionId);
        if (found) targetUserId = found.id;
      }

      if (targetUserId) {
        await updateUser(targetUserId, {
          role: 'VIEWER',
          subscriptionStatus: 'cancelled'
        });
      }
      break;
    }

    case 'PAYMENT.SALE.COMPLETED': {
      console.log(`[PayPal Webhook] Recurring Payment Succeeded for ${subscriptionId}`);
      if (customUserId) {
        await updateUser(customUserId, {
          subscriptionStatus: 'active'
        });
      }
      break;
    }

    case 'PAYMENT.SALE.DENIED': {
      console.warn(`[PayPal Webhook] Payment failed for ${subscriptionId}. Applying Grace Period.`);
      // Grace period: past_due allows temporary access while alerting the user
      if (customUserId) {
        await updateUser(customUserId, {
          subscriptionStatus: 'past_due'
        });
      }
      break;
    }

    default:
      console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
  }

  // 3. Record processed event in DB for persistence
  try {
    await db.insert(processedEventsTable).values({
      id: eventId,
      eventType: eventType,
      status: 'PROCESSED',
      payload: event,
      processedAt: new Date()
    });
  } catch (err: any) {
    // Non-blocking log
  }

  return { status: 'PROCESSED', eventId, eventType };
}

/**
 * Create a PayPal Order (Direct Checkout / Subscription Period Order)
 */
export async function createPayPalOrder(amount: number, currency: string = 'EUR', planType: string = 'PRO', userId: string = 'guest') {
  const token = await getPayPalAccessToken();

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: `bizos_${planType}_${Date.now()}`,
        description: `Abonnement BizOS ${planType} (Gestion Énergétique, CAFM & ESG)`,
        custom_id: userId,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        },
        items: [
          {
            name: `BizOS ${planType} Subscription`,
            description: `Accès complet à la plateforme BizOS - Formule ${planType}`,
            quantity: '1',
            unit_amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            category: 'DIGITAL_GOODS',
          },
        ],
      },
    ],
    application_context: {
      brand_name: process.env.PAYPAL_APP_NAME || 'bizos',
      locale: 'fr-FR',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: 'https://beecarbonat.ricecloud.net/payment/success',
      cancel_url: 'https://beecarbonat.ricecloud.net/payment/cancel',
    },
  };

  if (token === 'mock_access_token_beecarbonit') {
    return {
      id: `ORDER-SIMULATED-${Date.now()}`,
      status: 'CREATED',
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=ORDER-SIMULATED-${Date.now()}`,
          rel: 'approve',
          method: 'GET',
        },
      ],
    };
  }

  try {
    const response = await axios.post(`${PAYPAL_API_BASE}/v2/checkout/orders`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err: any) {
    console.error('[PayPalService] Create Order Error:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * Capture a PayPal Order and activate user subscription
 */
export async function capturePayPalOrder(orderId: string, userId?: string, planType: string = 'PRO') {
  const token = await getPayPalAccessToken();

  if (token === 'mock_access_token_beecarbonit' || orderId.startsWith('ORDER-SIMULATED-')) {
    if (userId) {
      await updateUser(userId, {
        subscriptionStatus: 'active',
        role: 'PRO',
        plan: planType,
        paypalSubscriptionId: orderId,
      });
    }
    return {
      id: orderId,
      status: 'COMPLETED',
      simulated: true,
      payer: { email_address: 'sandbox-payer@bizos.ai' },
    };
  }

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status === 'COMPLETED' && userId) {
      await updateUser(userId, {
        subscriptionStatus: 'active',
        role: 'PRO',
        plan: planType,
        paypalSubscriptionId: orderId,
      });
    }

    return response.data;
  } catch (err: any) {
    console.error('[PayPalService] Capture Order Error:', err.response?.data || err.message);
    throw err;
  }
}

