# Chi è? MVP backlog

Built from `spec.md` v0.4. Every deliverable in the spec is a card with acceptance criteria, story points (1, 2, 3, 5), dependencies and spec section references. The four one-week sprints follow the milestones in 10.4.

**85 cards, 179 points.** Cards marked *waits on others* depend on someone outside the build (reviewers, SES approval, playtesters), so start them early.

## Sprints

| Sprint | Dates | Points | Goal |
|---|---|---|---|
| Sprint 1: Foundations | Oct 7 to Oct 9 | 43 | Spec reviewed and tagged v1, repo and CI live with previews, all 24 characters render from validated content. |
| Sprint 2: Playable round | Oct 12 to Oct 16 | 71 | Engine and CPU fully tested; a full round plays to a win and a loss on a real phone at both levels. |
| Sprint 3: Progress, sync, playtest | Oct 19 to Oct 23 | 53 | Learning data, sign-in and sync work end to end; accessibility pass done; 3+ learners have playtested. |
| Sprint 4: Fix and launch | Oct 26 to Oct 29 | 12 | Must-fix playtest findings closed, every definition-of-done box checked, live at chie.1412labs.com. |

## Epics

| Epic | Cards | Points |
|---|---|---|
| Spec sign-off | 5 | 8 |
| Repo, CI and infra | 10 | 18 |
| Content and art | 9 | 17 |
| Game engine | 11 | 28 |
| CPU opponent | 3 | 7 |
| Game UI | 14 | 36 |
| Learning and progress | 5 | 11 |
| Accounts and sync | 10 | 20 |
| Accessibility, states, privacy | 5 | 9 |
| Testing and playtest | 7 | 18 |
| Launch | 6 | 7 |

## Sprint 1: Foundations (Oct 7 to Oct 9)

Goal: Spec reviewed and tagged v1, repo and CI live with previews, all 24 characters render from validated content.

### Day 1, Wed Oct 7 (7 pts)

#### CHI-001 Send the Italian review packet *(waits on others)*

Spec sign-off · task · 2 pts · spec 3.3, 3.7, 10.1

Give the Italian-speaking reviewer everything in 10.1 step 2 in one document, with a return date of Fri Oct 9.

- [ ] Packet includes section 3, all 17 question strings, all 34 answers and every message in 3.7
- [ ] Reviewer asked to check all 18 lemmas against the Profilo and return a level per word
- [ ] Reviewer asked to pick the default brown-eyes word (castani or marroni)
- [ ] Return date of Fri Oct 9 agreed

#### CHI-002 Request developer review of engine and data sections *(waits on others)*

Spec sign-off · task · 1 pt · spec 4, 7, 10.1

Send sections 4 and 7 to a developer for review.

- [ ] Sections 4 and 7 sent with a return date of Fri Oct 9
- [ ] Comments collected in one place

#### CHI-003 Paper-trace one full game

Spec sign-off · spike · 2 pts · spec 10.1

Play one complete round on paper using only the spec, and log every point where you had to guess.

- [ ] One full round traced from START to over
- [ ] Every guess logged as a TBD or a spec fix

#### CHI-005 Book 3+ A1 playtesters for Thu Oct 22 *(waits on others)*

Spec sign-off · task · 1 pt · spec 10.2, 10.4

Line up at least three A1 learners now, since playtests depend on other people's calendars.

- [ ] At least 3 learners confirmed for Oct 22
- [ ] Each knows the session is about 3 rounds on their own phone

#### CHI-010 Add DNS for chie.1412labs.com

Repo, CI and infra · chore · 1 pt · spec 7.3, 10.4, D30

Create the subdomain now so SES domain verification can start on day 2.

- [ ] chie.1412labs.com resolves

### Day 2, Thu Oct 8 (17 pts)

#### CHI-011 Scaffold the app

Repo, CI and infra · chore · 3 pts · spec 8.1, 9

pnpm, Vite, React, TypeScript strict, React Router, Zustand, Tailwind, ESLint, Prettier, and the folder structure from section 9.

- [ ] Folders engine, content, services, store, ui, scripts, supabase, e2e exist
- [ ] Routes /, /play, /progress, /settings, /privacy render placeholders
- [ ] TypeScript strict on; lint and format scripts run clean

#### CHI-012 Set up test tooling

Repo, CI and infra · chore · 2 pts · spec 9, 10.2 · depends on CHI-011

Vitest with coverage, fast-check, and Playwright for Chromium and WebKit.

