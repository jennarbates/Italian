// The game's content, typed. Every file is checked against its schema when the app
// builds (scripts/content-check.ts), so the casts here are safe.
import charactersJson from "./characters.json";
import lexiconJson from "./lexicon.json";
import messagesJson from "./messages.json";
import releasedIdsJson from "./released-ids.json";
import type { Character, LexiconEntry, Messages, Template } from "./schemas.ts";
import templatesJson from "./templates.json";
import versionJson from "./version.json";

export type Content = {
  characters: Character[];
  lexicon: LexiconEntry[];
  templates: Template[];
  messages: Messages;
};

export const content: Content = {
  characters: charactersJson as Character[],
  lexicon: lexiconJson as LexiconEntry[],
  templates: templatesJson as Template[],
  messages: messagesJson as Messages,
};

export const contentVersion: number = versionJson.contentVersion;
export const releasedIds: string[] = releasedIdsJson;

// Spec 3.6: the permanent ids that history refers to.
export function allIds(c: Content): string[] {
  return [
    ...c.characters.map((x) => x.id),
    ...c.lexicon.map((x) => x.id),
    ...c.templates.map((x) => x.id),
  ];
}

export function missingReleasedIds(released: string[], c: Content): string[] {
  const current = new Set(allIds(c));
  return released.filter((id) => !current.has(id));
}
