// Spec 9: initial JS under 250 KB gzipped, Supabase client and Sentry included.
// Reads the built index.html for every script and modulepreload it loads up
// front, gzips each, and fails if the total is over budget.
//
//   pnpm build && pnpm check:bundle
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

export const budgetKb = 250;

export function initialScripts(html: string): string[] {
  const srcs = [
    ...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g),
    ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+\.js)"/g),
  ];
  return [...new Set(srcs.map((m) => m[1] as string))];
}

export function gzippedKb(text: string | Buffer): number {
  return gzipSync(text, { level: 9 }).length / 1024;
}

if (import.meta.main) {
  const dist = new URL("../dist/", import.meta.url);
  const html = readFileSync(new URL("index.html", dist), "utf8");
  const files = initialScripts(html);
  if (files.length === 0)
    throw new Error("No scripts found in dist/index.html; run pnpm build first");
  let total = 0;
  for (const f of files) {
    const kb = gzippedKb(readFileSync(new URL(f.replace(/^\//, ""), dist)));
    total += kb;
    console.log(`${kb.toFixed(1).padStart(7)} KB  ${f}`);
  }
  console.log(`${total.toFixed(1).padStart(7)} KB  initial JS, gzipped (budget ${budgetKb} KB)`);
  if (total > budgetKb) {
    console.error(`Over budget by ${(total - budgetKb).toFixed(1)} KB`);
    process.exit(1);
  }
}
