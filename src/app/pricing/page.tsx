import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/features/Navbar";
import { auth } from "@/lib/auth";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect to get started",
    features: ["3 documents", "10 pages per document", "Unlimited chat messages", "Basic AI extraction", "Email support"],
    cta: "Get started free",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹799",
    period: "/month",
    description: "For power users and teams",
    features: ["100 documents", "500 pages per document", "Unlimited chat messages", "Advanced AI extraction", "Report generation", "Priority support", "API access (coming soon)"],
    cta: "Start Pro plan",
    href: "/api/billing",
    highlight: true,
    action: "checkout",
  },
];

export default async function PricingPage() {
  const session = await auth();
  return (
    <div className="min-h-screen">
      <Navbar user={session?.user} />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-4xl font-bold text-neutral-900">Simple, transparent pricing</h1>
          <p className="text-neutral-500 mt-3">Start for free. Upgrade when you need more power.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border p-8 ${plan.highlight ? "border-violet-500 ring-2 ring-violet-500 bg-violet-50" : "border-neutral-200 bg-white"}`}>
              <h2 className="text-xl font-bold text-neutral-900">{plan.name}</h2>
              <p className="text-sm text-neutral-500 mt-1">{plan.description}</p>
              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="text-4xl font-bold text-neutral-900">{plan.price}</span>
                <span className="text-neutral-500">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-700">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.action === "checkout" && session ? (
                <CheckoutButton />
              ) : (
                <Link href={plan.href} className="block">
                  <Button variant={plan.highlight ? "default" : "outline"} className="w-full" size="lg">
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function CheckoutButton() {
  return (
    <form action="/api/billing" method="POST">
      <input type="hidden" name="action" value="checkout" />
      <Button type="submit" className="w-full" size="lg">
        Start Pro plan
      </Button>
    </form>
  );
}
