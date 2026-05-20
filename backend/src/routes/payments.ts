import { Router } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import express from 'express';

const router = Router();
const prisma = new PrismaClient();

// Use a mock key if STRIPE_SECRET_KEY is not defined to avoid crashing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

router.post('/create-checkout-session', authMiddleware, async (req: AuthRequest, res) => {
  const { planName, priceId } = req.body;
  const userId = req.user.id;

  try {
    // Determine price dynamically or use priceId from client
    let unitAmount = 0;
    if (planName === 'Pro') unitAmount = 1200; // $12.00
    else if (planName === 'Instructor') unitAmount = 2900; // $29.00
    else return res.status(400).json({ error: 'Invalid plan' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${planName} Plan`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/student?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        planName
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// We need to use express.raw for webhooks to verify signature, 
// so this should ideally be mounted before express.json() in index.ts, 
// or we just handle it specifically.
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    // If webhook secret is not set, we'll bypass signature verification for dev
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any; // Stripe.Checkout.Session
        const userId = session.client_reference_id || session.metadata?.userId;
        const planName = session.metadata?.planName;
        const customerId = session.customer as string;

        if (userId && planName) {
          // Update user in DB
          let newRole = undefined;
          if (planName === 'Instructor') {
            newRole = 'INSTRUCTOR';
          }
          
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionPlan: planName.toUpperCase(),
              stripeCustomerId: customerId,
              ...(newRole ? { role: newRole as any } : {})
            }
          });
          console.log(`Updated user ${userId} to ${planName} plan`);
        }
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
