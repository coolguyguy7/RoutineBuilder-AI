# Routine Builder AI

A dark-mode AI chat app that helps students build better summer routines while having fun, powered by an OpenAI vector store of routine documents.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port varies by workflow)
- `pnpm --filter @workspace/routine-builder run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `OPENAI_API_KEY` — OpenAI API key (set in Secrets)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui, wouter routing
- API: Express 5
- AI: OpenAI Responses API (`client.responses.create()`), vector store `vs_6a3bf99c76648191a316dfd7894e4728`
- File uploads: multer (server) → OpenAI Files API (`purpose: "assistants"`)
- Build: esbuild (CJS bundle for server)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas (used by server)
- `artifacts/api-server/src/routes/chat.ts` — chat SSE + file upload routes
- `artifacts/api-server/src/routes/achievements.ts` — achievement definitions
- `artifacts/routine-builder/src/` — React frontend

## Architecture decisions

- Uses OpenAI **Responses API** (not deprecated Assistants API). `client.responses.create()` is top-level.
- `previous_response_id` chaining keeps conversation context — no database needed.
- The vector store ID is hardcoded in `chat.ts` (from `config.json`) — do not rebuild or re-upload the corpus.
- Achievements are tracked client-side in localStorage; backend only serves definitions.
- SSE streaming is simulated by word-chunking the full response for reliability.

## Product

- Hero section with app name and welcome message
- 4 clickable suggested starter prompts
- Streaming AI responses with expandable citation pills
- File upload (PDF, txt, docx) attached per message
- Achievement badge panel (6 achievements) with localStorage progress tracking
- Dark mode throughout

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Never use `client.beta.assistants` / `client.beta.threads` / `client.beta.runs` — those are deprecated.
- `client.vector_stores` and `client.responses` are TOP-LEVEL in OpenAI SDK v2.
- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before using updated types.
- The `File` constructor in Node.js requires `Uint8Array`, not raw `Buffer` — always wrap: `new Uint8Array(buf)`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
