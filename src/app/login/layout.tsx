import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — DocuMind",
  description: "Sign in to your DocuMind account to chat with your documents.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
