# CHI-003 Paper trace

One Level 2 round traced from START to `over` using only spec v0.4. Every point where the spec didn't say what happens is logged below as a gap, with a proposed fix. The fixes go into the spec in CHI-004.

## Setup

The real 24 characters don't exist yet (CHI-025), so the trace uses a 6-character board. The CPU logic is the same.

| Id | gender | hair | length | eyes | glasses | hat | beard | mustache |
|---|---|---|---|---|---|---|---|---|
| c.giulia | donna | castano | lungo | verde | ✓ | | | |
| c.marco | uomo | nero | corto | marrone | | ✓ | ✓ | ✓ |
| c.elena | donna | biondo | corto | azzurro | | ✓ | | |
| c.luca | uomo | biondo | corto | verde | ✓ | | | ✓ |
| c.sara | donna | nero | lungo | marrone | | | | |
| c.paolo | uomo | bianco | corto | azzurro | ✓ | ✓ | ✓ | |

## Trace

1. **Before START.** The table in 4.2 has a `setup` row, but nothing says how a `setup` state is created or what its fields hold before the secrets are drawn. → **G1**
2. **START { seed: 42, level: 2 }.** The seeded RNG draws `cpuSecret = c.giulia` and `playerSecret = c.marco`, and shuffles the 16 questions into `cpuQuestionOrder`. The RNG algorithm isn't named. Determinism (4.4 #7) holds with any algorithm, but saved games and the "same seed gives the same game" test need it fixed for good. → **G2**. `turn` starts at... the spec doesn't say. I used 1. → **G3**. `cpuCandidates` is all 6 ids. Phase `playerTurn`.
3. **Player taps `Ha` `gli` `capelli` `biondi`.** `parseTiles` → `t.have.adj`. ASK: grammar fails on the article. The engine rejects with `art.mpl.consonant` and emits `rating { n.capelli, produce, again }`. `ratedThisTurn = ["n.capelli|produce"]`. Phase stays `playerTurn` (invariant 4 allows the `ratedThisTurn` change). ✓
4. **Player fixes it: `Ha` `i` `capelli` `bionde`.** Grammar passes, meaning passes, no duplicate. It's accepted as a slip. Truth on Giulia: `castano ≠ biondo` → No. Rendered `Ha i capelli biondi?` / `No, non ha i capelli biondi.` Events: `asked`, `agreementSlip { adj.biondo, bionde, biondi }`. The noun is already in `ratedThisTurn`, so no `good` for `n.capelli` (it keeps `again`). ✓ The spec's 4.5 example shows the `good` rating only for the first-try case, which is consistent.
5. **Player flips Elena and Luca, taps Avanti (END_TURN).** The CPU moves (section 5). 6 candidates, so the half is 3. `Ha gli occhiali?` gets 3 yes (Giulia, Luca, Paolo), and so do `È un uomo?` (3) and `Ha il cappello?` (3). Ties go to `cpuQuestionOrder`, so say `Ha gli occhiali?`. `pendingCpuQuestion` is set and the phase becomes `cpuTurn`. Is the CPU's question added to `history` now, and is `asked { by: "cpu" }` emitted now or at ANSWER? `AskedQuestion.playerAnswer` is optional, which suggests it's appended now and filled in later, but that isn't stated. → **G4**
6. **ANSWER { value: false, hintShown: false }.** Marco has no glasses, so No is correct. The phase becomes `cpuReview` and recognize ratings fire for `n.occhiali` at `hard`. There's no adjective, so just the noun ✓. Is `pendingCpuQuestion` cleared here? Not stated. → **G4**. The CPU filters on the true answer, leaving Marco, Elena and Sara. When does the filter happen, at ANSWER or at END_TURN? The table says ANSWER → `cpuReview` only, and section 5 says "after the player answers", so I took it to be at ANSWER. → **G4**
7. **END_TURN.** → `playerTurn`, `turn = 2`, `ratedThisTurn` cleared ✓.
8. **Turn 2. Player builds `Ha` `gli` `occhi` `marroni`.** Accepted. Giulia is `verde` → No. Key `t.have.adj|n.occhi|adj.marrone`.
9. **Player tries `Ha` `gli` `occhi` `castani`.** Duplicate (same key) → rejected, "You already asked that". ✓ Did the earlier `good` for `n.occhi` block a second one? It's rejected anyway, so nothing is emitted ✓.
10. **Player builds `Ha` `gli` `capelli` `lunghi`.** It's still turn 2, and the phase is `playerReview`, so the ASK is rejected with `wrongPhase`. The UI won't let this happen, but the engine handles it ✓.
11. **END_TURN → CPU.** 3 candidates (Marco, Elena, Sara). The best split is 1 or 2. It asks `È un uomo?` (1 yes). The player answers Sì. Candidates become [Marco]. END_TURN → turn 3.
12. **Turn 3.** Player asks `Ha gli occhiali?` → Sì. Candidates on the player's side are Giulia, Luca and Paolo. END_TURN → the CPU has 1 candidate → guesses Marco → `over`, `lost`. The CPU never needed a cpuTurn at turn 3, which is consistent with the table ✓.
13. **The player loses.** The round end screen shows "this round's mistakes": the `again` on capelli and the slip on biondi. Those come from the events and the review log, which matches section 6 ✓.

## Gaps found

| # | Gap | Proposed fix |
|---|---|---|
| G1 | No initial state is defined for `setup` | Add `initialState(): GameState` to 4.1, with phase `setup` and empty arrays. START fills the rest |
| G2 | RNG algorithm not named | Name one (mulberry32 with a 32-bit seed) in 4.1. Store `seed` as a 32-bit unsigned int so it fits `bigint` |
| G3 | Starting value of `turn` not stated | `turn = 1` after START |
| G4 | The CPU question's lifecycle isn't stated: when it joins `history`, when `asked { by: "cpu" }` fires, when `pendingCpuQuestion` clears, and when `cpuCandidates` is filtered | END_TURN from `playerReview`: append an `AskedQuestion` without `playerAnswer`, emit `asked`. ANSWER: set `playerAnswer`, clear `pendingCpuQuestion`, filter `cpuCandidates` |
| G5 | `uomo` needs a `defArt` (required in the schema), but its article is *l'*, which isn't one of the 6 articles | Make `defArt` optional, like `indefArt`, and require one or the other through the template's `article` field in a content test |
| G6 | Hint shown and answered wrongly: section 2 says every wrong answer logs a mistake, but section 6 says a shown hint means no rating | Decide which wins. Proposal: no rating, but still log the `answer.wrong` detail as a `slip`-style row for the Mistakes tab |
| G7 | The `meaning.mismatch` message needs `{allowed}` ("eye color") and `agreement` needs `{genderNumber}` ("masculine plural"), but no data holds these English labels | Add an `attrLabels` map and a `genderNumberLabels` map to `messages.json` |
| G8 | The `shape.needsAdj` message says "add a color or length" for both `capelli` and `occhi`, but eyes have no length | Build the hint from `noun.adjAttrs` using the G7 labels, or use two message keys |
| G9 | Level 2 has no English, but there's nothing that says `hintShown` is always false at Level 2 | State it in 8.1. The engine can reject `hintShown: true` at Level 2, or just accept it. Proposal: accept it, because the UI never sends it |
| G10 | The CPU's recognize rating for a brown-eyes question is against `adj.castano` or `adj.marrone`, depending on the default word | Follows automatically once the review picks the default. Note it in section 6 |

None of these block the scaffold (CHI-011) or content (CHI-020 onwards). G5 and G7 change the content schema, so they should be settled before CHI-020 on Friday.
