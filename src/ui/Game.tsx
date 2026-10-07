import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { content } from "../content/index.ts";
import type { Level } from "../engine/index.ts";
import { useGameStore } from "../store/gameStore.ts";
import { Board } from "./game/Board.tsx";
import { CardDetail } from "./game/CardDetail.tsx";
import { Sheet } from "./game/Sheet.tsx";
import { TopBar } from "./game/TopBar.tsx";

const byId = new Map(content.characters.map((c) => [c.id, c]));

export function Game() {
  const { status, game, start, dispatch } = useGameStore();
  const [params] = useSearchParams();
  const [zoomed, setZoomed] = useState<string>();
  const [sheetOpen, setSheetOpen] = useState(true);

  // /play with no round in progress starts one (at ?level=, default 1). ?seed= is
  // for tests that need a known game.
  useEffect(() => {
    if (status !== "ready" || game) return;
    const level: Level = params.get("level") === "2" ? 2 : 1;
    const seed = params.get("seed");
    start(level, seed !== null && /^\d+$/.test(seed) ? Number(seed) : undefined);
  }, [status, game, params, start]);

  if (status !== "ready" || !game) return <SkeletonBoard />;

  const secret = byId.get(game.playerSecret);
  if (!secret) return <SkeletonBoard />;
  const last = game.history.at(-1);

  return (
    <div className="flex h-dvh flex-col">
      <TopBar game={game} secret={secret} />
      {/* Room for the collapsed sheet, so the open sheet overlays the board instead of shrinking it. */}
      <div className="flex min-h-0 flex-1 flex-col pb-14">
        <Board
          characters={content.characters}
          flipped={game.flipped}
          guessing={false}
          onTap={(id) => dispatch({ type: "FLIP", characterId: id })}
          onZoom={setZoomed}
          onUnflipAll={() => {
            for (const id of game.flipped) dispatch({ type: "FLIP", characterId: id });
          }}
        />
      </div>
      <Sheet
        summary={last ? last.answerText : "Ask your first question."}
        open={sheetOpen}
        onToggle={() => setSheetOpen((o) => !o)}
      >
        <ol className="flex flex-col gap-1 py-2 text-sm">
          {game.history.map((h, i) => (
            <li key={i}>
              <span className="text-stone-500">{h.by === "player" ? "You" : "Computer"}:</span>{" "}
              {h.text} <span className="font-medium">{h.answerText}</span>
            </li>
          ))}
          {game.history.length === 0 && <li className="text-stone-500">No questions yet.</li>}
        </ol>
      </Sheet>
      <CardDetail
        character={zoomed ? byId.get(zoomed) : undefined}
        onClose={() => setZoomed(undefined)}
      />
    </div>
  );
}

// Spec 8.2: loading shows the board's shape, so nothing jumps when it arrives.
function SkeletonBoard() {
  return (
    <div className="flex h-dvh flex-col" aria-busy="true" aria-label="Loading">
      <div className="h-14 shrink-0 border-b border-stone-200 bg-white" />
      <div className="grid flex-1 grid-cols-4 gap-1 p-2 pb-16">
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-md bg-stone-200 motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
