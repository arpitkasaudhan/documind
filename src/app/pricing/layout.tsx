import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — DocuMind",
  description: "Simple, transparent pricing. Start free, upgrade when you need more power.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
