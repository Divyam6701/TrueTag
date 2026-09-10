# TrueTag


AI-powered product scanning and verification platform. Upload or capture a
photo of a physical product, get an AI-style analysis of what's correct,
what's wrong, and what needs attention, then download an official PDF
verification notice.

Full-stack: Next.js frontend + Postgres/Prisma backend + JWT auth +
server-side PDF generation. A mock AI analysis service stands in for a
real vision model so the whole product is demoable end to end (see
"Swapping in a real AI model" below).

## Get a live URL — no terminal required

This gets you a real `https://your-app.vercel.app` link using only web
dashboards (Neon, GitHub, Vercel). Takes about 5 minutes.

1. **Database** — go to [neon.tech](https://neon.tech), sign up, create a
   project. Copy the connection string it shows you (starts with
   `postgresql://`).
2. **Code host** — go to [github.com/new](https://github.com/new), create
   a new repository. On the repo page, use **"uploading an existing
   file"** and drag in everything from this unzipped folder (or use
   GitHub Desktop if you prefer a GUI over drag-and-drop for a folder
   this size).
3. **Deploy** — go to [vercel.com/new](https://vercel.com/new), sign in
   with GitHub, and import the repository you just created. Before
   clicking Deploy, open **Environment Variables** and add:
   - `DATABASE_URL` — the Neon connection string from step 1
   - `AUTH_SECRET` — any long random string (mash the keyboard, or use
     an online password generator)
4. Click **Deploy**. Vercel will run `npm install`, apply the database
   schema automatically (via `vercel.json`'s build command), and give you
   a live URL when it finishes.
5. Open that URL and click **Sign up** (or **Continue as Guest**) right
   on the live site — no seeding step needed for a fresh deployment.

That's it — genuinely nothing to install locally, no `npm`, no `npx`,
no command line.

## Running it locally instead

If you *do* want to run it on your own machine (e.g. to make code
changes), you'll need Node.js and a terminal for this part — there's no
way around that for local development, only for getting it live:

```bash
npm install
cp .env.example .env
# edit .env: paste in your DATABASE_URL and set AUTH_SECRET

npx prisma migrate deploy
npm run db:seed        # optional: demo@scanverify.local / password123
npm run dev
```

Open http://localhost:3000. Any image you upload is analyzed by a
deterministic **mock AI service** (`lib/mockAI.ts`) — the same image
always produces the same result, and different images produce varied,
realistic-looking findings.

## What's implemented

- Cinematic welcome page with a scroll-driven animation explaining the
  scan → verify → report flow
- Real authentication: email/password (bcrypt-hashed, JWT session in an
  httpOnly cookie) plus a one-click guest mode that creates an ephemeral
  account
- Upload / drag-and-drop / camera capture with client- and server-side
  validation
- `POST /api/scan`: uploaded images are optimized and stored, analyzed,
  and persisted to Postgres via Prisma
- Animated AI processing screen with sequential pipeline stages
- Results dashboard: product image viewer, correct/warning/issue status
  cards, expandable verification checklist
- Official PDF notice generated server-side (pdf-lib) from structured
  data, streamed from an authenticated, ownership-checked route
- History (sort/filter) and a dashboard with real aggregated stats
- Basic in-memory rate limiting on auth and scan endpoints
- Fully responsive, with a bottom nav on mobile and a top nav on desktop

## Architecture

- **Auth**: `app/api/auth/*` routes issue a JWT stored in an httpOnly
  cookie (`lib/auth-server.ts`, `lib/cookies.ts`, `lib/session.ts`).
  Passwords are hashed with bcrypt — never compared or stored in the
  browser.
- **Scans**: `POST /api/scan` validates and optimizes the uploaded image
  (`lib/upload.ts`, using `sharp`), runs it through `lib/mockAI.ts`, and
  writes the result across `Scan`, `ScanResult`, and `ChecklistItem` in
  one Prisma call. `GET /api/scans` and `GET /api/scan/:id` read it back;
  `DELETE /api/scan/:id` removes it (cascading to related rows).
- **PDF reports**: `GET /api/reports/:id/pdf` checks auth + ownership,
  then builds the notice server-side with `pdf-lib`
  (`lib/pdf-server.ts`) and streams it with the right headers — never a
  screenshot, always generated from the stored structured data.
- **Rate limiting**: `lib/rateLimit.ts` is a simple in-memory limiter.
  It's per-process, so it resets on restart and isn't shared across
  multiple server instances — fine for a single-instance deployment;
  swap in Redis/Vercel KV for multi-instance production traffic.
- **Frontend data layer**: `lib/store.ts` is a thin `fetch()` wrapper
  around the API routes, kept intentionally small so the rest of the app
  never talks to Prisma or cookies directly.

## Swapping in a real AI model

`lib/mockAI.ts` exports a single function, `analyzeProduct(buffer)`,
that returns a `ScanResult`. Replace its body with a call to a real
computer-vision/OCR pipeline or a vision-capable LLM (Gemini Vision,
GPT-4o vision, a custom model, etc.), keeping the same return shape.
Nothing in `app/api/scan/route.ts` or the UI needs to change.

## Image storage

Uploaded images are optimized (resized, re-encoded, capped ~85KB–250KB)
and stored as base64 directly in the `Scan.imageUrl` column in Postgres.
This is intentional: it means the app needs **only** a Postgres database
to run correctly on serverless hosts like Vercel — no separate storage
provider, no writable disk to lose between requests. The tradeoff is
database size, which is fine at demo/moderate scale. For high-volume
production use, swap the body of `storeImage()` in `lib/upload.ts` for
an upload to Cloudinary or an S3-compatible bucket (credentials already
scaffolded in `.env.example`) and return that provider's public URL
instead — nothing else in the app needs to change.

## API surface

```
POST   /api/auth/register   { name, email, password }
POST   /api/auth/login      { email, password }
POST   /api/auth/guest
POST   /api/auth/logout
GET    /api/auth/me

POST   /api/scan            multipart/form-data, field "image"
GET    /api/scan/:id
GET    /api/scans
DELETE /api/scan/:id

GET    /api/dashboard
GET    /api/reports/:id/pdf

POST   /api/upload          multipart/form-data, field "image"
```

All routes except `/api/auth/*` require a valid session cookie and
return 401 otherwise; scan/report routes additionally verify the
requesting user owns the resource before returning it.

## Deployment notes

- **App**: Vercel is pre-configured via `vercel.json` (see the walkthrough
  at the top) but any Node-compatible host works — just make sure your
  build step runs `npx prisma migrate deploy` before `next build`.
- **Database**: Neon, Supabase, or Railway managed Postgres all work.
- **File storage**: not required — see "Image storage" above.

## Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Framer Motion
· lucide-react · PostgreSQL · Prisma · bcryptjs + JWT auth · pdf-lib
(server-side PDF generation) · sharp (image optimization)

