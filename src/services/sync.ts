// Spec 7.3: signed in, every write goes to an IndexedDB outbox first, then is
// flushed to Supabase. games rows always go before review_log rows, because each
// log row points at its game. A failed flush keeps everything and tries again on
// the next round end, app start or `online` event; play is never blocked.
import { create } from "zustand";
import type { GameRow, ReviewLogRow } from "../store/progressStore.ts";
import { read, write } from "./storage.ts";
import { supabase } from "./supabase.ts";

export type Op = { kind: "game"; row: GameRow } | { kind: "review"; row: ReviewLogRow };

type SyncStore = {
  userId: string | null;
  outbox: Op[];
  status: "idle" | "syncing" | "failed";
  // Load this user's outbox (or forget it when null).
  load: (userId: string | null) => Promise<void>;
  enqueue: (ops: Op[]) => void;
  flush: () => Promise<boolean>;
};

const key = (userId: string) => `outbox:${userId}` as const;

let saving: Promise<unknown> = Promise.resolve();
function persist(userId: string, outbox: Op[]) {
  saving = saving.then(() => write(key(userId), outbox));
}

export const gameToDb = (userId: string, g: GameRow) => ({
  id: g.id,
  user_id: userId,
  seed: g.seed,
  level: g.level,
  content_version: g.contentVersion,
  started_at: g.startedAt,
  ended_at: g.endedAt ?? null,
  result: g.result ?? null,
});

export const reviewToDb = (userId: string, r: ReviewLogRow) => ({
  id: r.id,
  user_id: userId,
  game_id: r.gameId,
  lexicon_id: r.lexiconId,
  direction: r.direction,
  rating: r.rating,
  detail: r.detail ?? null,
  local_day: r.localDay,
  created_at: r.createdAt,
});

let flushing: Promise<boolean> | undefined;

export const useSyncStore = create<SyncStore>((set, get) => ({
  userId: null,
  outbox: [],
  status: "idle",

  async load(userId) {
    if (!userId) {
      set({ userId: null, outbox: [], status: "idle" });
      return;
    }
    const saved = await read<Op[]>(key(userId));
    set({ userId, outbox: Array.isArray(saved) ? saved : [], status: "idle" });
  },

  enqueue(ops) {
    const { userId, outbox } = get();
    if (!userId || ops.length === 0) return;
    const next = [...outbox, ...ops];
    set({ outbox: next });
    persist(userId, next);
  },

  flush() {
    // One flush at a time; a second call waits for the one in flight.
    flushing ??= doFlush().finally(() => {
      flushing = undefined;
    });
    return flushing;
  },
}));

async function doFlush(): Promise<boolean> {
  const { userId, outbox } = useSyncStore.getState();
  if (!userId || !supabase) return false;
  if (outbox.length === 0) return true;
  useSyncStore.setState({ status: "syncing" });

  // The newest version of each game wins (START, then round end).
  const games = new Map<string, GameRow>();
  const reviews: ReviewLogRow[] = [];
  for (const op of outbox) {
    if (op.kind === "game") games.set(op.row.id, op.row);
    else reviews.push(op.row);
  }

  try {
    if (games.size) {
      const { error } = await supabase
        .from("games")
        .upsert([...games.values()].map((g) => gameToDb(userId, g)));
      if (error) throw error;
    }
    if (reviews.length) {
      // Append-only and idempotent: a row already on the server is skipped.
      const { error } = await supabase.from("review_log").upsert(
        reviews.map((r) => reviewToDb(userId, r)),
        { onConflict: "id", ignoreDuplicates: true },
      );
      if (error) throw error;
    }
  } catch {
    useSyncStore.setState({ status: "failed" });
    return false;
  }

  // Remove only what was sent; anything enqueued meanwhile stays for next time.
  const sent = new Set(outbox);
  const rest = useSyncStore.getState().outbox.filter((op) => !sent.has(op));
  useSyncStore.setState({ outbox: rest, status: "idle" });
  persist(userId, rest);
  return true;
}

export function syncSaved(): Promise<unknown> {
  return saving;
}
