import type { Character } from "../../content/schemas.ts";
import { Card } from "./Card.tsx";

type Props = {
  characters: Character[];
  flipped: string[];
  guessing: boolean;
  onTap: (id: string) => void;
  onZoom: (id: string) => void;
  onUnflipAll: () => void;
};

// Spec 8: all 24 faces at once, 4 columns by 6 rows, sized from whichever runs out
// first, the width or the height of the space left, so the board never scrolls.
export function Board({ characters, flipped, guessing, onTap, onZoom, onUnflipAll }: Props) {
  const allDown = characters.length > 0 && characters.every((c) => flipped.includes(c.id));
  return (
    <div className="relative min-h-0 flex-1 px-2 py-1 [container-type:size]">
      <ul
        aria-label="Board"
        className="mx-auto grid h-full w-fit grid-cols-4 content-center justify-center gap-1"
        style={{
          // Card width: a quarter of the width, or a sixth of the height turned into a
          // width with the 5:6 card shape, whichever is smaller.
          ["--card-w" as string]:
            "min(calc((100cqw - 0.75rem) / 4), calc((100cqh - 1.25rem) / 6 * 5 / 6))",
        }}
      >
        {characters.map((c) => (
          <li key={c.id}>
            <Card
              character={c}
              flipped={flipped.includes(c.id)}
              guessing={guessing}
              onTap={() => onTap(c.id)}
              onZoom={() => onZoom(c.id)}
            />
          </li>
        ))}
      </ul>
      {allDown && !guessing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={onUnflipAll}
            className="min-h-11 rounded-full bg-stone-800 px-5 text-white shadow-lg"
          >
            Unflip all
          </button>
        </div>
      )}
    </div>
  );
}
