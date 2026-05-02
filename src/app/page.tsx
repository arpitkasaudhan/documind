import Link from "next/link";
import {
  Brain, Upload, MessageSquare, Zap, Shield,
  BarChart3, ArrowRight, Check, FileBarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/features/Navbar";
import { auth } from "@/lib/auth";

const features = [
  { icon: Upload,        title: "Upload any PDF",       desc: "Drag & drop contracts, invoices, reports, research — up to 10MB." },
  { icon: MessageSquare, title: "Chat naturally",        desc: "Ask questions in plain English. Get cited answers from your document." },
  { icon: Zap,           title: "Extract structured data", desc: "Pull invoices, contract clauses, or any custom data into clean JSON." },
  { icon: FileBarChart2, title: "Generate reports",      desc: "One click: executive summary, deep analysis, Q&A, or key points." },
  { icon: Shield,        title: "Private & secure",      desc: "Your files are encrypted at rest and never used for model training." },
  { icon: BarChart3,     title: "Powered by Claude",     desc: "Anthropic's Claude — the most accurate AI for document understanding." },
];

const steps = [
  { step: "01", title: "Upload your PDF", desc: "Drag and drop any PDF. DocuMind parses and indexes it in under a minute." },
  { step: "02", title: "Ask anything",    desc: "Chat naturally. Claude finds the relevant sections and answers with citations." },
  { step: "03", title: "Extract & report", desc: "Run AI extraction or generate a full report in one click. Copy or download." },
];

const plans = [
  {
    name: "Free", price: "₹0", period: "/month",
    features: ["3 documents", "10 pages/doc", "Unlimited chat", "Basic extraction"],
    cta: "Get started", href: "/register", highlight: false,
  },
  {
    name: "Pro", price: "₹799", period: "/month",
    features: ["100 documents", "500 pages/doc", "Unlimited chat", "Advanced extraction", "AI report generation", "Priority support"],
    cta: "Start Pro", href: "/register", highlight: true,
  },
];

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={session?.user} />

      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-violet-50/60 to-white pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-violet-200">
            <Brain className="w-4 h-4" />
            Powered by Anthropic Claude
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 leading-[1.1] mb-6 tracking-tight">
            Your documents,<br />
            <span className="text-violet-600">finally intelligent</span>
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload a PDF and instantly chat with it, extract structured data,
            or generate an AI-written report — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href={session ? "/dashboard" : "/register"}>
              <Button size="lg" className="gap-2 shadow-lg shadow-violet-200">
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
          <p className="text-sm text-neutral-400 mt-4">Free plan · No credit card required</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-3">How it works</h2>
          <p className="text-neutral-500 text-center mb-12">Three steps to turn any PDF into an intelligent assistant.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-md shadow-violet-200">
                  {s.step}
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                {/* Connector arrow */}
                {s.step !== "03" && (
                  <div className="hidden sm:block absolute top-7 left-[calc(100%-1rem)] text-neutral-300 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-3">Everything you need</h2>
          <p className="text-neutral-500 text-center mb-12">One tool for all your document work.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-neutral-200 hover:border-violet-300 hover:shadow-sm transition-all group">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
                  <f.icon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">Built for every professional</h2>
          <p className="text-neutral-500 mb-10">From legal to finance to logistics — if you work with documents, DocuMind works for you.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { emoji: "⚖️",  label: "Legal", desc: "Contract review" },
              { emoji: "📊",  label: "Finance", desc: "Invoice extraction" },
              { emoji: "🚚",  label: "Logistics", desc: "Document analysis" },
              { emoji: "🏥",  label: "Healthcare", desc: "Report summaries" },
            ].map((uc) => (
              <div key={uc.label} className="bg-white rounded-xl border border-neutral-200 p-5 text-center">
                <div className="text-3xl mb-2">{uc.emoji}</div>
                <p className="font-semibold text-neutral-900 text-sm">{uc.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">Simple pricing</h2>
          <p className="text-neutral-500 mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-8 text-left ${plan.highlight ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500" : "border-neutral-200 bg-white"}`}>
                {plan.highlight && (
                  <div className="inline-block bg-violet-600 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
                    Most popular
                  </div>
                )}
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
                  <Button variant={plan.highlight ? "default" : "outline"} className="w-full" size="lg">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 px-4 bg-violet-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to chat with your documents?</h2>
          <p className="text-violet-200 mb-8">Join and start for free. No credit card required.</p>
          <Link href={session ? "/dashboard" : "/register"}>
            <Button size="lg" variant="secondary" className="gap-2">
              {session ? "Go to Dashboard" : "Create free account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-neutral-600">DocuMind</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-neutral-600 transition-colors">Pricing</Link>
            <Link href="/login"   className="hover:text-neutral-600 transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-neutral-600 transition-colors">Sign up</Link>
          </div>
          <p>© {new Date().getFullYear()} DocuMind · Built with Claude AI</p>
        </div>
      </footer>
    </div>
  );
}
