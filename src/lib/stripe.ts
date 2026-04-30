import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    documentsLimit: 3,
    pagesLimit: 10,
    price: 0,
  },
  PRO: {
    name: "Pro",
    documentsLimit: 100,
    pagesLimit: 500,
    price: 999,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
};

export async function createCheckoutSession(
  userId: string,
  userEmail: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: userEmail,
    line_items: [{ price: PLANS.PRO.priceId, quantity: 1 }],
    metadata: { userId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });
  return session.url!;
}

export async function createPortalSession(
  stripeCustomerId: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return session.url;
}
