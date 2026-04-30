import Link from "next/link";
import { Brain, Upload, MessageSquare, Zap, Shield, BarChart3, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/features/Navbar";
import { auth } from "@/lib/auth";

const features = [
  { icon: Upload, title: "Upload any PDF", desc: "Drag & drop your documents — contracts, invoices, reports, research papers." },
  { icon: MessageSquare, title: "Chat naturally", desc: "Ask questions in plain English. Get answers with page citations from your document." },
  { icon: Zap, title: "AI Extraction", desc: "Extract structured data like invoice amounts, contract clauses, or key entities instantly." },
  { icon: Shield, title: "Private & Secure", desc: "Your documents are encrypted at rest and never used for model training." },
  { icon: BarChart3, title: "Report generation", desc: "Generate AI-written reports and summaries from your documents in seconds." },
  { icon: Brain, title: "Powered by Claude", desc: "Built on Anthropic's Claude — the most accurate AI for document understanding." },
];

const plans = [
  { name: "Free", price: "₹0", period: "/month", features: ["3 documents", "10 pages per doc", "Unlimited chats", "Basic extraction"], cta: "Get started", href: "/register", highlight: false },
  { name: "Pro", price: "₹799", period: "/month", features: ["100 documents", "500 pages per doc", "Unlimited chats", "Advanced extraction", "Report generation", "Priority support"], cta: "Start Pro", href: "/register", highlight: true },
];

export default async function LandingPage() {
  const session = await auth();
  return (
    <div className="min-h-screen">
      <Navbar user={session?.user} />

      {/* Hero */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            Powered by Anthropic Claude
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 leading-tight mb-6">
            Chat with your<br />
            <span className="text-violet-600">documents</span> using AI
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto mb-10">
            Upload a PDF, ask questions in natural language, extract structured data, and generate reports — all powered by Claude AI.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href={session ? "/dashboard" : "/register"}>
              <Button size="lg" className="gap-2">
                {session ? "Go to Dashboard" : "Get started free"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            {!session && (
              <Link href="/login">
                <Button variant="outline" size="lg">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
            Everything you need to work with documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-neutral-200 hover:border-violet-300 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Simple pricing</h2>
          <p className="text-neutral-500 mb-12">Start free, upgrade when you need more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-8 text-left ${plan.highlight ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500" : "border-neutral-200 bg-white"}`}>
                <h3 className="font-bold text-xl text-neutral-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-6">
                  <span className="text-4xl font-bold text-neutral-900">{plan.price}</span>
                  <span className="text-neutral-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="block">
                  <Button variant={plan.highlight ? "default" : "outline"} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-400">
        © {new Date().getFullYear()} DocuMind · Built with Claude AI
      </footer>
    </div>
  );
}
