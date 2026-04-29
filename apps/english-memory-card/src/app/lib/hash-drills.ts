import type { NoteSection } from "../types";

export interface HashDrill {
  readonly key: string;
  readonly note: string | null;
  readonly source: "starter" | "structured";
  readonly values: readonly string[];
}

interface ParsedHashLine {
  readonly key: string;
  readonly note: string | null;
  readonly source: "starter" | "structured";
  readonly value: string;
}

const FIELD_ALIASES = {
  key: ["key", "hash key", "hash", "k", "键"],
  note: ["note", "notes", "source", "备注", "来源"],
  value: ["value", "values", "sentence", "chunk", "v", "值", "句子", "组块"],
} as const;

export function buildHashDrills(body: string): HashDrill[] {
  const parsedLines = body
    .split(/\n+/)
    .map((line) => parseHashLine(line))
    .filter((line): line is ParsedHashLine => Boolean(line));

  return parsedLines.reduce<HashDrill[]>((drills, line) => {
    const existingIndex = drills.findIndex(
      (drill) =>
        normalizeKeyIdentity(drill.key) === normalizeKeyIdentity(line.key),
    );

    if (existingIndex === -1) {
      return [
        ...drills,
        {
          key: line.key,
          note: line.note,
          source: line.source,
          values: [line.value],
        },
      ];
    }

    const existingDrill = drills[existingIndex];
    const updatedDrill: HashDrill = {
      key: existingDrill.key,
      note: joinUniqueText([existingDrill.note, line.note]),
      source:
        existingDrill.source === "structured" || line.source === "structured"
          ? "structured"
          : "starter",
      values: uniqueValues([...existingDrill.values, line.value]),
    };

    return drills.map((drill, index) =>
      index === existingIndex ? updatedDrill : drill,
    );
  }, []);
}

export function buildHashReviewSections(
  sections: readonly NoteSection[],
): NoteSection[] {
  return sections.flatMap((section) => {
    const allDrills = buildHashDrills(section.body);
    const structuredDrills = allDrills.filter(
      (drill) => drill.source === "structured",
    );
    const drills = structuredDrills.length > 0 ? structuredDrills : allDrills;

    return drills.map((drill, index) => ({
      ...section,
      id: buildReviewSectionId(section.id, drill.key, index),
      title: buildReviewTitle(drill),
      body: stringifyHashDrill(drill),
      excerpt: buildReviewExcerpt(drill),
      wordCount: countReviewWords(drill),
    }));
  });
}

function parseHashLine(line: string): ParsedHashLine | null {
  const normalizedLine = normalizeSentence(line);

  if (!normalizedLine) {
    return null;
  }

  const structuredLine = parseStructuredHashLine(normalizedLine);

  if (structuredLine) {
    return structuredLine;
  }

  return parseStarterHashLine(normalizedLine);
}

function buildReviewSectionId(
  sectionId: string,
  key: string,
  index: number,
): string {
  const normalizedKey = normalizeKeyIdentity(key)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${sectionId}-${normalizedKey || "drill"}-${index + 1}`;
}

function buildReviewTitle(drill: HashDrill): string {
  return drill.key;
}

function buildReviewExcerpt(drill: HashDrill): string {
  const firstValue = drill.values[0] ?? drill.key;

  return normalizeInlineWhitespace(firstValue).slice(0, 140);
}

function countReviewWords(drill: HashDrill): number {
  return drill.values.join(" ").split(/\s+/).filter(Boolean).length;
}

function stringifyHashDrill(drill: HashDrill): string {
  return drill.values
    .map((value) => `- Key: ${drill.key} | Value: ${value}`)
    .join("\n");
}

function parseStructuredHashLine(line: string): ParsedHashLine | null {
  const fields = collectFields(line);
  const rawKey = readField(fields, FIELD_ALIASES.key);
  const value = readField(fields, FIELD_ALIASES.value);

  if (!rawKey || !value) {
    return null;
  }

  return {
    key: normalizeHashKey(rawKey),
    note: readField(fields, FIELD_ALIASES.note),
    source: "structured",
    value: normalizeInlineWhitespace(value),
  };
}

function parseStarterHashLine(line: string): ParsedHashLine | null {
  const notes = extractBracketNotes(line);
  const value = normalizeInlineWhitespace(stripBracketNotes(line));

  if (!value) {
    return null;
  }

  return {
    key: buildStarterKey(value),
    note: notes.join(" / "),
    source: "starter",
    value,
  };
}

function collectFields(line: string): Map<string, string[]> {
  const fields = new Map<string, string[]>();
  const parts = line
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  parts.forEach((part) => {
    const fieldMatch = part.match(/^([^:：]+?)\s*[:：]\s*(.+)$/);

    if (!fieldMatch) {
      return;
    }

    const fieldName = normalizeFieldName(fieldMatch[1] ?? "");
    const fieldValue = normalizeInlineWhitespace(fieldMatch[2] ?? "");

    if (!fieldName || !fieldValue) {
      return;
    }

    fields.set(fieldName, [...(fields.get(fieldName) ?? []), fieldValue]);
  });

  return fields;
}

function readField(
  fields: Map<string, string[]>,
  aliases: readonly string[],
): string | null {
  for (const alias of aliases) {
    const values = fields.get(normalizeFieldName(alias));

    if (values && values.length > 0) {
      return values.join(" / ");
    }
  }

  return null;
}

function buildStarterKey(value: string): string {
  const words =
    value.replace(/["“”]/g, "").match(/[A-Za-z]+(?:['’-][A-Za-z]+)?|[!?]+/g) ??
    [];
  const starter = words.slice(0, 3).join(" ") || value.slice(0, 12);

  return `[${starter}${words.length > 3 ? "…" : ""}]`;
}

function normalizeHashKey(value: string): string {
  const normalizedValue = normalizeInlineWhitespace(value);

  if (/^\[.+\]$/.test(normalizedValue)) {
    return normalizedValue;
  }

  return `[${normalizedValue}]`;
}

function normalizeKeyIdentity(value: string): string {
  return value
    .replace(/^\[|\]$/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFieldName(value: string): string {
  return normalizeInlineWhitespace(value).toLowerCase();
}

function uniqueValues(values: readonly string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function joinUniqueText(values: readonly (string | null)[]): string | null {
  const uniqueText = uniqueValues(
    values.filter((value): value is string => Boolean(value)),
  );

  return uniqueText.length > 0 ? uniqueText.join(" / ") : null;
}

function normalizeSentence(line: string): string {
  return normalizeInlineWhitespace(
    line
      .trim()
      .replace(/^[-*]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .replace(/^#{1,6}\s+/, ""),
  );
}

function extractBracketNotes(line: string): string[] {
  return Array.from(line.matchAll(/\(([^()]+)\)|（([^（）]+)）/g), (match) => {
    const note = match[1] ?? match[2] ?? "";

    return normalizeInlineWhitespace(note);
  }).filter(Boolean);
}

function stripBracketNotes(line: string): string {
  return line.replace(/\s*(\([^()]+\)|（[^（）]+）)\s*/g, " ");
}

function normalizeInlineWhitespace(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
}
