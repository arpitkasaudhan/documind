import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account — DocuMind",
  description: "Sign up free and start chatting with your PDFs using Claude AI.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
