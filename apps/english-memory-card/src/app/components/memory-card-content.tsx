interface SentenceLine {
  readonly note: string | null;
  readonly text: string;
}

interface MemoryCardContentProps {
  readonly body: string;
}

export function MemoryCardContent({ body }: MemoryCardContentProps) {
  const lines = body
    .split(/\n+/)
    .map((line) => parseSentenceLine(line))
    .filter((line): line is SentenceLine => Boolean(line));

  return (
    <div className="space-y-3 text-[17px] leading-7 text-slate-800 dark:text-slate-200">
      {lines.map((line, index) => {
        if (line.note) {
          return (
            <details
              className="group rounded-[18px] border-l-2 border-l-amber-200/80 bg-white transition hover:bg-amber-50/60 open:border-l-amber-300 open:bg-amber-100/90 dark:border-l-amber-300/25 dark:bg-slate-700/80 dark:hover:bg-slate-700 dark:open:border-l-amber-300/45 dark:open:bg-amber-300/15"
              key={`${index}-${line.text}-${line.note}`}
            >
              <summary className="cursor-pointer list-none px-4 py-3 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                <span className="block group-open:hidden">{line.text}</span>
                <span className="hidden font-medium text-amber-950 group-open:block dark:text-amber-50">
                  {line.note}
                </span>
              </summary>
            </details>
          );
        }

        return (
          <p
            className="rounded-[18px] bg-white px-4 py-3 dark:bg-slate-700/80"
            key={`${index}-${line.text}`}
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
}

function parseSentenceLine(line: string): SentenceLine | null {
  const normalizedLine = normalizeSentence(line);

  if (!normalizedLine) {
    return null;
  }

  const notes = extractBracketNotes(normalizedLine);

  if (notes.length === 0) {
    return {
      note: null,
      text: normalizedLine,
    };
  }

  const sentenceText = normalizeInlineWhitespace(stripBracketNotes(normalizedLine));

  if (!sentenceText) {
    return {
      note: null,
      text: normalizedLine,
    };
  }

  return {
    note: notes.join(' / '),
    text: sentenceText,
  };
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