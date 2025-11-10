import express, { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Create checkout session for listing
router.post('/create-checkout-session', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId, amount, currency = 'eur' } = req.body;

    if (!listingId || !amount) {
      res.status(400).json({ error: 'listingId and amount are required' });
      return;
    }

    // Get listing details
    const listingResult = await query(
      'SELECT l.*, u.email as seller_email, u.name as seller_name FROM listings l JOIN users u ON l.user_id = u.id WHERE l.id = $1',
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const listing = listingResult.rows[0];

    // Calculate commission (5%)
    const commission = Math.round(amount * 0.05);
    const sellerAmount = amount - commission;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'] as any,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency as any,
            product_data: {
              name: `${listing.model_name} - BikeMarket`,
              description: listing.description || 'Bicycle from BikeMarket',
              images: listing.photos ? JSON.parse(listing.photos)[0] ? [JSON.parse(listing.photos)[0]] : [] : [],
            },
            unit_amount: amount * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      customer_email: (req.user as any).email,
      metadata: {
        listingId,
        buyerId: req.user?.id,
        sellerId: listing.user_id,
        commission: commission.toString(),
        sellerAmount: sellerAmount.toString(),
      },
    } as any);

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle webhook from Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === 'paid' && session.metadata) {
        const { listingId, buyerId, sellerId, commission, sellerAmount } = session.metadata;

        // Create transaction record
        const transactionId = uuidv4();
        await query(
          `INSERT INTO transactions
           (id, listing_id, buyer_id, seller_id, amount, commission, payment_method, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [
            transactionId,
            listingId,
            buyerId,
            sellerId,
            parseInt(sellerAmount) + parseInt(commission),
            parseInt(commission),
            'stripe',
            'completed',
          ]
        );

        // Update listing status to sold
        await query('UPDATE listings SET status = $1 WHERE id = $2', ['sold', listingId]);

        console.log(`Payment completed for transaction ${transactionId}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Webhook error');
  }
});

// Get payment status
router.get('/status/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      status: session.payment_status,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Create connected account for seller payout
router.post('/create-connected-account', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, country = 'EE' } = req.body;

    const account = await stripe.accounts.create({
      type: 'express' as any,
      email: email,
      country: country,
      metadata: {
        userId: req.user?.id,
      },
    } as any);

    // Save account ID to database
    await query(
      'UPDATE users SET stripe_account_id = $1 WHERE id = $2',
      [account.id, req.user?.id]
    );

    res.json({
      accountId: account.id,
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Failed to create connected account' });
  }
});

// Get onboarding link for seller
router.get('/onboarding-link/:accountId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accountId } = req.params;

    const link = await stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding' as any,
      refresh_url: `${process.env.FRONTEND_URL}/onboarding`,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    } as any);

    res.json({
      url: link.url,
    });
  } catch (error) {
    console.error('Onboarding link error:', error);
    res.status(500).json({ error: 'Failed to create onboarding link' });
  }
});

export default router;