- [ ] pnpm test runs Vitest with a coverage report for engine/
- [ ] Playwright runs one smoke test in Chromium and WebKit

#### CHI-013 GitHub Actions CI with local Supabase

Repo, CI and infra · chore · 3 pts · spec 9 · depends on CHI-012, CHI-015

Typecheck, lint, Vitest and Playwright on every push and pull request, with supabase start before tests.

- [ ] CI runs on push and PR
- [ ] supabase start runs before sync and e2e tests
- [ ] main is protected and merges need green CI

#### CHI-014 Cloudflare deploys and PR previews

Repo, CI and infra · chore · 3 pts · spec 9, D11, D29 · depends on CHI-010, CHI-011, CHI-016

Workers static assets, a preview URL per pull request built with staging keys, main deploys production.

- [ ] A PR gets its own preview URL pointing at staging Supabase
- [ ] main deploys to chie.1412labs.com with production keys
- [ ] assets.not_found_handling set to single-page-application, so /play loads directly

#### CHI-015 Local Supabase for dev and tests

Repo, CI and infra · chore · 1 pt · spec 7, D16

Supabase CLI in Docker with the local inbox for sign-in emails.

- [ ] supabase start runs locally
- [ ] Sign-in emails appear in the local inbox

#### CHI-016 Create staging and production Supabase projects

Repo, CI and infra · chore · 1 pt · spec 7, D16, D17

Two free cloud projects; only the publishable (anon) key ever reaches the app.

- [ ] Staging and production projects exist
- [ ] Env vars wired per environment
- [ ] No service role or secret key in the app or repo

#### CHI-017 Sentry, errors only, with URL scrubbing

Repo, CI and infra · chore · 2 pts · spec 9, D19 · depends on CHI-011

Sentry browser SDK with no replay, no tracing, no PII, and URLs stripped of query strings and hashes.

- [ ] sendDefaultPii is false; replay and tracing off
- [ ] beforeSend and beforeBreadcrumb strip query strings and hashes
- [ ] IP address storage turned off in the Sentry project
- [ ] Releases tagged with the git commit

#### CHI-018 Verify domain in AWS SES and request production access *(waits on others)*

Repo, CI and infra · chore · 1 pt · spec 7.3, D15 · depends on CHI-010

Approval can take a day or more, so it starts on day 2.

- [ ] SPF, DKIM and DMARC records added for chie.1412labs.com
- [ ] Domain verified in SES
- [ ] Production access (leave sandbox) requested

#### CHI-019 Open a Resend account as the email fallback

Repo, CI and infra · chore · 1 pt · spec 7.3, D15 · depends on CHI-010

Same domain, ready to swap in as Supabase custom SMTP if SES is slow or refused.

- [ ] Resend account created
- [ ] Domain added in Resend

### Day 3, Fri Oct 9 (19 pts)

#### CHI-004 Fold in reviews and tag spec v1

Spec sign-off · task · 2 pts · spec 3.3, 10.1 · depends on CHI-001, CHI-002, CHI-003

Apply the Italian and developer review feedback, resolve the brown-eyes TBD, and tag the doc v1.

- [ ] Default brown-eyes word chosen and written into 3.3 and section 5
- [ ] Every lemma has a level (A1 or A2) from the Profilo check
- [ ] Message and string fixes applied to content and spec
- [ ] Spec tagged v1 with a changelog line

#### CHI-020 Zod schemas for all content

Content and art · story · 2 pts · spec 3, 3.2, 3.3, 3.4 · depends on CHI-011

Character, Article, Noun, Adjective and Template schemas, validated at build time.

- [ ] Schemas match 3.2, 3.3 and 3.4 exactly
- [ ] Build fails on invalid content

#### CHI-021 Write lexicon.json

Content and art · story · 2 pts · spec 3.3, D2, D23 · depends on CHI-020

8 nouns, 10 adjectives, 6 articles, 2 verbs, with every form written out.

- [ ] All nouns have gender, number, articles, template, artRule and adjAttrs or attr
- [ ] castano has alsoMeans eyeColor; marrone has wordChoice for capelli
- [ ] Every entry has a level from the Profilo check

#### CHI-022 Write templates.json

Content and art · story · 1 pt · spec 3.4 · depends on CHI-020

t.have, t.have.adj and t.be as declarative data with named predicates.

- [ ] Three templates with pattern, verb, article, needsAdj, predicate

#### CHI-023 Write messages.json

Content and art · story · 1 pt · spec 3.7 · depends on CHI-001

Every feedback string from 3.7, keyed by rule id, with placeholders.

