# Chi è?

A Guess Who style game for people learning Italian at A1. You play against the computer, and every question you ask or answer is in Italian and gets checked, so a wrong article or verb gets caught and explained. Built for phones first.

Planning is done and I start building on October 7, 2026. I'm aiming to launch on October 29.

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

| Sprint | Planned | Done | Carried over |
|---|---|---|---|
| 1 | 43 | | |
| 2 | 71 | | |
| 3 | 53 | | |
| 4 | 12 | | |

If something isn't in the spec's scope table, it's not in the MVP. New ideas go in [future work](spec.md#111-future-work).

## Stack

React, TypeScript, Vite, Tailwind, Zustand, Zod, Supabase, `ts-fsrs` for spaced repetition, and Sentry. Tests use Vitest, fast-check and Playwright. It's hosted on Cloudflare. My reasons for each choice are in [section 9 of the spec](spec.md#9-non-functional).

I'll add setup instructions once the repo is scaffolded in Sprint 1.

## Testing

```bash
pnpm test          # Vitest, with a coverage report for src/engine/
pnpm test:watch    # Vitest in watch mode
pnpm test:e2e      # Playwright against the production build, in Chromium (Pixel 7) and WebKit (iPhone 15)
```

The first time, install the Playwright browsers with `pnpm exec playwright install chromium webkit`.
