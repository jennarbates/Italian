// Spec 6 and 7: what the learner did, kept on this device. games rows (one per
// round) and the append-only review log, both under the IndexedDB key "guest"
// (spec 7.3). Sync for signed-in users builds on this in Sprint 3.
import { create } from "zustand";
import type { Direction, GameEvent, Level, SlotError } from "../engine/index.ts";
import { read, write } from "../services/storage.ts";

export type GameRow = {
  id: string; // client uuid
  seed: number;
  level: Level;
  contentVersion: number;
  startedAt: string; // ISO
  endedAt?: string;
  result?: "won" | "lost" | "abandoned";
};

export type ReviewLogRow = {
  id: string; // client uuid, makes sync idempotent
  gameId: string;
  lexiconId: string;
  direction: Direction;
  rating: "again" | "hard" | "good" | "slip"; // slip rows feed the Mistakes tab; FSRS skips them
  detail?: SlotError;
  localDay: string; // "2026-10-06" in the learner's timezone
  createdAt: string; // ISO
};

export type GuestData = { games: GameRow[]; reviewLog: ReviewLogRow[] };

type ProgressStore = GuestData & {
  loaded: boolean;
  hydrate: () => Promise<void>;
  recordGameStart: (game: Omit<GameRow, "endedAt" | "result">) => void;
  recordGameEnd: (gameId: string, result: NonNullable<GameRow["result"]>, at?: Date) => void;
  appendEvents: (gameId: string, events: GameEvent[], at?: Date) => ReviewLogRow[];
};

// "2026-10-06" in the device's own timezone (not UTC).
export function localDay(at: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
}

// Rating and slip events become log rows; every other event is not learning data.
export function rowsFor(
  gameId: string,
  events: GameEvent[],
  at: Date,
  newId: () => string = () => crypto.randomUUID(),
): ReviewLogRow[] {
  const common = { gameId, localDay: localDay(at), createdAt: at.toISOString() };
  return events.flatMap((e): ReviewLogRow[] => {
    if (e.type === "rating") {
      return [
        {
          id: newId(),
          ...common,
          lexiconId: e.lexiconId,
          direction: e.direction,
          rating: e.rating,
          ...(e.detail && { detail: e.detail }),
        },
      ];
    }
    if (e.type === "agreementSlip") {
      return [
        {
          id: newId(),
          ...common,
          lexiconId: e.lexiconId,
          direction: "produce",
          rating: "slip",
          detail: { slot: "adj", given: e.given, expected: e.expected, rule: "agreement" },
        },
      ];
    }
    return [];
  });
}

let saving: Promise<unknown> = Promise.resolve();
function persist(data: GuestData) {
  saving = saving.then(() => write("guest", data));
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  games: [],
  reviewLog: [],
  loaded: false,

  async hydrate() {
    const saved = await read<Partial<GuestData>>("guest");
    // Anything recorded before the saved data arrived is kept, after it.
    set((s) => ({
      loaded: true,
      games: [...(Array.isArray(saved?.games) ? saved.games : []), ...s.games],
      reviewLog: [...(Array.isArray(saved?.reviewLog) ? saved.reviewLog : []), ...s.reviewLog],
    }));
  },

  recordGameStart(game) {
    set((s) => ({ games: [...s.games.filter((g) => g.id !== game.id), game] }));
    persist(snapshot(get()));
  },

  recordGameEnd(gameId, result, at = new Date()) {
    set((s) => ({
      games: s.games.map((g) =>
        g.id === gameId && !g.result ? { ...g, endedAt: at.toISOString(), result } : g,
      ),
    }));
    persist(snapshot(get()));
  },

  appendEvents(gameId, events, at = new Date()) {
    const rows = rowsFor(gameId, events, at);
    if (rows.length) {
      // Append only: rows are never edited or removed.
      set((s) => ({ reviewLog: [...s.reviewLog, ...rows] }));
      persist(snapshot(get()));
    }
    return rows;
  },
}));

const snapshot = ({ games, reviewLog }: GuestData): GuestData => ({ games, reviewLog });

export function progressSaved(): Promise<unknown> {
  return saving;
}
