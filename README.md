# DocuMind — AI Document Intelligence

Upload PDFs, chat with them using Claude AI, extract structured data, and generate reports.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS (custom components) |
| Database | PostgreSQL + Prisma v5 |
| Auth | NextAuth v5 (email/password + Google OAuth) |
| AI | Anthropic Claude opus-4-7 (chat + extraction) |
| Embeddings | OpenAI text-embedding-3-small |
| Vector DB | Pinecone v7 (RAG retrieval) |
| File Storage | AWS S3 |
| Payments | Stripe v14 subscriptions |
| Deployment | Vercel |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/arpitkasaudhan/documind
cd documind
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

Services needed:
- **Neon** (free PostgreSQL) → [neon.tech](https://neon.tech)
- **Anthropic** → [console.anthropic.com](https://console.anthropic.com)
- **OpenAI** (embeddings only) → [platform.openai.com](https://platform.openai.com)
- **Pinecone** (free, create index `documind`, 1536 dimensions) → [pinecone.io](https://pinecone.io)
- **AWS S3** bucket `documind-files` → [aws.amazon.com](https://aws.amazon.com)
- **Stripe** test mode keys → [stripe.com](https://stripe.com)

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Push this repo to GitHub
2. Connect on [vercel.com](https://vercel.com) → Import project
3. Add all env vars in Vercel dashboard
4. `vercel.json` runs `prisma generate` before every build

## Project Structure

```
src/
├── app/
│   ├── api/               Route handlers
│   │   ├── auth/          NextAuth
│   │   ├── chat/          RAG streaming chat (Anthropic SDK direct)
│   │   ├── documents/     Document CRUD
│   │   ├── extract/       AI structured extraction
│   │   ├── sessions/      Chat session management
│   │   ├── upload/        PDF upload + S3 + async Pinecone indexing
│   │   ├── billing/       Stripe checkout
│   │   └── webhooks/      Stripe webhook handler
│   ├── dashboard/         Main dashboard page
│   ├── documents/[id]/    Document detail + multi-session chat
│   │   └── extract/       AI extraction UI with presets
│   ├── login/ register/ pricing/
├── components/
│   ├── features/          ChatWindow, FileUpload, DocumentCard, Navbar,
│   │                      SessionSidebar, DocumentChatView
│   └── ui/                Button, Input, Card, Badge, Skeleton
├── hooks/
│   ├── useStreamChat.ts   Custom streaming chat hook (no ai SDK)
│   └── useDocumentStatus  Auto-polling hook for PROCESSING documents
└── lib/
    ├── ai/                PDF parse, chunking, RAG, embeddings, extraction
    ├── auth.ts            NextAuth v5 config
    ├── db/                Prisma v5 singleton
    ├── storage/           AWS S3 helpers
    ├── stripe.ts          Stripe v14 helpers
    └── vector/            Pinecone v7 helpers
```

## Plans

| Feature | Free | Pro |
|---|---|---|
| Documents | 3 | 100 |
| Pages/doc | 10 | 500 |
| Chat | Unlimited | Unlimited |
| Extraction | Basic | Advanced |
| Price | ₹0 | ₹799/mo |
