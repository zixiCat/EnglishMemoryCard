import { buildHashDrills, type HashDrill } from '../lib/hash-drills';

interface MemoryCardContentProps {
  readonly body: string;
}

interface ProtocolStepProps {
  readonly label: string;
  readonly text: string;
}

interface HashDrillCardProps {
  readonly drill: HashDrill;
  readonly index: number;
}

interface CuePanelProps {
  readonly label: string;
  readonly text: string;
}

const DEFAULT_REINFORCERS = [
  'Physical: add one tiny gesture',
  'Visual: picture one clear snapshot',
  'Feedback: imagine the listener reaction',
] as const;

export function MemoryCardContent({ body }: MemoryCardContentProps) {
  const drills = buildHashDrills(body);
  const structuredCount = drills.filter((drill) => drill.source === 'structured').length;

  return (
    <div className="space-y-4 text-[15px] leading-7 text-slate-800 sm:space-y-5 dark:text-slate-200">
      <details className="overflow-hidden rounded-[22px] border border-amber-200/80 bg-amber-50/80 dark:border-amber-300/20 dark:bg-amber-300/10">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-[14px] font-semibold text-amber-900 sm:px-5 dark:text-amber-100 [&::-webkit-details-marker]:hidden">
          <span>Training rules</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-[13px] text-amber-800 shadow-sm dark:bg-slate-950/20 dark:text-amber-100">
            Speak first
          </span>
        </summary>
        <div className="border-t border-amber-200/70 p-4 sm:p-5 dark:border-amber-300/20">
          <h3 className="text-[20px] font-semibold leading-tight text-slate-950 sm:text-[22px] dark:text-white">
            Look at the Key, speak within 0.5s, then reveal the Value.
          </h3>
          <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-5">
            <ProtocolStep label="01" text="Make the Key simple enough to spark a feeling instantly." />
            <ProtocolStep label="02" text="Hide the Value so you are retrieving, not reading." />
            <ProtocolStep label="03" text="Reinforce it with movement, imagery, and listener feedback." />
          </div>
        </div>
        {structuredCount === 0 ? (
          <p className="mx-4 mb-4 rounded-[18px] bg-white/70 px-4 py-3 text-[14px] text-amber-900 sm:mx-5 sm:mb-5 sm:px-5 dark:bg-slate-950/20 dark:text-amber-100">
            Starter mode is active: the app uses the first three English words as a temporary Key. For stronger retrieval, record notes with Key / Value / Trigger fields.
          </p>
        ) : null}
      </details>

      <div className="space-y-5">
        {drills.map((drill, index) => (
          <HashDrillCard drill={drill} index={index} key={`${drill.key}-${index}`} />
        ))}
      </div>
    </div>
  );
}

function ProtocolStep({ label, text }: ProtocolStepProps) {
  return (
    <div className="rounded-[18px] bg-white/75 p-4 shadow-sm sm:p-5 dark:bg-slate-950/20">
      <p className="text-[14px] font-semibold text-amber-700 dark:text-amber-200">{label}</p>
      <p className="mt-2 text-[14px] leading-6 text-slate-700 dark:text-slate-300">{text}</p>
    </div>
  );
}

function HashDrillCard({ drill, index }: HashDrillCardProps) {
  const hasCollisionRisk = drill.values.length > 3;
  const reinforcers = drill.reinforce.length > 0 ? drill.reinforce : DEFAULT_REINFORCERS;
  const triggerText = drill.triggers.length > 0
    ? drill.triggers.join(' / ')
    : 'Add one real scene where this Key should fire.';
  const intentText = drill.intent ?? (
    drill.source === 'starter'
      ? 'Starter-words Key: later replace it with a 0.5s intent label.'
      : 'Intent label not set yet.'
  );

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5 dark:border-slate-700 dark:bg-slate-900/85">
      <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-5">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Key #{index + 1}
          </p>
          <h3 className="mt-1 break-words text-[32px] font-semibold leading-tight text-slate-950 sm:mt-2 sm:text-[28px] dark:text-white">
            {drill.key}
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-[14px] font-semibold text-slate-600 sm:px-5 dark:bg-slate-800 dark:text-slate-300">
          {drill.values.length} Value{drill.values.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-5 md:grid-cols-2">
        <CuePanel label="Intent label" text={intentText} />
        <CuePanel label="Trigger scene" text={triggerText} />
      </div>

      <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:mt-5 sm:p-5 dark:border-slate-700 dark:bg-slate-800/70">
        <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">
          Reinforce this Key with redundant indexes
        </p>
        <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
          {reinforcers.map((cue) => (
            <span
              className="rounded-full bg-white px-3 py-2 text-[14px] font-medium text-slate-600 shadow-sm sm:px-4 dark:bg-slate-900 dark:text-slate-300"
              key={cue}
            >
              {cue}
            </span>
          ))}
        </div>
      </div>

      {hasCollisionRisk ? (
        <p className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] font-medium text-rose-700 sm:mt-5 sm:px-5 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200">
          This Key has more than 3 Values, so it may collide under pressure. Split it into sharper Keys like Short, Logic, or Drama.
        </p>
      ) : null}

      <details className="group mt-4 overflow-hidden rounded-[22px] border border-slate-200 bg-white sm:mt-5 dark:border-slate-700 dark:bg-slate-950/20">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-[15px] font-semibold text-slate-800 focus-visible:outline-none group-open:border-b group-open:border-slate-200 sm:px-5 sm:py-4 dark:text-slate-100 dark:group-open:border-slate-700 [&::-webkit-details-marker]:hidden">
          <span>Spoken? Tap to check the Value</span>
          <span className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-[14px] text-white dark:bg-white dark:text-slate-900">
            Reveal
          </span>
        </summary>
        <div className="space-y-3 p-4 sm:p-5">
          {drill.values.map((value, valueIndex) => (
            <p
              className="rounded-[18px] bg-slate-50 px-4 py-4 text-[17px] font-medium leading-8 text-slate-900 sm:px-5 dark:bg-slate-800 dark:text-slate-100"
              key={`${value}-${valueIndex}`}
            >
              {value}
            </p>
          ))}
          {drill.note ? (
            <p className="rounded-[18px] bg-amber-50 px-4 py-3 text-[14px] text-amber-900 sm:px-5 dark:bg-amber-300/10 dark:text-amber-100">
              {drill.note}
            </p>
          ) : null}
        </div>
      </details>
    </article>
  );
}

function CuePanel({ label, text }: CuePanelProps) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4 dark:border-slate-700 dark:bg-slate-800/70">
      <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-[15px] leading-7 text-slate-700 dark:text-slate-200">{text}</p>
    </div>
  );
}