- [ ] Every key in the 3.7 table exists
- [ ] Reviewer corrections applied

#### CHI-024 Seeded character generator script

Content and art · story · 3 pts · spec 3.2, D20 · depends on CHI-020

scripts/generate-characters.ts picks 24 attribute combinations that pass every invariant, retrying until they do.

- [ ] Same seed gives the same 24 characters
- [ ] Output passes all 3.2 invariants (unique, 12/12, no beards on women, 3 to 15 yes per question)

#### CHI-025 Generate, name and commit 24 characters

Content and art · task · 1 pt · spec 3.2, 3.6 · depends on CHI-024

Run the generator once, review it, give Italian names, commit characters.json.

- [ ] characters.json committed with 24 named characters and permanent ids

#### CHI-026 Content versioning and content tests

Content and art · test · 2 pts · spec 3.6, 10.2, D21 · depends on CHI-021, CHI-022, CHI-023, CHI-025

version.json, released-ids.json, and Vitest checks for schemas, invariants and references.

- [ ] All JSON passes Zod
- [ ] Every 3.2 invariant is a test
- [ ] Every referenced lexicon id and message key exists
- [ ] Test fails if an id in released-ids.json is missing

#### CHI-027 Placeholder SVG layers

Content and art · story · 3 pts · spec 3.5, D9, D26

Every file in the 3.5 manifest as flat shapes that make the attribute obvious at about 80 px wide.

- [ ] All layer files exist with manifest names
- [ ] Hat drawn high so short hair shows; eyes drawn large; beard without mustache leaves a gap
- [ ] Each attribute readable at card size

#### CHI-028 SVG face composer

Content and art · story · 2 pts · spec 3.5 · depends on CHI-025, CHI-027

Stack layers by attributes so the picture can never disagree with the data.

- [ ] Composer picks layers from attrs and skin in z order
- [ ] All 24 characters render
- [ ] Dropping in new files with the same names changes art with no code change

## Sprint 2: Playable round (Oct 12 to Oct 16)

Goal: Engine and CPU fully tested; a full round plays to a win and a loss on a real phone at both levels.

### Day 4, Mon Oct 12 (10 pts)

#### CHI-030 Engine types

Game engine · task · 1 pt · spec 4, 4.1 · depends on CHI-011

Phase, Fill, QuestionKey, SlotError, ShapeError, Feedback, AskedQuestion, GameState, Action, GameEvent.

- [ ] Types match 4.1
- [ ] engine/ imports nothing from React, the DOM or time

#### CHI-031 Seeded RNG and START

Game engine · story · 2 pts · spec 2, 4.1, 5 · depends on CHI-030

Draw both secrets independently from the seed and fix the CPU question order.

- [ ] Same seed gives the same secrets and cpuQuestionOrder
- [ ] Secrets may be the same character
- [ ] Player goes first

#### CHI-032 step() and the transition table

Game engine · story · 3 pts · spec 4.2 · depends on CHI-031

One function moves the game forward; every phase and action pair behaves as in 4.2.

- [ ] Every cell of 4.2 implemented, wrongPhase rejections included
- [ ] FLIP toggles in every phase except setup and over
- [ ] END_TURN from cpuReview increments turn and clears ratedThisTurn
- [ ] over accepts only START

#### CHI-033 Render questions and answers

Game engine · story · 2 pts · spec 2, 3.4 · depends on CHI-030

render(template, fill) builds the question and the Sì/No answer from the player's own words.

- [ ] Sì answers: 'Sì, ' + lowercased body + '.'
- [ ] No answers: 'No, non ' + lowercased body + '.'
- [ ] castani and marroni each render as themselves

#### CHI-034 Predicates and adjective meaning

Game engine · story · 2 pts · spec 3.4, 4.3 · depends on CHI-030

hasFeature, featureIs and genderIs, plus resolving what an adjective means for a given noun.

- [ ] castani on occhi resolves to eyeColor adj.marrone
- [ ] Meaning uses own attr if allowed, else first matching alsoMeans

### Day 5, Tue Oct 13 (25 pts)

#### CHI-035 ASK validation pipeline

Game engine · story · 5 pts · spec 2, 4.3 · depends on CHI-032, CHI-033, CHI-034

Run the five checks in order and reject on the first failure.

- [ ] Order: phase, unknownId, grammar, nonsense, duplicate
- [ ] Grammar returns one SlotError per wrong slot with the right rule key
- [ ] capelli marroni rejected with meaning.wordChoice; occhi biondi with meaning.mismatch
- [ ] occhi castani and occhi marroni share one QuestionKey, so the second is a duplicate
- [ ] Duplicate shows the previous answer and does not use the turn

