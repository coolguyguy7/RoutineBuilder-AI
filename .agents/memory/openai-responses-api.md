---
name: OpenAI Responses API patterns
description: Durable lessons for using OpenAI Responses API in Node.js/TypeScript with vector stores and file uploads.
---

## Rule
Use `client.responses.create()` (top-level) for the Responses API. Never use `client.beta.assistants`, `client.beta.threads`, or `client.beta.runs` — those are deprecated.

**Why:** OpenAI SDK v2 moved the Responses API to top-level. Using the beta namespace will cause runtime errors.

**How to apply:** Always import from `openai` directly. `client.vector_stores` and `client.responses` are both top-level.

## File upload to OpenAI in Node.js
The `File` constructor in Node.js requires `Uint8Array`, not a raw `Buffer`:
```typescript
new File([new Uint8Array(req.file.buffer)], req.file.originalname, { type: req.file.mimetype })
```
**Why:** TypeScript treats `Buffer.buffer` as `ArrayBufferLike` (not strictly `ArrayBuffer`), causing TS2322 when passed directly to `File`.

## OpenAPI binary fields cause Node.js typecheck errors
Do not use `format: binary` in OpenAPI schemas — Orval generates `File`/`Blob` types that don't exist in the server-side typecheck environment.
**Fix:** Remove binary fields from the spec; handle multipart uploads via multer without a spec-generated schema.

## SSE streaming with Responses API
Simplest reliable pattern: call `responses.create()` non-streaming, split `output_text` into words, send each as a `data:` SSE event, then close with `{ done: true, responseId, citations }`.
Citations: `response.output[i].content[j].annotations` where `ann.type === "file_citation"` and `ann.filename` gives the source.
