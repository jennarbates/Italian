// Spec 3: checks every JSON file in a content folder against its schema. The Vite
// plugin below runs it, so `pnpm build` fails and `pnpm dev` shows an error overlay
// on bad content.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { contentFiles, type ContentFile } from "../src/content/schemas.ts";

export function validateContentDir(dir: string, { requireAll = true } = {}): string[] {
  const problems: string[] = [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  if (requireAll) {
    for (const file of Object.keys(contentFiles)) {
      if (!files.includes(file)) problems.push(`${file}: missing`);
    }
  }

  for (const file of files) {
    if (!(file in contentFiles)) {
      problems.push(`${file}: no schema for this file; add one to contentFiles in schemas.ts`);
      continue;
    }
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch (error) {
      problems.push(`${file}: not valid JSON (${(error as Error).message})`);
      continue;
    }
    const result = contentFiles[file as ContentFile].safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        problems.push(`${file}: ${formatPath(issue.path)}${issue.message}`);
      }
    }
  }
  return problems;
}

function formatPath(path: PropertyKey[]): string {
  return path.length ? `${path.map(String).join(".")}: ` : "";
}

export const contentDir = new URL("../src/content/", import.meta.url).pathname;

export function contentCheck(dir = contentDir, options?: { requireAll?: boolean }): Plugin {
  const check = () => {
    const problems = validateContentDir(dir, options);
    if (problems.length) throw new Error(`Invalid content:\n  ${problems.join("\n  ")}`);
  };
  return {
    name: "content-check",
    buildStart: check,
    handleHotUpdate({ file }) {
      if (file.startsWith(dir) && file.endsWith(".json")) check();
    },
  };
}
