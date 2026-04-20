interface MemoryCardContentProps {
  readonly body: string;
}

export function MemoryCardContent({ body }: MemoryCardContentProps) {
  const blocks = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5 text-[15px] leading-7 text-slate-700">
      {blocks.map((block, index) => {
        const lines = block
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length === 0) {
          return null;
        }

        if (lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul className="space-y-3 pl-5" key={`${index}-${lines[0]}`}>
              {lines.map((line) => (
                <li className="list-disc marker:text-amber-500" key={line}>
                  {line.replace(/^[-*]\s+/, '')}
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((line) => /^\d+\.\s+/.test(line))) {
          return (
            <ol className="space-y-3 pl-5" key={`${index}-${lines[0]}`}>
              {lines.map((line) => (
                <li className="list-decimal marker:text-amber-500" key={line}>
                  {line.replace(/^\d+\.\s+/, '')}
                </li>
              ))}
            </ol>
          );
        }

        if (lines.length === 1 && /^#{3,}\s+/.test(lines[0])) {
          return (
            <h3 className="text-2xl font-semibold text-slate-900" key={`${index}-${lines[0]}`}>
              {lines[0].replace(/^#{3,}\s+/, '')}
            </h3>
          );
        }

        return (
          <p className="whitespace-pre-line" key={`${index}-${lines[0]}`}>
            {lines.map((line) => line.replace(/^#{3,}\s+/, '')).join('\n')}
          </p>
        );
      })}
    </div>
  );
}