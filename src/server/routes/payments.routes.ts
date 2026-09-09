import { Router } from 'express';
import { authenticate, checkSubscription } from '../middlewares/auth.middleware';
import { 
  createSubscriptionHandler,
  initSubHandler,
  verifySubscriptionHandler,
  getPaypalConfig,
  createOrderHandler,
  captureOrderHandler,
  paypalWebhookHandler,
  aiPredictProHandler,
  esgProReportHandler
} from '../controllers/payments.controller';

const router = Router();

router.post('/payments/create-subscription', authenticate, createSubscriptionHandler);
router.post('/payments/init-sub', authenticate, initSubHandler);
router.post('/paypal/verify-subscription', verifySubscriptionHandler);
router.get('/paypal/config', getPaypalConfig);
router.post('/paypal/create-order', createOrderHandler);
router.post('/paypal/capture-order', captureOrderHandler);
router.post('/paypal/webhook', paypalWebhookHandler);
router.post('/ai/predict', authenticate, checkSubscription, aiPredictProHandler);
router.get('/esg/pro-report', authenticate, checkSubscription, esgProReportHandler);

export default router;
