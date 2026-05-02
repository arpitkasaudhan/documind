import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://documind.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "DocuMind — AI Document Intelligence",
    template: "%s — DocuMind",
  },
  description:
    "Upload PDFs, chat with them in natural language, extract structured data, and generate AI reports — powered by Claude.",
  keywords: ["AI document", "PDF chat", "RAG", "Claude AI", "document intelligence"],
  authors: [{ name: "DocuMind" }],
  openGraph: {
    title: "DocuMind — AI Document Intelligence",
    description: "Chat with your PDFs using Claude AI. Extract data, generate reports.",
    url: APP_URL,
    siteName: "DocuMind",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocuMind — AI Document Intelligence",
    description: "Chat with your PDFs using Claude AI.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-50 text-neutral-900 antialiased`}>
        <SessionProvider session={session}>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
