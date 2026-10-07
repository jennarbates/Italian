import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { contentVersion } from "../content/index.ts";
import { allQuestions } from "../engine/index.ts";
import { read, resetForTests, write } from "../services/storage.ts";
import { randomSeed, savesSettled, useGameStore, type SavedRound } from "./gameStore.ts";

const q = allQuestions((await import("../content/index.ts")).content)[0];
if (!q) throw new Error("no questions");
const ask = { type: "ASK" as const, templateId: q.templateId, fill: q.fill };

beforeEach(() => {
  vi.stubGlobal("indexedDB", new IDBFactory());
  resetForTests();
  useGameStore.setState({ status: "loading", game: null, lastEvents: [] });
});

async function saved() {
  await savesSettled();
  return read<SavedRound>("round");
}

describe("start and dispatch", () => {
  test("start begins a round at the chosen level and saves it", async () => {
    useGameStore.getState().start(2, 123);
    const { game } = useGameStore.getState();
    expect(game).toMatchObject({ phase: "playerTurn", level: 2, seed: 123 });
    expect(await saved()).toEqual({ contentVersion, state: game });
  });

  test("state is saved after every action", async () => {
    const store = useGameStore.getState();
    store.start(1, 5);
    for (const action of [
      ask,
      { type: "FLIP" as const, characterId: "c.anna" },
      { type: "END_TURN" as const },
    ]) {
      store.dispatch(action);
      expect(await saved()).toEqual({ contentVersion, state: useGameStore.getState().game });
    }
  });

  test("dispatch returns the engine's events and keeps them as lastEvents", () => {
    useGameStore.getState().start(1, 5);
    const events = useGameStore.getState().dispatch(ask);
    expect(events[0]).toMatchObject({ type: "asked", by: "player" });
    expect(useGameStore.getState().lastEvents).toBe(events);
  });

  test("a finished round is not kept as a saved round", async () => {
    const store = useGameStore.getState();
    store.start(1, 5);
    const cpuSecret = useGameStore.getState().game?.cpuSecret ?? "";
    store.dispatch({ type: "GUESS", characterId: cpuSecret });
    expect(useGameStore.getState().game?.result).toBe("won");
    expect(await saved()).toBeUndefined();
  });

  test("start after a finished round begins a fresh one", () => {
    const store = useGameStore.getState();
    store.start(1, 5);
    store.dispatch({ type: "GUESS", characterId: "c.anna" });
    store.start(2, 6);
    expect(useGameStore.getState().game).toMatchObject({
      phase: "playerTurn",
      seed: 6,
      history: [],
    });
  });

  test("dispatch with no round does nothing", () => {
    expect(useGameStore.getState().dispatch(ask)).toEqual([]);
    expect(useGameStore.getState().game).toBeNull();
  });

  test("clear forgets the round and its save", async () => {
    useGameStore.getState().start(1, 5);
    useGameStore.getState().clear();
    expect(useGameStore.getState().game).toBeNull();
    expect(await saved()).toBeUndefined();
  });

  test("randomSeed gives 32-bit seeds", () => {
    const seeds = Array.from({ length: 50 }, randomSeed);
    for (const s of seeds) expect(Number.isInteger(s) && s >= 0 && s < 2 ** 32).toBe(true);
    expect(new Set(seeds).size).toBeGreaterThan(45);
  });
});

describe("hydrate", () => {
  test("a reload mid-round resumes exactly where it was", async () => {
    const store = useGameStore.getState();
    store.start(2, 77);
    store.dispatch(ask);
    store.dispatch({ type: "FLIP", characterId: "c.marco" });
    const before = useGameStore.getState().game;
    await savesSettled();

    // A reload: fresh store state, fresh database connection.
    useGameStore.setState({ status: "loading", game: null, lastEvents: [] });
    resetForTests();
    await useGameStore.getState().hydrate();
    expect(useGameStore.getState()).toMatchObject({ status: "ready", game: before });

    // And play carries on from there.
    useGameStore.getState().dispatch({ type: "END_TURN" });
    expect(useGameStore.getState().game?.phase).toBe("cpuTurn");
  });

  test("with nothing saved, ready with no round", async () => {
    await useGameStore.getState().hydrate();
    expect(useGameStore.getState()).toMatchObject({ status: "ready", game: null });
  });

  test("a saved round with an older contentVersion is discarded, not resumed", async () => {
    useGameStore.getState().start(1, 5);
    const state = useGameStore.getState().game;
    await savesSettled();
    await write("round", { contentVersion: contentVersion - 1, state });
    useGameStore.setState({ status: "loading", game: null });
    await useGameStore.getState().hydrate();
    expect(useGameStore.getState().game).toBeNull();
    expect(await read("round")).toBeUndefined();
  });

  test.each([
    ["nothing useful", { contentVersion }],
    ["an unknown secret", "unknown"],
    ["a finished round", "over"],
    ["missing history", "noHistory"],
  ])("a damaged save (%s) is discarded", async (_, kind) => {
    useGameStore.getState().start(1, 5);
    const state = useGameStore.getState().game;
    await savesSettled();
    const damaged =
      kind === "unknown"
        ? { contentVersion, state: { ...state, cpuSecret: "c.nobody" } }
        : kind === "over"
          ? { contentVersion, state: { ...state, phase: "over" } }
          : kind === "noHistory"
            ? { contentVersion, state: { ...state, history: undefined } }
            : kind;
    await write("round", damaged);
    useGameStore.setState({ status: "loading", game: null });
    await useGameStore.getState().hydrate();
    expect(useGameStore.getState().game).toBeNull();
    expect(await read("round")).toBeUndefined();
  });

  test("broken storage still gets the app to ready", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("indexedDB", {
      open: () => {
        throw new Error("nope");
      },
    });
    resetForTests();
    await useGameStore.getState().hydrate();
    expect(useGameStore.getState().status).toBe("ready");
    useGameStore.getState().start(1, 5);
    expect(useGameStore.getState().game?.phase).toBe("playerTurn");
  });
});
