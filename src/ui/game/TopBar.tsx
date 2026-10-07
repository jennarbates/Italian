import type { Character } from "../../content/schemas.ts";
import type { GameState } from "../../engine/index.ts";
import { Face } from "../Face.tsx";

const whoseTurn: Record<GameState["phase"], string> = {
  setup: "",
  playerTurn: "Your turn",
  playerReview: "Your turn",
  cpuTurn: "Computer's turn",
  cpuReview: "Computer's turn",
  over: "Round over",
};

// Spec 8.1: turn, whose turn, and the player's own secret card, always visible.
export function TopBar({
  game,
  secret,
  menu,
}: {
  game: GameState;
  secret: Character;
  menu?: React.ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-stone-200 bg-white px-3">
      <div className="leading-tight">
        <p className="text-xs text-stone-600">Turn {game.turn}</p>
        <p className="font-semibold" aria-live="polite">
          {whoseTurn[game.phase]}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <figure className="flex items-center gap-1.5">
          <figcaption className="text-right text-xs leading-tight text-stone-600">
            You are
            <br />
            <span className="font-medium text-stone-900">{secret.name}</span>
          </figcaption>
          <Face
            character={secret}
            label={`Your card: ${secret.name}`}
            className="h-11 rounded ring-1 ring-stone-300"
          />
        </figure>
        {menu}
      </div>
    </header>
  );
}