#### CHI-036 Soft agreement slips

Game engine · story · 2 pts · spec 3.4, D24 · depends on CHI-035

A wrong adjective form is accepted, rendered correctly, and reported as a slip.

- [ ] Question rendered with the correct form
- [ ] agreementSlip event emitted with given and expected
- [ ] Adjective gets no rating that turn; forms compared by text
- [ ] A grammar-rejected question reports the agreement error in errors but emits no agreementSlip

#### CHI-037 parseTiles and shape errors

Game engine · story · 2 pts · spec 3.4, 4.1 · depends on CHI-030

Turn the four tile slots into templateId and fill, or a ShapeError.

- [ ] The noun picks the template
- [ ] noVerb, noArt, noNoun, needsAdj, noAdjAllowed each returned
- [ ] Shape errors dispatch nothing and log nothing

#### CHI-038 Rating events and ANSWER

Game engine · story · 3 pts · spec 4.1, 6, D7 · depends on CHI-035

Emit ratings per the section 6 table, at most one per card per turn.

- [ ] ratedThisTurn prevents a second rating for the same card and direction
- [ ] Correct Sì/No without hint rates recognize as hard; wrong rates again with an answer.wrong detail
- [ ] hintShown answers produce no rating
- [ ] Level 1 ASKs emit no produce rating or agreementSlip; CPU-question recognize ratings still fire at both levels

#### CHI-039 GUESS resolution

Game engine · story · 1 pt · spec 2, 4.2, D3 · depends on CHI-032

Right guess wins, wrong guess loses.

- [ ] Correct guess sets result won
- [ ] Wrong guess sets result lost
- [ ] Both move to over

#### CHI-040 Engine test suite to 90% coverage

Game engine · test · 5 pts · spec 4.4, 4.5, 9, 10.2 · depends on CHI-035, CHI-036, CHI-037, CHI-038, CHI-039, CHI-045

Transition table, invariants, the traced turn, property tests and golden strings.

- [ ] Every transition cell tested
- [ ] All 9 invariants in 4.4 tested
- [ ] 4.5 traced turn as a test, with the bionde and gli variants
- [ ] fast-check random action sequences never break invariants
- [ ] Golden snapshot of 17 questions and 34 answers
- [ ] step() under 5 ms per action
- [ ] engine/ line coverage at or above 90%

#### CHI-045 CPU chooses its move

CPU opponent · story · 3 pts · spec 5, D8 · depends on CHI-032, CHI-034, CHI-004

Guess when one candidate remains, otherwise ask the question that best splits the candidates.

- [ ] Guesses only with one candidate left
- [ ] Picks the question with yes count closest to half
- [ ] Ties go to the earlier question in cpuQuestionOrder
- [ ] Uses the default brown-eyes wording

#### CHI-046 CPU filters candidates on the true answer

CPU opponent · story · 2 pts · spec 2, 5, D4 · depends on CHI-045

The CPU always uses the truth, even when the player answers wrongly.

- [ ] Candidates filtered by the true answer
- [ ] Wrong player answer shows the correct one and logs a mistake
- [ ] cpuCandidates always contains playerSecret

#### CHI-047 CPU tests and length simulation

CPU opponent · test · 2 pts · spec 5, 10.2 · depends on CHI-046

Prove the CPU always splits, never guesses wrong, and is deterministic.

- [ ] Always finds a splitting question
- [ ] Never guesses wrong
- [ ] Same seed gives the same game
- [ ] Simulation reports average CPU questions to win (expect about 5 or 6)

### Day 6, Wed Oct 14 (16 pts)

#### CHI-049 IndexedDB storage service

Game UI · story · 2 pts · spec 7.3, 9 · depends on CHI-011

Small idb wrapper for saved rounds and guest data, asking the browser to persist it.

- [ ] Guest data stored under key guest
- [ ] navigator.storage.persist() requested
- [ ] Reads and writes wrapped so failures never block play

#### CHI-050 Game store with save and resume

Game UI · story · 3 pts · spec 2, 3.6, 9 · depends on CHI-032, CHI-049

Zustand store wraps step(), saves after every action, and resumes on reload.

- [ ] State saved after every action
- [ ] Reload mid-round resumes
- [ ] Saved round with an older contentVersion is discarded, not resumed

#### CHI-051 Board that fits a real phone

