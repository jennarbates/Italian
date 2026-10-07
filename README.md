# Chi è?

A Guess Who style game for people learning Italian at A1. You play against the computer, and every question you ask or answer is in Italian and gets checked, so a wrong article or verb gets caught and explained. Built for phones first.

Building started on October 7, 2026, and it's live at [chie.parlaplay.games](https://chie.parlaplay.games). I'm aiming to launch on October 29.

**Status, October 7:** both levels play end to end, with progress tracking, sign-in and sync, on staging and production. What's left waits on people or accounts: the Italian and developer reviews, sending email through SES, Sentry, a real-phone check, playtests, and the launch-week cards.

## Planning

I'm running this like a team project even though it's just me, partly to keep the scope under control and partly because I wanted to practice the process properly. All of it is public:

- [spec.md](spec.md): the full spec. Rules, content model, engine, data, tests and the definition of done. It went through five drafts before any code (changelog at the bottom).
- [Decision log](spec.md#112-decision-log): every real decision and why I made it.
- [backlog.md](backlog.md): 85 cards, each with acceptance criteria, points, dependencies and the spec section it comes from.
- [Issues](https://github.com/jennarbates/Italian/issues), [milestones](https://github.com/jennarbates/Italian/milestones) and the [project board](https://github.com/jennarbates/Italian/projects): the same backlog in GitHub. Each sprint is a milestone, and each card is a sub-issue of its epic.
- [docs/process.md](docs/process.md): how I work. Definition of ready and done, estimating, branches.
- [docs/sprints](docs/sprints/): a review and retro at the end of every sprint.

| Sprint | Dates | Points | Goal |
|---|---|---|---|
| 0 | Oct 6 | – | Spec, backlog and GitHub setup ([notes](docs/sprints/sprint-0-planning.md)) |
| 1 | Oct 7–9 | 43 | Spec reviewed, repo and CI running, all 24 characters drawn from the content files |
| 2 | Oct 12–16 | 71 | A full round playable on a phone at both levels |
| 3 | Oct 19–23 | 53 | Progress tracking, sign-in and sync; accessibility pass; first playtests |
| 4 | Oct 26–29 | 12 | Fix what the playtests find, then launch |

Sprint 2 is the heavy one. Once I know my real velocity from Sprint 1, I'll replan it.

| Sprint | Planned | Done so far | Carried over |
|---|---|---|---|
| 1 | 43 | 30 | |
| 2 | 71 | 71 | |
| 3 | 53 | 41 | |
| 4 | 12 | 2 | |

"Done so far" counts the points of closed cards, as of October 7. Sprint 2 and most of Sprint 3 were built early, during Sprint 1; what's left in Sprints 1 and 3 waits on reviewers, AWS, Sentry and playtesters.

If something isn't in the spec's scope table, it's not in the MVP. New ideas go in [future work](spec.md#111-future-work).

## Stack

React, TypeScript, Vite, Tailwind, Zustand, Zod, Supabase, `ts-fsrs` for spaced repetition, and Sentry. Tests use Vitest, fast-check and Playwright. It's hosted on Cloudflare. My reasons for each choice are in [section 9 of the spec](spec.md#9-non-functional).

## Running it

You need Node 24 and pnpm (the version is pinned in `package.json`; `corepack enable` sets it up).

```bash
pnpm install
pnpm dev           # http://localhost:5173
```

That's enough to play as a guest: everything runs in the browser and saves to IndexedDB. Sign-in and sync need a Supabase. For a local one (needs Docker):

```bash
supabase start                      # applies supabase/migrations/
eval "$(supabase status -o env)"
VITE_SUPABASE_URL=$API_URL VITE_SUPABASE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY pnpm dev
```

Sign-in codes land in the local inbox at <http://127.0.0.1:54324>.

How the code is laid out:

| Folder | What's in it |
|---|---|
| `src/engine/` | The game, as pure TypeScript: `step(state, action, content)` (spec 4), the CPU (spec 5). No React, DOM or time. |
| `src/content/` | Every word, character and message as JSON, with Zod schemas checked when the app builds (spec 3) |
| `src/services/` | IndexedDB storage, spaced repetition (FSRS replay), Supabase and sync |
| `src/store/` | Zustand stores: the round, progress, sign-in, the default level |
| `src/ui/` | React screens |
| `public/art/` | The SVG layers each face is built from (spec 3.5) |
| `scripts/` | The character and art generators, the content and bundle checks, the CPU simulation |
| `supabase/` | Migrations (tables and Row Level Security) and the sign-in email template |

## Testing

```bash
pnpm test          # Vitest: engine, content, stores, services, plus migrations and RLS in PGlite
pnpm test:watch    # Vitest in watch mode
pnpm test:e2e      # Playwright against the production build, in Chromium (Pixel 7) and WebKit (iPhone 15)
pnpm typecheck && pnpm lint && pnpm format:check
pnpm build && pnpm check:bundle   # initial JS must stay under 250 KB gzipped
```

The first time, install the Playwright browsers with `pnpm exec playwright install chromium webkit`. `src/engine/` must keep 90% line coverage or `pnpm test` fails.

Tests that need a real Supabase (sign-in, sync, and `scripts/sync.integration.test.ts`) are skipped without one. CI starts a local Supabase and runs them all; [e2e/README.md](e2e/README.md) shows how to run them locally and what each end-to-end test covers.

`node scripts/simulate.ts` plays 1,000 games against the CPU and prints how many questions it needs.

## Adding a character

Characters are data. Nothing in the code names them.

1. Add an entry to [src/content/characters.json](src/content/characters.json): a permanent `id` (`c.` plus the lowercase name; ids are never reused, spec 3.6), an Italian `name`, the eight `attrs`, and a `skin` (`s1` to `s5`).
2. Keep the deck fair. `pnpm test` checks the spec 3.2 rules: no two characters with the same eight attributes, as many men as women, no beard or mustache on women, and every question answered "yes" by 3 to 15 characters. With a new character added, the 12/12 and 24 counts in `src/content/invariants.ts` need updating too.
3. Bump `contentVersion` in [src/content/version.json](src/content/version.json), so saved rounds from the old deck are discarded instead of resumed.
4. Run `pnpm dev` and check the face: the art is picked from the attributes, so there's nothing to draw. Long-press the card to check it large.

To make a whole new deck, `node scripts/generate-characters.ts --seed <n>` draws 24 that pass every rule; review it, name them, and replace the file.

To change the art, replace files in `public/art/` with new SVGs of the same names on the same 100 × 120 canvas. `node scripts/generate-placeholder-art.ts` rewrites the placeholders, and the tests check the files match it, so update or remove that test when the final art lands.

## Deploying

The app is the Vite build served as Cloudflare Workers static assets ([wrangler.jsonc](wrangler.jsonc)). Cloudflare's GitHub integration (Workers Builds) deploys it:

- Every pull request is uploaded as a preview with its own URL, `<branch>-italian.jennaraquelbates.workers.dev`, built against the **staging** Supabase project. Cloudflare comments the URL on the PR.
- Merging to `main` deploys to [chie.parlaplay.games](https://chie.parlaplay.games), built against **production**.

On Workers Builds, [vite.config.ts](vite.config.ts) picks the keys from the branch name (using [scripts/cloudflare-env.ts](scripts/cloudflare-env.ts)), whichever build command runs, since previews run plain `pnpm run build`. It tags Sentry with the commit and environment, and fails the build if a variable is missing, if a preview would point at production, or if a key is a secret or service role key.

One-time setup in the Cloudflare dashboard (Workers & Pages → Create → Import a repository → this repo):

| Setting | Value |
|---|---|
| Build command | `pnpm build:cloudflare` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch builds | On, with the default preview command |
| Build variables | `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_PUBLISHABLE_KEY`, `PRODUCTION_SUPABASE_URL`, `PRODUCTION_SUPABASE_PUBLISHABLE_KEY`, `SENTRY_DSN` |

Only the publishable (anon) keys go in there. The `parlaplay.games` zone has to be on the same Cloudflare account for the custom domain. Without `SENTRY_DSN` the app builds with error reporting off. In the Sentry project, turn on Settings → Security & Privacy → "Prevent Storing of IP Addresses".
