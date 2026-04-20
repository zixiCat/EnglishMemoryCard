interface MemoryCardContentProps {
  readonly body: string;
}

export function MemoryCardContent({ body }: MemoryCardContentProps) {
  const lines = body
    .split(/\n+/)
    .map((line) => normalizeSentence(line))
    .filter(Boolean);

  return (
    <div className="space-y-3 text-[17px] leading-7 text-slate-800">
      {lines.map((line, index) => (
        <p
          className="rounded-[18px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
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