Game UI · story · 5 pts · spec 2, 8, 8.1, 9 · depends on CHI-028, CHI-050

As a learner, I see all 24 faces at once and flip them as I rule people out.

- [ ] 4 x 6 grid fits about 360 x 560 using dvh, with the sheet collapsed
- [ ] Tap flips; flipped shown by more than color (face hidden, icon)
- [ ] Flip animation off under prefers-reduced-motion
- [ ] Unflip all appears when all 24 are down

#### CHI-052 Top bar and secret card

Game UI · story · 1 pt · spec 8.1 · depends on CHI-050

Turn number, whose turn, and the player's own secret card shown small.

- [ ] Turn and whose turn always visible
- [ ] Player's secret card visible

#### CHI-053 Bottom sheet

Game UI · story · 3 pts · spec 8, D18 · depends on CHI-011

Holds the picker, builder or CPU question over the board and collapses to one line.

- [ ] Board never shrinks when the sheet opens
- [ ] Collapsed sheet shows the last answer
- [ ] Works one-handed on a phone

#### CHI-054 Card detail view

Game UI · story · 2 pts · spec 3.5, 9, D27 · depends on CHI-051

As a learner, I can long-press a face to see it large and check small details.

- [ ] Long-press opens the face large with no text
- [ ] Zoom control does the same for keyboard users

### Day 7, Thu Oct 15 (9 pts)

#### CHI-055 Level 1 question picker

Game UI · story · 2 pts · spec 8.1 · depends on CHI-053, CHI-035

As a beginner, I tap one of 16 ready-made questions with English hints.

- [ ] 16 questions listed with English glosses
- [ ] Asked questions greyed out and show their answer
- [ ] Uses the default brown-eyes wording

#### CHI-056 Level 2 tile builder

Game UI · story · 5 pts · spec 3.4, 8.1 · depends on CHI-053, CHI-037

As a learner, I build each question from verb, article, noun and adjective tiles with no English.

- [ ] Four fixed slots in order, filled by tapping tiles
- [ ] Tapping an adjective opens its forms, each distinct text once
- [ ] Built question previews in the slots
- [ ] Chiedi submits; shape errors show inline

#### CHI-057 Feedback messages

Game UI · story · 2 pts · spec 3.7 · depends on CHI-023, CHI-055

Render engine feedback from messages.json with placeholders and Italian in italics.

- [ ] Every SlotError, slip, duplicate and shape error shows its message
- [ ] Agreement slip shows the correct form next to the answer

### Day 8, Fri Oct 16 (11 pts)

#### CHI-058 CPU turn: Sì / No

Game UI · story · 2 pts · spec 2, 8.1 · depends on CHI-046, CHI-053

As a learner, I read the CPU's question and answer Sì or No.

- [ ] CPU question shows in the sheet with Sì and No
- [ ] Wrong answer shows the correct one
- [ ] Level 1 has Show hint; revealing it removes the rating
- [ ] Avanti ends the turn

#### CHI-059 Guessing with confirm

Game UI · story · 2 pts · spec 2, 8.1, D3 · depends on CHI-039, CHI-051

Indovina, tap a card, confirm. A wrong guess loses, so it is always confirmed.

- [ ] Confirm dialog before every guess
- [ ] Dialog warns when the card is flipped down

#### CHI-060 Round end screen

Game UI · story · 3 pts · spec 7.3, 8.1, 8.2 · depends on CHI-058, CHI-059

Result, both secrets, question history, this round's mistakes, Play again.

- [ ] Both secrets revealed
- [ ] Full question history with answers
- [ ] This round's mistakes listed
- [ ] Play again starts a new round
- [ ] Guests see the quiet sign-in nudge

#### CHI-061 Quit round and Continue round

Game UI · story · 2 pts · spec 2, 8.2, D33 · depends on CHI-050

Every round ends in a recorded result.

- [ ] Quit round asks to confirm and records abandoned
- [ ] Starting a new round over a saved one records it abandoned
- [ ] Ratings already logged are kept
- [ ] Home offers Continue round when one is saved

#### CHI-062 Home screen

Game UI · story · 2 pts · spec 8.1 · depends on CHI-061

Play or Continue round, level picker, Progress, Settings, sign-in status.

- [ ] Level 1 or 2 picker
- [ ] Continue round shown when a round is saved
- [ ] Sign-in status visible

## Sprint 3: Progress, sync, playtest (Oct 19 to Oct 23)

Goal: Learning data, sign-in and sync work end to end; accessibility pass done; 3+ learners have playtested.

