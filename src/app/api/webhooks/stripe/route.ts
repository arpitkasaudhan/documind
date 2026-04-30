import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db/prisma";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await db.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            (subscription as unknown as { current_period_end: number }).current_period_end * 1000
          ),
          plan: "PRO",
        },
        update: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            (subscription as unknown as { current_period_end: number }).current_period_end * 1000
          ),
          plan: "PRO",
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as unknown as { subscription: string }).subscription;
      if (!subscriptionId) break;

      await db.subscription.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: { plan: "FREE" },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { plan: "FREE", stripeSubscriptionId: null },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
