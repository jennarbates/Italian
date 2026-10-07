import type { CSSProperties } from "react";

// The board's shape: 4 × 6 on the phone, 6 × 4 on desktop (desktop spec DD4).
// Cards keep their row-major order, so card n keeps its reading position.
export const boardShape = (desktop: boolean) =>
  desktop ? { cols: 6, rows: 4, gap: "0.5rem" } : { cols: 4, rows: 6, gap: "0.25rem" };

// The grid's custom properties and card width, shared with the skeleton board.
// Card width: a column's share of the width, or a row's share of the height
// turned into a width with the 5:6 card shape, whichever is smaller.
export function boardVars(desktop: boolean) {
  const { cols, rows, gap } = boardShape(desktop);
  return {
    "--cols": cols,
    "--rows": rows,
    "--gap": gap,
    "--card-w":
      "min(calc((100cqw - (var(--cols) - 1) * var(--gap)) / var(--cols)), calc((100cqh - (var(--rows) - 1) * var(--gap)) / var(--rows) * 5 / 6))",
  } as CSSProperties;
}