### Day 9, Mon Oct 19 (11 pts)

#### CHI-070 Progress store and review log

Learning and progress · story · 2 pts · spec 6, D5 · depends on CHI-038, CHI-049

Turn rating and slip events into append-only ReviewLogRows.

- [ ] Each row has a client uuid, gameId, localDay and createdAt
- [ ] slip rows logged for agreement slips
- [ ] Log is never edited or deleted

#### CHI-071 Games rows written at START

Learning and progress · story · 1 pt · spec 7.3, D34 · depends on CHI-061

The games row exists before any review row points at it, and is updated at round end.

- [ ] Row written at START with seed, level, contentVersion
- [ ] Row updated with ended_at and won, lost or abandoned

#### CHI-072 FSRS replay service

Learning and progress · story · 3 pts · spec 6 · depends on CHI-070

ts-fsrs with default parameters and 0.9 retention; card state rebuilt by replaying the log.

- [ ] 36 cards (18 lemmas x 2 directions)
- [ ] Replay in createdAt order
- [ ] slip rows skipped
- [ ] easy never produced

#### CHI-073 SRS tests

Learning and progress · test · 2 pts · spec 6, 10.2 · depends on CHI-072

Event to rating table and replay correctness.

- [ ] Every row of the section 6 table tested
- [ ] Rebuild from log equals incremental state

#### CHI-074 Progress screen: Mistakes and Due

Learning and progress · story · 3 pts · spec 8.1, 8.2 · depends on CHI-072

As a learner, I see which words I got wrong and which are due.

- [ ] Mistakes tab grouped by word, showing given and expected
- [ ] Due tab lists words due today with next review date
- [ ] Empty state: 'Play a round to see your words here.'

### Day 10, Tue Oct 20 (20 pts)

#### CHI-080 Database migrations

Accounts and sync · story · 2 pts · spec 7, 7.1, D31 · depends on CHI-015, CHI-016

Tables, indexes, the new-user profile trigger and the cards stale-write guard.

- [ ] profiles, games, review_log, cards created as in 7.1
- [ ] New auth user gets a profile row
- [ ] cards update with smaller log_count is skipped
- [ ] Applied locally, then staging, then production before dependent code merges

#### CHI-081 Row Level Security and RLS tests

Accounts and sync · test · 2 pts · spec 7.2, 10.2 · depends on CHI-080

Policies from 7.2, proven by tests.

- [ ] RLS enabled on all four tables
- [ ] review_log has no update or delete policy
- [ ] Test proves user A cannot read user B's review_log
- [ ] anon can read and write nothing

#### CHI-082 Sign-in email template and SMTP

Accounts and sync · chore · 1 pt · spec 7.3, D10, D15 · depends on CHI-018, CHI-019, CHI-016

Code-only email template; production sends through SES or Resend, staging uses the built-in sender.

- [ ] Template shows {{ .Token }} and no link
- [ ] Production custom SMTP set to SES (or Resend)
- [ ] A code reaches an address outside the team

#### CHI-083 Sign-in sheet with 6-digit code

Accounts and sync · story · 3 pts · spec 7.3, 8.1, 8.2 · depends on CHI-082, CHI-053

As a learner, I sign in by typing a code from my email into the same tab.

- [ ] signInWithOtp sends the code; verifyOtp type email checks it
- [ ] Resend code offered after the cooldown
- [ ] Inline errors for wrong or expired code and for send failure

#### CHI-084 Outbox and flush

Accounts and sync · story · 3 pts · spec 7.3, 8.2 · depends on CHI-080, CHI-070, CHI-071

Every signed-in write goes to an IndexedDB outbox first, then to Supabase.

- [ ] games rows always flushed before review_log rows
- [ ] Flush on round end, app start and the online event
- [ ] Failed flush keeps rows and shows 'Saved on this device, will sync later.'

#### CHI-085 Guest to account upload

Accounts and sync · story · 2 pts · spec 7.3, D6 · depends on CHI-083, CHI-084

As a guest who signs in, I keep my progress.

- [ ] Prompt 'Save your progress to this account?' defaults to Yes
- [ ] Yes rewrites user_id and uploads games then review_log with on conflict do nothing
- [ ] No deletes guest data

#### CHI-086 Cross-device merge

Accounts and sync · story · 2 pts · spec 7.3, D5, D31 · depends on CHI-084, CHI-072

After each sync, download the full log, replay it, upsert cards with log_count.

- [ ] Two devices converge to the same Progress
- [ ] Stale device cannot overwrite newer cards

