// Spec 2, 3.6 and 9: the round in play. Wraps the engine's step(), saves after
// every action, and resumes a saved round on reload unless the content changed.
import { create } from "zustand";
import { content, contentVersion } from "../content/index.ts";
import {
  setupState,
  step,
  type Action,
  type GameEvent,
  type GameState,
  type Level,
} from "../engine/index.ts";
import { read, remove, write } from "../services/storage.ts";

export type SavedRound = { contentVersion: number; state: GameState };

type GameStore = {
  status: "loading" | "ready";
  game: GameState | null; // null: no round in progress
  lastEvents: GameEvent[];
  // Load the saved round, if there is one and it is still valid.
  hydrate: () => Promise<void>;
  start: (level: Level, seed?: number) => GameEvent[];
  dispatch: (action: Action) => GameEvent[];
  // Forget the round (quit, or replaced by a new one).
  clear: () => void;
};

// Saves happen in order, one after another, so a slow write can't land after a
// newer one.
let saving: Promise<unknown> = Promise.resolve();
function persist(game: GameState | null) {
  saving = saving.then(() =>
    game && game.phase !== "over" && game.phase !== "setup"
      ? write("round", { contentVersion, state: game } satisfies SavedRound)
      : remove("round"),
  );
}

export function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

export const useGameStore = create<GameStore>((set, get) => ({
  status: "loading",
  game: null,
  lastEvents: [],

  async hydrate() {
    const saved = await read<SavedRound>("round");
    if (saved && isResumable(saved)) {
      set({ status: "ready", game: saved.state, lastEvents: [] });
      return;
    }
    // An older content version or a damaged save is discarded, not resumed (3.6).
    if (saved) await remove("round");
    set({ status: "ready", game: null, lastEvents: [] });
  },

  start(level, seed = randomSeed()) {
    const from = get().game?.phase === "over" ? (get().game as GameState) : setupState();
    const { state, events } = step(from, { type: "START", seed, level }, content);
    set({ game: state, lastEvents: events });
    persist(state);
    return events;
  },

  dispatch(action) {
    const game = get().game;
    if (!game) return [];
    const { state, events } = step(game, action, content);
    set({ game: state, lastEvents: events });
    persist(state);
    return events;
  },

  clear() {
    set({ game: null, lastEvents: [] });
    persist(null);
  },
}));

function isResumable(saved: SavedRound): boolean {
  if (saved.contentVersion !== contentVersion) return false;
  const s = saved.state as Partial<GameState> | undefined;
  const ids = new Set(content.characters.map((c) => c.id));
  return (
    !!s &&
    typeof s.phase === "string" &&
    s.phase !== "over" &&
    s.phase !== "setup" &&
    ids.has(s.playerSecret ?? "") &&
    ids.has(s.cpuSecret ?? "") &&
    Array.isArray(s.history) &&
    Array.isArray(s.flipped) &&
    Array.isArray(s.cpuCandidates) &&
    Array.isArray(s.cpuQuestionOrder) &&
    Array.isArray(s.ratedThisTurn)
  );
}

// Tests: wait for queued saves to land.
export function savesSettled(): Promise<unknown> {
  return saving;
}
