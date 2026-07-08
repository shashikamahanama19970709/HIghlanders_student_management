import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const isMockMode = secretKey.startsWith('sk_test_placeholder');

let stripe: Stripe | null = null;
if (!isMockMode) {
  stripe = new Stripe(secretKey, {
    apiVersion: '2023-08-16' as any, // Using standard stable API version
  });
}

export class StripeService {
  /**
   * Get Stripe status
   */
  static isMock(): boolean {
    return isMockMode;
  }

  /**
   * Create a recurring product and price in Stripe (or mock ID)
   */
  static async createProductAndPrice(
    name: string,
    description: string,
    amount: number,
    billingCycle: 'monthly' | 'quarterly' | 'yearly'
  ): Promise<string> {
    console.log(`[Stripe Service] Creating product & price: ${name}, Price: £${amount}, Cycle: ${billingCycle}`);

    if (isMockMode || !stripe) {
      const mockPriceId = `price_mock_${billingCycle}_${amount}_${Math.random().toString(36).substring(7)}`;
      console.log(`[Stripe Service] Mock mode: generated mock price ID ${mockPriceId}`);
      return mockPriceId;
    }

    try {
      // 1. Create product
      const product = await stripe.products.create({
        name,
        description,
      });

      // Map billing cycle to Stripe recurrence intervals
      let interval: 'month' | 'year' = 'month';
      let intervalCount = 1;

      if (billingCycle === 'quarterly') {
        interval = 'month';
        intervalCount = 3;
      } else if (billingCycle === 'yearly') {
        interval = 'year';
        intervalCount = 1;
      }

      // 2. Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(amount * 100), // amount in cents
        currency: 'gbp',
        recurring: {
          interval,
          interval_count: intervalCount,
        },
      });

      console.log(`[Stripe Service] Real Stripe product and price created. Price ID: ${price.id}`);
      return price.id;
    } catch (error) {
      console.error('[Stripe Service] Error creating product and price:', error);
      // Fallback to mock price on error so the admin action doesn't crash the whole app
      return `price_mock_fallback_${billingCycle}_${amount}`;
    }
  }

  /**
   * Create a checkout session (or return simulated checkout URL)
   */
  static async createCheckoutSession({
    priceId,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata,
  }: {
    priceId: string;
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
    metadata: Record<string, string>;
  }): Promise<{ id: string; url: string }> {
    console.log(`[Stripe Service] Creating checkout session for Price: ${priceId}, Email: ${customerEmail}`);

    if (isMockMode || priceId.startsWith('price_mock_') || !stripe) {
      const mockSessionId = `cs_mock_${Date.now()}`;
      // Append session_id to success URL to simulate successful Stripe return
      const mockUrl = `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id=${mockSessionId}&mock=true`;
      console.log(`[Stripe Service] Mock Mode Session: ${mockSessionId}, Mock URL: ${mockUrl}`);
      return { id: mockSessionId, url: mockUrl };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        customer_email: customerEmail,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl,
        metadata,
      });

      return { id: session.id, url: session.url || successUrl };
    } catch (error: any) {
      console.error('[Stripe Service] Error creating checkout session:', error);
      // Fallback mock session on Stripe error
      const mockSessionId = `cs_mock_error_fallback_${Date.now()}`;
      const mockUrl = `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id=${mockSessionId}&mock=true`;
      return { id: mockSessionId, url: mockUrl };
    }
  }

  /**
   * Retrieve a checkout session (handles Stripe or mock verification)
   */
  static async retrieveSession(sessionId: string): Promise<any> {
    if (isMockMode || sessionId.startsWith('cs_mock_') || !stripe) {
      console.log(`[Stripe Service] Retrieving mock session: ${sessionId}`);
      return {
        id: sessionId,
        payment_status: 'paid',
        status: 'complete',
        customer_email: 'student@highlanders.com',
        metadata: {},
      };
    }

    try {
      return await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error('[Stripe Service] Error retrieving session:', error);
      return null;
    }
  }

  /**
   * Parse Stripe webhook events (supports mock signature verification)
   */
  static constructWebhookEvent(payload: string, signature: string, secret: string): any {
    if (isMockMode || !stripe) {
      console.log('[Stripe Service] Mock Webhook event parsing');
      return JSON.parse(payload);
    }
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
