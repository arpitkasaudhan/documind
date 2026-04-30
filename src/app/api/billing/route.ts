import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/prisma";
import { createCheckoutSession, createPortalSession } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json();

  if (action === "checkout") {
    const url = await createCheckoutSession(session.user.id, session.user.email);
    return NextResponse.json({ url });
  }

  if (action === "portal") {
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });
    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 });
    }
    const url = await createPortalSession(subscription.stripeCustomerId);
    return NextResponse.json({ url });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
