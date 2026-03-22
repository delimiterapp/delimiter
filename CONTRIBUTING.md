# Contributing to Delimiter

Delimiter is a monorepo containing the SDK and web dashboard. Here's how to get set up.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+
- [PostgreSQL](https://www.postgresql.org/) (or a [Neon](https://neon.tech/) free tier database)

## Setup

```bash
# Clone the repo
git clone https://github.com/delimiterapp/delimiter.git
cd delimiter

# Install dependencies
pnpm install

# Set up the web app environment
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env` with your database URL and other config:

```env
DATABASE_URL="postgresql://user:password@host:5432/delimiter"
WEBAUTHN_RP_NAME="Delimiter"
WEBAUTHN_RP_ID="localhost"
WEBAUTHN_ORIGIN="http://localhost:3000"
```

```bash
# Push the database schema
pnpm --filter web db:push

# Start everything in dev mode
pnpm dev
```

This starts:
- SDK in watch mode (rebuilds on change)
- Web app at `http://localhost:3000`

## Monorepo Structure

```
delimiter/
├── packages/
│   └── sdk/                  # @delimiter/sdk — npm package
│       ├── src/
│       │   ├── index.ts      # Public API: init()
│       │   ├── types.ts      # TypeScript interfaces
│       │   ├── instrument.ts # HTTP layer patching (fetch, http, https)
│       │   ├── providers.ts  # Domain-to-provider mapping and header definitions
│       │   ├── headers.ts    # Rate limit header parsing per provider
│       │   └── reporter.ts   # Async reporting to backend
│       ├── tsup.config.ts    # Build config (CJS + ESM output)
│       ├── tsconfig.json
│       └── package.json
├── apps/
│   └── web/                  # Next.js dashboard + API
│       ├── src/
│       │   ├── app/          # App Router — pages and API routes
│       │   │   ├── page.tsx              # Landing page
│       │   │   ├── dashboard/page.tsx    # Main dashboard (the product)
│       │   │   ├── settings/page.tsx     # Alert settings
│       │   │   └── api/
│       │   │       ├── report/route.ts       # SDK report ingestion
│       │   │       ├── dashboard/route.ts    # Dashboard data
│       │   │       ├── history/[range]/route.ts
│       │   │       ├── alerts/route.ts
│       │   │       ├── alerts/log/route.ts
│       │   │       └── auth/                 # Passkey auth endpoints
│       │   ├── components/   # React components
│       │   └── lib/          # Shared utilities (db, auth, alerts)
│       ├── prisma/
│       │   └── schema.prisma # Database schema
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
├── turbo.json                # Turborepo pipeline config
├── pnpm-workspace.yaml       # Workspace definitions
└── package.json              # Root scripts
```

## Key Commands

```bash
# Start all packages in dev mode
pnpm dev

# Build everything
pnpm build

# Build SDK only
pnpm --filter @delimiter/sdk build

# Build web only
pnpm --filter web build

# Push Prisma schema changes to database
pnpm --filter web db:push

# Generate Prisma client
pnpm --filter web db:generate

# Open Prisma Studio (database browser)
pnpm --filter web db:studio

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## Development Workflow

### Working on the SDK

The SDK is in `packages/sdk/`. In dev mode, tsup watches for changes and rebuilds. The web app picks up changes automatically since it references the SDK workspace package.

Key files:
- `src/instrument.ts` — HTTP layer patching (fetch, http.request, https.request)
- `src/providers.ts` — Domain-to-provider mapping (add new providers here)
- `src/headers.ts` — Rate limit header parsing per provider
- `src/reporter.ts` — Reporting logic (batching, fire-and-forget)
- `src/types.ts` — All shared TypeScript types

### Working on the Web App

The web app is in `apps/web/`. It's a standard Next.js App Router project.

Key files:
- `src/app/api/report/route.ts` — The endpoint the SDK POSTs to. Most critical API route.
- `src/app/dashboard/page.tsx` — The main dashboard page
- `src/components/` — All UI components
- `src/lib/db.ts` — Prisma client instance
- `src/lib/auth.ts` — Passkey authentication logic
- `prisma/schema.prisma` — Database schema

### Adding a New Provider

1. Add the provider's domain to `packages/sdk/src/providers.ts`
2. Add header parsing for the provider in `packages/sdk/src/headers.ts`
3. Add the provider's icon/logo to the web app
4. Update the provider list in the dashboard

No wrapper code needed — the SDK detects providers by domain at the HTTP layer.

## Database

We use Prisma with PostgreSQL (Neon in production, local Postgres or Neon for development).

To modify the schema:

```bash
# Edit prisma/schema.prisma
# Then push changes:
pnpm --filter web db:push

# Or create a migration:
pnpm --filter web db:migrate
```

## Pull Requests

- Fork the repo and create a feature branch
- Keep changes focused — one feature or fix per PR
- Make sure `pnpm build` and `pnpm typecheck` pass
- Write a clear PR description

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
