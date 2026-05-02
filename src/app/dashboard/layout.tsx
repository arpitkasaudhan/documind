import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — DocuMind",
  description: "Manage your documents and start AI-powered conversations.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
