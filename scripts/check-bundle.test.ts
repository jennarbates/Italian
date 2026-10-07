import { expect, test } from "vitest";
import { gzippedKb, initialScripts } from "./check-bundle.ts";

test("finds module scripts and modulepreloads, once each", () => {
  const html = `<script type="module" crossorigin src="/assets/index-abc.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/vendor-def.js">
    <link rel="stylesheet" href="/assets/index.css">
    <script type="module" src="/assets/index-abc.js"></script>`;
  expect(initialScripts(html)).toEqual(["/assets/index-abc.js", "/assets/vendor-def.js"]);
});

test("gzippedKb compresses", () => {
  const text = "a".repeat(100_000);
  expect(gzippedKb(text)).toBeLessThan(1);
});
