// Spec 4: engine/ imports nothing from React, the DOM or time, and gets its
// randomness only from the seed. ESLint enforces the same rules while editing;
// this test makes CI fail even if the lint config changes.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const engineDir = new URL("../src/engine/", import.meta.url).pathname;
const sources = readdirSync(engineDir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

test("engine/ has source files", () => {
  expect(sources.length).toBeGreaterThan(0);
});

describe.each(sources.map((f) => [f] as const))("%s", (file) => {
  const text = readFileSync(`${engineDir}${file}`, "utf8");
  const code = text.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

  test("imports only engine files and content types", () => {
    for (const [, statement, from] of code.matchAll(/^(import[^;]*?) from "([^"]+)";/gms)) {
      const local = from?.startsWith("./");
      const contentTypes = from?.startsWith("../content/") && statement?.startsWith("import type");
      expect(local || contentTypes, `${file}: ${from}`).toBe(true);
    }
  });

  test("uses no DOM, time or unseeded randomness", () => {
    expect(code).not.toMatch(
      /\b(window|document|localStorage|indexedDB|navigator|Date|performance|setTimeout|setInterval|fetch|crypto)\b|Math\.random/,
    );
  });
});
