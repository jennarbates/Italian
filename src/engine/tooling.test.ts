import fc from "fast-check";
import { describe, expect, it } from "vitest";

// Placeholder so `pnpm test` has something to run until the engine cards land.
// Delete once src/engine/ has real tests.
describe("test tooling", () => {
  it("runs fast-check properties", () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (xs) => {
        expect([...xs].reverse().reverse()).toEqual(xs);
      }),
    );
  });
});
