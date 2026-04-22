interface MemoryCardContentProps {
  readonly body: string;
}

export function MemoryCardContent({ body }: MemoryCardContentProps) {
  const lines = body
    .split(/\n+/)
    .map((line) => normalizeSentence(line))
    .filter(Boolean);

  return (
    <div className="space-y-3 text-[17px] leading-7 text-slate-800 dark:text-slate-200">
      {lines.map((line, index) => (
        <p
          className="rounded-[18px] bg-white px-4 py-3 dark:bg-slate-700/80"
          key={`${index}-${line}`}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function normalizeSentence(line: string): string {
  return line
    .trim()
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .replace(/^#{1,6}\s+/, '')
    .replace(/\s+/g, ' ');
}