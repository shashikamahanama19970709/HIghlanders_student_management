import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { StripeService } from '@/lib/stripe';
import { sendEmail } from '@/lib/mail';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: any;

  try {
    // If webhook secret or signature is placeholder (Mock mode), parse directly
    if (StripeService.isMock() || !signature || !webhookSecret) {
      event = JSON.parse(payload);
    } else {
      event = StripeService.constructWebhookEvent(payload, signature, webhookSecret);
    }
  } catch (error: any) {
    console.error(`[Stripe Webhook] Error parsing event: ${error.message}`);
    return NextResponse.json({ success: false, error: 'Webhook error' }, { status: 400 });
  }

  const db = await getDatabase();
  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.metadata?.email || session.customer_details?.email;
        const subscriptionId = session.metadata?.subscriptionId;

        if (email && subscriptionId) {
          const plan = await db.collection('subscriptions').findOne({ _id: new ObjectId(subscriptionId) });
          if (plan) {
            const now = new Date();
            const nextPaymentDate = new Date();
            if (plan.billingCycle === 'quarterly') {
              nextPaymentDate.setDate(now.getDate() + 90);
            } else if (plan.billingCycle === 'yearly') {
              nextPaymentDate.setDate(now.getDate() + 365);
            } else {
              nextPaymentDate.setDate(now.getDate() + 30);
            }

            // Update user subscription to active
            await db.collection('users').updateOne(
              { email },
              {
                $set: {
                  subscription: {
                    planId: plan._id.toString(),
                    planName: plan.name,
                    price: plan.price,
                    billingCycle: plan.billingCycle,
                    status: 'active',
                    startDate: now,
                    nextPaymentDate: nextPaymentDate,
                    stripeSubscriptionId: session.id,
                  },
                  updatedAt: now
                }
              }
            );

            // Add payment entry
            await db.collection('payments').insertOne({
              email,
              amount: plan.price,
              status: 'completed',
              planName: plan.name,
              billingCycle: plan.billingCycle,
              paymentMethod: 'card',
              transactionId: session.id,
              invoiceUrl: (session as any).invoice ? `https://dashboard.stripe.com/invoices/${(session as any).invoice}` : 'https://stripe.com/docs/invoices',
              receiptUrl: (session as any).payment_intent ? `https://dashboard.stripe.com/payments/${(session as any).payment_intent}` : 'https://stripe.com/docs/receipts',
              createdAt: now,
            });

            // Send confirmation email
            await sendEmail({
              to: email,
              subject: 'Highlanders Taekwondo - Subscription Activated via Stripe',
              text: `Hello,\n\nWe successfully processed your Stripe payment. Your subscription to "${plan.name}" is now active!\nNext payment: ${nextPaymentDate.toLocaleDateString()}.\n\nBest regards,\nHighlanders Taekwondo Team`,
              html: `<h3>Subscription Activated!</h3><p>Your subscription to <strong>${plan.name}</strong> is now active!</p><p>Next payment: ${nextPaymentDate.toLocaleDateString()}</p>`,
              senderType: 'admin'
            });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const email = invoice.customer_email;
        
        if (email) {
          // This represents a successful recurring payment
          const user = await db.collection('users').findOne({ email });
          if (user && user.subscription) {
            const planPrice = invoice.amount_paid ? invoice.amount_paid / 100 : user.subscription.price;
            
            // Push payment date forward
            const now = new Date();
            const nextPaymentDate = new Date();
            if (user.subscription.billingCycle === 'quarterly') {
              nextPaymentDate.setDate(now.getDate() + 90);
            } else if (user.subscription.billingCycle === 'yearly') {
              nextPaymentDate.setDate(now.getDate() + 365);
            } else {
              nextPaymentDate.setDate(now.getDate() + 30);
            }

            // Update user next payment date
            await db.collection('users').updateOne(
              { email },
              { 
                $set: { 
                  'subscription.nextPaymentDate': nextPaymentDate,
                  'subscription.status': 'active',
                  updatedAt: now
                } 
              }
            );

            // Log payment
            await db.collection('payments').insertOne({
              email,
              amount: planPrice,
              status: 'completed',
              planName: user.subscription.planName,
              billingCycle: user.subscription.billingCycle,
              paymentMethod: 'card_stripe_recurring',
              transactionId: (invoice as any).id || (invoice as any).payment_intent,
              invoiceUrl: (invoice as any).hosted_invoice_url || 'https://stripe.com/docs/invoices',
              receiptUrl: (invoice as any).hosted_invoice_url || 'https://stripe.com/docs/receipts',
              createdAt: now,
            });

            // Send receipt email
            await sendEmail({
              to: email,
              subject: 'Highlanders Taekwondo - Recurring Payment Successful',
              text: `Hello,\n\nYour recurring subscription payment of £${planPrice} has been successfully processed.\nNext payment date: ${nextPaymentDate.toLocaleDateString()}.\n\nBest regards,\nHighlanders Taekwondo Team`,
              html: `<h3>Payment Receipt</h3><p>Your automatic subscription payment has been successfully processed.</p><p>Amount: <strong>£${planPrice}</strong></p><p>Next Payment: <strong>${nextPaymentDate.toLocaleDateString()}</strong></p>`,
              senderType: 'admin'
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const email = invoice.customer_email;

        if (email) {
          // Set user status to unpaid
          await db.collection('users').updateOne(
            { email },
            { $set: { 'subscription.status': 'unpaid', updatedAt: new Date() } }
          );

          // Log failed payment
          await db.collection('payments').insertOne({
            email,
            amount: invoice.amount_due ? invoice.amount_due / 100 : 0,
            status: 'failed',
            paymentMethod: 'card_stripe_recurring',
            transactionId: invoice.id,
            createdAt: new Date(),
          });

          // Email the student about the failure
          await sendEmail({
            to: email,
            subject: 'Highlanders Taekwondo - Subscription Payment Failed',
            text: `Hello,\n\nYour recurring subscription payment for Highlanders Taekwondo has failed.\nPlease log in to the student portal and update your payment method to avoid membership suspension.\n\nBest regards,\nHighlanders Taekwondo Team`,
            html: `<h3>Subscription Payment Failed</h3><p>Your automatic subscription payment failed to process.</p><p>Please log in to your student portal and update your billing credentials to keep your active membership.</p>`,
            senderType: 'admin'
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // In real stripe, we'd retrieve customer and query by stripe customer ID
        // For simplicity, we search users by stripeSubscriptionId or check metadata
        const stripeSubscriptionId = subscription.id;
        
        const user = await db.collection('users').findOne({ 'subscription.stripeSubscriptionId': stripeSubscriptionId });
        if (user) {
          await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { 'subscription.status': 'cancelled', updatedAt: new Date() } }
          );

          // Email notification
          await sendEmail({
            to: user.email,
            subject: 'Highlanders Taekwondo - Subscription Cancelled',
            text: `Hello,\n\nYour subscription has been cancelled. You will continue to have access until the end of your billing cycle.\n\nBest regards,\nHighlanders Taekwondo Team`,
            html: `<h3>Subscription Cancelled</h3><p>Your membership subscription has been cancelled successfully.</p>`,
            senderType: 'admin'
          });
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Processing error:', error);
    return NextResponse.json({ success: false, error: 'Internal processing error' }, { status: 500 });
  }
}
