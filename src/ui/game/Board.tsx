import { useId, useRef } from "react";
import type { Character } from "../../content/schemas.ts";
import { boardVars } from "./boardLayout.ts";
import { Card } from "./Card.tsx";
import { CardPreview } from "./CardPreview.tsx";
import { useHoverPreview } from "./useHoverPreview.ts";

type Props = {
  characters: Character[];
  flipped: string[];
  guessing: boolean;
  onTap: (id: string) => void;
  onZoom: (id: string) => void;
  onUnflipAll: () => void;
  desktop?: boolean;
  hoverPreview?: boolean; // desktop spec DS 7.2: lg, a fine pointer that hovers, not guessing
};

// Spec 8: all 24 faces at once, sized from whichever runs out first, the width or
// the height of the space left, so the board never scrolls.
export function Board({
  characters,
  flipped,
  guessing,
  onTap,
  onZoom,
  onUnflipAll,
  desktop = false,
  hoverPreview = false,
}: Props) {
  const allDown = characters.length > 0 && characters.every((c) => flipped.includes(c.id));
  const area = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  const { preview, handlers } = useHoverPreview(hoverPreview, area);
  const previewed = preview && characters.find((c) => c.id === preview.id);
  return (
    <div
      ref={area}
      className={`relative min-h-0 flex-1 [container-type:size] ${desktop ? "p-6" : "px-2 py-1"}`}
    >
      <ul
        aria-label="Board"
        className="mx-auto grid h-full w-fit grid-cols-[repeat(var(--cols),auto)] content-center justify-center gap-[var(--gap)]"
        style={boardVars(desktop)}
      >
        {characters.map((c) => (
          <li key={c.id} {...handlers(c.id)}>
            <Card
              describedBy={preview?.id === c.id ? tooltipId : undefined}
              character={c}
              flipped={flipped.includes(c.id)}
              guessing={guessing}
              onTap={() => onTap(c.id)}
              onZoom={() => onZoom(c.id)}
            />
          </li>
        ))}
      </ul>
      {preview && previewed && (
        <CardPreview id={tooltipId} character={previewed} spot={preview.spot} />
      )}
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
