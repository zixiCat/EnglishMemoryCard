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
  return body
    .split(/\n+/)
    .map((line) => parseHashLine(line))
    .filter((line): line is ParsedHashLine => Boolean(line))
    .map((line) => ({
      key: line.key,
      note: line.note,
      source: line.source,
      values: [line.value],
    }));
}

export function buildHashReviewSections(
  sections: readonly NoteSection[],
): NoteSection[] {
  const cardCountByDate = new Map<string, number>();

  return sections.flatMap((section) => {
    const allDrills = buildHashDrills(section.body);
    const structuredDrills = allDrills.filter(
      (drill) => drill.source === "structured",
    );
    const drills = structuredDrills.length > 0 ? structuredDrills : allDrills;

    return drills.map((drill, index) => {
      const cardNumber = (cardCountByDate.get(section.date) ?? 0) + 1;

      cardCountByDate.set(section.date, cardNumber);

      return {
        ...section,
        id: `${section.date}-${cardNumber}`,
        title: buildReviewTitle(drill),
        body: stringifyHashDrill(drill),
        excerpt: buildReviewExcerpt(drill),
        wordCount: countReviewWords(drill),
      };
    });
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

  const simpleStructuredLine = parseSimpleHashLine(normalizedLine);

  if (simpleStructuredLine) {
    return simpleStructuredLine;
  }

  return parseStarterHashLine(normalizedLine);
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
  const displayKey = stripHashKeyBrackets(drill.key);

  return drill.values
    .map((value) => `- ${displayKey} - ${value}`)
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

function parseSimpleHashLine(line: string): ParsedHashLine | null {
  const simpleHashMatch = line.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  const rawKey = normalizeInlineWhitespace(simpleHashMatch?.[1] ?? "");
  const value = normalizeInlineWhitespace(simpleHashMatch?.[2] ?? "");

  if (!looksLikeSimpleHashKey(rawKey) || !value) {
    return null;
  }

  return {
    key: rawKey,
    note: null,
    source: "structured",
    value,
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

function normalizeFieldName(value: string): string {
  return normalizeInlineWhitespace(value).toLowerCase();
}

function stripHashKeyBrackets(value: string): string {
  return normalizeInlineWhitespace(value).replace(/^\[(.+)\]$/, "$1");
}

function looksLikeSimpleHashKey(value: string): boolean {
  const normalizedValue = normalizeInlineWhitespace(value);
  const tokenCount = normalizedValue.split(/\s+/).filter(Boolean).length;

  return Boolean(
    normalizedValue
    && normalizedValue.length <= 48
    && tokenCount <= 4
    && !/[|:：]/.test(normalizedValue)
    && !/[.?!。！？]/.test(normalizedValue),
  );
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