#### CHI-087 Sign-out with unsynced warning

Accounts and sync · story · 1 pt · spec 7.3, D35 · depends on CHI-084

Sign-out clears local data, warning first if the outbox is not empty.

- [ ] Local copy cleared on sign-out
- [ ] Unsynced rows trigger 'Some progress hasn't synced yet. Sign out anyway?' with Sign out and Wait

#### CHI-088 Sync tests against local Supabase

Accounts and sync · test · 3 pts · spec 10.2 · depends on CHI-085, CHI-086

Prove the sync rules in 7.3.

- [ ] Guest upload is idempotent
- [ ] games flush before review rows
- [ ] Two-device merge converges
- [ ] Smaller log_count upsert ignored
- [ ] New user gets a profile row

#### CHI-089 Settings screen

Accounts and sync · story · 1 pt · spec 8.1 · depends on CHI-087

Default level, account sign in or out, link to the privacy note.

- [ ] Default level saved
- [ ] Sign in and sign out reachable
- [ ] Privacy note linked

### Day 11, Wed Oct 21 (15 pts)

#### CHI-090 Accessibility pass

Accessibility, states, privacy · story · 3 pts · spec 9 · depends on CHI-062

WCAG 2.2 AA: screen reader names in Italian, full keyboard play, visible focus, 44 px targets.

- [ ] Each card's accessible name lists name and attributes in Italian
- [ ] Full round playable by keyboard with visible focus
- [ ] Touch targets at least 44 x 44 px

#### CHI-091 Loading, empty and error states

Accessibility, states, privacy · story · 2 pts · spec 8.2 · depends on CHI-084

Every state in the 8.2 table.

- [ ] Skeleton board while loading
- [ ] Sync failed banner never blocks play
- [ ] Connection lost mid-round keeps the round playable

#### CHI-092 Privacy note page

Accessibility, states, privacy · story · 1 pt · spec 7.3, 9, D28 · depends on CHI-011

What is stored, third parties, Safari clearing guest data, and the deletion email address.

- [ ] Lists Supabase, Cloudflare, the email sender (SES or Resend) and Sentry, and what each sees
- [ ] Says Safari can clear guest data
- [ ] Gives the account deletion email and the one-month promise

#### CHI-093 Test account deletion on staging

Accessibility, states, privacy · task · 1 pt · spec 7.3, 10.3 · depends on CHI-080

Delete one user in the dashboard and confirm cascades remove every row.

- [ ] User deleted on staging
- [ ] No rows remain in games, review_log, cards, profiles

#### CHI-094 Performance and Lighthouse budget

Accessibility, states, privacy · test · 2 pts · spec 9, 10.3 · depends on CHI-090

Initial JS under 250 KB gzipped, LCP under 2.5 s, accessibility score at least 95.

- [ ] Bundle size checked in CI or by hand
- [ ] Lighthouse mobile LCP under 2.5 s
- [ ] Lighthouse accessibility at least 95

#### CHI-100 End-to-end Playwright suite

Testing and playtest · test · 3 pts · spec 10.2 · depends on CHI-060, CHI-061, CHI-083

Chromium and WebKit, against local Supabase.

- [ ] Seeded round to a win
- [ ] Wrong guess loses
- [ ] Quit records abandoned
- [ ] Sign-in with a code from the local inbox
- [ ] Reload mid-round resumes
- [ ] /play loads directly

#### CHI-101 Real device pass

Testing and playtest · test · 2 pts · spec 3.5, 10.2, 10.3 · depends on CHI-060

iPhone Safari and Android Chrome, with browser toolbars showing.

- [ ] Board fits the visible area
- [ ] Bottom sheet and long-press detail work
- [ ] Full round playable one-handed
- [ ] All 24 faces spot-checked against their data

#### CHI-102 Playtest build on staging

Testing and playtest · chore · 1 pt · spec 10.2, 10.4 · depends on CHI-100, CHI-101

A stable staging build and a short note for testers.

- [ ] Staging build deployed
- [ ] Findings form or sheet ready (rounds lost, minutes per round, confusing strings)

### Day 12, Thu Oct 22 (4 pts)

#### CHI-103 Run playtests *(waits on others)*

Testing and playtest · task · 3 pts · spec 10.2 · depends on CHI-102, CHI-005

3 or more A1 learners play 3 rounds each.

- [ ] Rounds lost, minutes per round and every confusing string recorded per tester

#### CHI-104 Triage playtest findings

Testing and playtest · task · 1 pt · spec 10.3 · depends on CHI-103

