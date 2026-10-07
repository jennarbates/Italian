import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "vite";
import { afterEach, describe, expect, test } from "vitest";
import { contentCheck, contentDir, validateContentDir } from "./content-check.ts";

const dirs: string[] = [];
function contentFolder(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "content-"));
  dirs.push(dir);
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("validateContentDir", () => {
  test("the real content folder is valid", () => {
    expect(validateContentDir(contentDir)).toEqual([]);
  });

  test("valid files pass", () => {
    const dir = contentFolder({
      "version.json": '{ "contentVersion": 1 }',
      "templates.json":
        '[{ "id": "t.have", "pattern": "Ha {art} {noun}?", "verb": "v.ha", "article": "def", "needsAdj": false, "predicate": "hasFeature" }]',
    });
    expect(validateContentDir(dir)).toEqual([]);
  });

  test("names the file and the path of each problem", () => {
    const dir = contentFolder({
      "templates.json":
        '[{ "id": "t.have", "pattern": "Ha {art} {noun}?", "verb": "v.sono", "article": "def", "needsAdj": false, "predicate": "hasFeature" }]',
    });
    const problems = validateContentDir(dir);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^templates\.json: 0\.verb: /);
  });

  test("broken JSON", () => {
    const dir = contentFolder({ "lexicon.json": "[{,]" });
    expect(validateContentDir(dir)[0]).toMatch(/^lexicon\.json: not valid JSON/);
  });

  test("a JSON file with no schema", () => {
    const dir = contentFolder({ "characters2.json": "[]" });
    expect(validateContentDir(dir)[0]).toMatch(/^characters2\.json: no schema/);
  });

  test("ignores files that are not JSON", () => {
    const dir = contentFolder({ "notes.md": "anything" });
    expect(validateContentDir(dir)).toEqual([]);
  });
});

describe("the build fails on invalid content", () => {
  test("vite build throws with the problem in the message", async () => {
    const dir = contentFolder({ "version.json": '{ "contentVersion": "one" }' });
    await expect(
      build({
        configFile: false,
        logLevel: "silent",
        root: contentFolder({ "index.html": "<!doctype html><title>x</title>" }),
        plugins: [contentCheck(dir)],
        build: { write: false },
      }),
    ).rejects.toThrow(/version\.json: contentVersion: /);
  });

  test("vite build passes on valid content", async () => {
    const dir = contentFolder({ "version.json": '{ "contentVersion": 1 }' });
    await expect(
      build({
        configFile: false,
        logLevel: "silent",
        root: contentFolder({ "index.html": "<!doctype html><title>x</title>" }),
        plugins: [contentCheck(dir)],
        build: { write: false },
      }),
    ).resolves.toBeDefined();
  });
});
