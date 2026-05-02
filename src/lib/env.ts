/**
 * Validates required environment variables at startup.
 * Call this in server-only code (API routes, server components).
 * The app will throw clearly if a required key is missing rather
 * than failing silently with a cryptic error later.
 */

const REQUIRED_SERVER_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "PINECONE_API_KEY",
  "PINECONE_INDEX",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

const REQUIRED_PUBLIC_VARS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
] as const;

type ServerVar = (typeof REQUIRED_SERVER_VARS)[number];
type PublicVar = (typeof REQUIRED_PUBLIC_VARS)[number];

function assertEnv(key: string): string {
  const val = process.env[key];
  if (!val || val.includes("your-") || val.includes("your_")) {
    throw new Error(
      `Missing or placeholder environment variable: ${key}\n` +
      `Set it in .env.local (local) or Vercel dashboard (production).`
    );
  }
  return val;
}

// Lazy-validated env object — throws only when the value is first accessed
export const serverEnv = new Proxy({} as Record<ServerVar, string>, {
  get(_, key: string) {
    return assertEnv(key);
  },
});

export const publicEnv = new Proxy({} as Record<PublicVar, string>, {
  get(_, key: string) {
    return process.env[key] ?? "";
  },
});

/** Call once at app startup in instrumentation.ts to surface missing vars early */
export function validateEnv() {
  const missing: string[] = [];
  for (const key of REQUIRED_SERVER_VARS) {
    const val = process.env[key];
    if (!val) missing.push(key);
  }
  if (missing.length > 0) {
    console.error(
      `\n❌ DocuMind: Missing required environment variables:\n` +
      missing.map((k) => `   - ${k}`).join("\n") +
      `\n\nCopy .env.example → .env.local and fill in the values.\n`
    );
  }
}