Sort every finding into must-fix now or section 11.

- [ ] Every finding labelled must-fix or future
- [ ] Must-fix items added as cards

### Day 13, Fri Oct 23 (3 pts)

#### CHI-105 Playtest fixes, part 1

Testing and playtest · story · 3 pts · spec 10.4 · depends on CHI-104

Timebox for the highest-impact must-fix findings.

- [ ] Top must-fix findings fixed and deployed to staging

## Sprint 4: Fix and launch (Oct 26 to Oct 29)

Goal: Must-fix playtest findings closed, every definition-of-done box checked, live at chie.1412labs.com.

### Days 14 to 15, Mon Oct 26 to Tue Oct 27 (5 pts)

#### CHI-106 Playtest fixes, part 2

Testing and playtest · story · 5 pts · spec 3.2, 5, 10.4 · depends on CHI-105

Timebox for the remaining must-fix findings, including question balance tuning.

- [ ] Every must-fix finding fixed
- [ ] 3-to-15 yes-count invariant confirmed or retuned (3.2 TBD)
- [ ] Easy CPU decision recorded if learners lost too often (section 5)

### Day 16, Wed Oct 28 (6 pts)

#### CHI-110 Production Supabase on Pro

Launch · chore · 1 pt · spec 9, D17 · depends on CHI-080

Upgrade production and confirm migrations are applied.

- [ ] Production on Pro
- [ ] All migrations applied to production

#### CHI-111 Final email check in production

Launch · task · 1 pt · spec 7.3, 10.3 · depends on CHI-082

A sign-in code from production reaches an outside address.

- [ ] SES out of sandbox, or Resend in place
- [ ] Code received at a non-team address

#### CHI-112 Sentry test error from production

Launch · task · 1 pt · spec 9, 10.3 · depends on CHI-017

Throw one test error and check the event carries no personal data.

- [ ] Event received
- [ ] No email, IP, query string or hash in it

#### CHI-113 README

Launch · chore · 2 pts · spec 1, 10.3 · depends on CHI-025

How to run, test, deploy and add a character.

- [ ] Run, test, deploy and add-a-character sections written

#### CHI-114 TBD and definition-of-done sweep

Launch · task · 1 pt · spec 10.3 · depends on CHI-106

Every TBD resolved or moved to section 11; every 10.3 box checked.

- [ ] No open TBD in the spec
- [ ] Every 10.3 box checked

### Day 17, Thu Oct 29 (1 pt)

#### CHI-115 Launch

Launch · task · 1 pt · spec 1, 3.6, 10.4 · depends on CHI-110, CHI-111, CHI-112, CHI-113, CHI-114

Merge to main, update released-ids.json, confirm the live URL plays on both phones.

- [ ] chie.1412labs.com live
- [ ] released-ids.json updated for this release
- [ ] Full round played on iPhone and Android against production

## Definition of done (10.3) mapped to cards

| Item | Cards |
|---|---|
| Deployed URL loads on an iPhone and plays a full round | CHI-101, CHI-115 |
| Deployed URL loads on an Android phone and plays a full round | CHI-101, CHI-115 |
| All 24 characters render with art that matches their attributes | CHI-028, CHI-101 |
| Level 1 and Level 2 both playable to a win and a loss | CHI-055, CHI-056, CHI-059, CHI-100 |
| Grammar mistake feedback names the rule and shows in Mistakes; slips show the correct form | CHI-036, CHI-057, CHI-074 |
| Every lexicon entry has a level from the Profilo check | CHI-004, CHI-021 |
| Guest progress survives a reload | CHI-049, CHI-050 |
| Signing in uploads guest progress; a second browser shows the same Progress | CHI-085, CHI-086 |
| RLS test proves user A cannot read user B's review_log | CHI-081 |
| A sign-in code reaches an address outside the team | CHI-082, CHI-111 |
| Privacy note live with the deletion email; one deletion tested on staging | CHI-092, CHI-093 |
| A pull request preview signs in against staging, never production | CHI-014, CHI-083 |
| Sentry receives a test error from production with no personal data | CHI-017, CHI-112 |
| At least 3 A1 learners have playtested; findings logged and triaged | CHI-103, CHI-104 |
| engine/ coverage at or above 90%; CI green | CHI-013, CHI-040 |
| Lighthouse mobile: LCP under 2.5 s, accessibility at least 95 | CHI-094 |
| Every TBD resolved or moved to section 11 | CHI-114 |
| README covers run, test, deploy, and adding a character | CHI-113 |
