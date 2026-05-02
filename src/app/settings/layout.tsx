import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — DocuMind",
  description: "Manage your account, subscription, and preferences.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
