export interface HashDrill {
  readonly intent: string | null;
  readonly key: string;
  readonly note: string | null;
  readonly reinforce: readonly string[];
  readonly source: 'starter' | 'structured';
  readonly triggers: readonly string[];
  readonly values: readonly string[];
}

interface ParsedHashLine {
  readonly intent: string | null;
  readonly key: string;
  readonly note: string | null;
  readonly reinforce: readonly string[];
  readonly source: 'starter' | 'structured';
  readonly triggers: readonly string[];
  readonly value: string;
}

const FIELD_ALIASES = {
  intent: ['intent', 'tag', 'label', 'cluster', 'semantic cluster', '意图', '标签', '语义簇'],
  key: ['key', 'hash key', 'hash', 'k', '键'],
  note: ['note', 'notes', 'source', '备注', '来源'],
  reinforce: ['reinforce', 'cue', 'cues', 'feedback', 'index', '强化', '索引', '反馈'],
  triggers: ['trigger', 'triggers', 'context', 'scene', 'when', '触发', '场景'],
  value: ['value', 'values', 'sentence', 'chunk', 'v', '值', '句子', '组块'],
} as const;

export function buildHashDrills(body: string): HashDrill[] {
  const parsedLines = body
    .split(/\n+/)
    .map((line) => parseHashLine(line))
    .filter((line): line is ParsedHashLine => Boolean(line));

  return parsedLines.reduce<HashDrill[]>((drills, line) => {
    const existingIndex = drills.findIndex(
      (drill) => normalizeKeyIdentity(drill.key) === normalizeKeyIdentity(line.key)
    );

    if (existingIndex === -1) {
      return [
        ...drills,
        {
          intent: line.intent,
          key: line.key,
          note: line.note,
          reinforce: line.reinforce,
          source: line.source,
          triggers: line.triggers,
          values: [line.value],
        },
      ];
    }

    const existingDrill = drills[existingIndex];
    const updatedDrill: HashDrill = {
      intent: existingDrill.intent ?? line.intent,
      key: existingDrill.key,
      note: joinUniqueText([existingDrill.note, line.note]),
      reinforce: uniqueValues([...existingDrill.reinforce, ...line.reinforce]),
      source: existingDrill.source === 'structured' || line.source === 'structured' ? 'structured' : 'starter',
      triggers: uniqueValues([...existingDrill.triggers, ...line.triggers]),
      values: uniqueValues([...existingDrill.values, line.value]),
    };

    return drills.map((drill, index) => (index === existingIndex ? updatedDrill : drill));
  }, []);
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

function parseStructuredHashLine(line: string): ParsedHashLine | null {
  const fields = collectFields(line);
  const rawKey = readField(fields, FIELD_ALIASES.key);
  const value = readField(fields, FIELD_ALIASES.value);

  if (!rawKey || !value) {
    return null;
  }

  return {
    intent: readField(fields, FIELD_ALIASES.intent),
    key: normalizeHashKey(rawKey),
    note: readField(fields, FIELD_ALIASES.note),
    reinforce: splitList(readField(fields, FIELD_ALIASES.reinforce)),
    source: 'structured',
    triggers: splitList(readField(fields, FIELD_ALIASES.triggers)),
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
    intent: null,
    key: buildStarterKey(value),
    note: notes.join(' / '),
    reinforce: [],
    source: 'starter',
    triggers: [],
    value,
  };
}

function collectFields(line: string): Map<string, string[]> {
  const fields = new Map<string, string[]>();
  const parts = line.split('|').map((part) => part.trim()).filter(Boolean);

  parts.forEach((part) => {
    const fieldMatch = part.match(/^([^:：]+?)\s*[:：]\s*(.+)$/);

    if (!fieldMatch) {
      return;
    }

    const fieldName = normalizeFieldName(fieldMatch[1] ?? '');
    const fieldValue = normalizeInlineWhitespace(fieldMatch[2] ?? '');

    if (!fieldName || !fieldValue) {
      return;
    }

    fields.set(fieldName, [...(fields.get(fieldName) ?? []), fieldValue]);
  });

  return fields;
}

function readField(fields: Map<string, string[]>, aliases: readonly string[]): string | null {
  for (const alias of aliases) {
    const values = fields.get(normalizeFieldName(alias));

    if (values && values.length > 0) {
      return values.join(' / ');
    }
  }

  return null;
}

function splitList(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return uniqueValues(
    value
      .split(/\s*(?:,|，|;|；|\/)\s*/)
      .map((item) => normalizeInlineWhitespace(item))
      .filter(Boolean)
  );
}

function buildStarterKey(value: string): string {
  const words = value
    .replace(/["“”]/g, '')
    .match(/[A-Za-z]+(?:['’-][A-Za-z]+)?|[!?]+/g) ?? [];
  const starter = words.slice(0, 3).join(' ') || value.slice(0, 12);

  return `[${starter}${words.length > 3 ? '…' : ''}]`;
}

function normalizeHashKey(value: string): string {
  const normalizedValue = normalizeInlineWhitespace(value);

  if (/^\[.+\]$/.test(normalizedValue)) {
    return normalizedValue;
  }

  return `[${normalizedValue}]`;
}

function normalizeKeyIdentity(value: string): string {
  return value.replace(/^\[|\]$/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizeFieldName(value: string): string {
  return normalizeInlineWhitespace(value).toLowerCase();
}

function uniqueValues(values: readonly string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function joinUniqueText(values: readonly (string | null)[]): string | null {
  const uniqueText = uniqueValues(values.filter((value): value is string => Boolean(value)));

  return uniqueText.length > 0 ? uniqueText.join(' / ') : null;
}

function normalizeSentence(line: string): string {
  return normalizeInlineWhitespace(
    line
    .trim()
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .replace(/^#{1,6}\s+/, '')
  );
}

function extractBracketNotes(line: string): string[] {
  return Array.from(line.matchAll(/\(([^()]+)\)|（([^（）]+)）/g), (match) => {
    const note = match[1] ?? match[2] ?? '';

    return normalizeInlineWhitespace(note);
  }).filter(Boolean);
}

function stripBracketNotes(line: string): string {
  return line.replace(/\s*(\([^()]+\)|（[^（）]+）)\s*/g, ' ');
}

function normalizeInlineWhitespace(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;!?])/g, '$1')
    .trim();
}
