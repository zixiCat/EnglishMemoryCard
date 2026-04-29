import { buildHashDrills, type HashDrill } from "../lib/hash-drills";

interface MemoryCardContentProps {
  readonly body: string;
}

interface HashDrillCardProps {
  readonly drill: HashDrill;
}

export function MemoryCardContent({ body }: MemoryCardContentProps) {
  const drills = buildHashDrills(body);

  return (
    <div className="space-y-3 text-[15px] leading-7 text-slate-800 dark:text-slate-200">
      {drills.map((drill, index) => (
        <HashDrillCard drill={drill} key={`${drill.key}-${index}`} />
      ))}
    </div>
  );
}

function HashDrillCard({ drill }: HashDrillCardProps) {
  const hasCollisionRisk = drill.values.length > 3;

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(12rem,0.65fr)_minmax(0,1.35fr)]">
      <div className="min-w-0 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="break-words text-[18px] font-semibold leading-7 text-slate-950 dark:text-white">
            {drill.key}
          </h3>
          {drill.values.length > 1 ? (
            <span className="rounded-full bg-white px-3 py-1 text-[14px] font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              {drill.values.length}
            </span>
          ) : null}
        </div>
        {hasCollisionRisk ? (
          <p className="mt-2 text-[14px] font-medium text-rose-600 dark:text-rose-200">
            Split key
          </p>
        ) : null}
      </div>

      <details className="group min-w-0 overflow-hidden rounded-[18px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950/20">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[15px] font-semibold text-slate-800 focus-visible:outline-none group-open:border-b group-open:border-slate-200 dark:text-slate-100 dark:group-open:border-slate-700 [&::-webkit-details-marker]:hidden">
          <span>Value</span>
          <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-[14px] text-white dark:bg-white dark:text-slate-900">
            Reveal
          </span>
        </summary>
        <div className="space-y-2 p-3">
          {drill.values.map((value, valueIndex) => (
            <p
              className="rounded-[14px] bg-slate-50 px-3 py-2 text-[15px] font-medium leading-7 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
              key={`${value}-${valueIndex}`}
            >
              {value}
            </p>
          ))}
          {drill.note ? (
            <p className="rounded-[14px] bg-amber-50 px-3 py-2 text-[14px] text-amber-900 dark:bg-amber-300/10 dark:text-amber-100">
              {drill.note}
            </p>
          ) : null}
        </div>
      </details>
    </div>
  );
}
