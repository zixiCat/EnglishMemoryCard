import { BrainCircuit, Gauge, Layers3 } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

import { MemoryCardFeed, RememberedCardDrawer } from './components/memory-card-feed';
import { noteSections } from './data/generated-notes';
import { buildReviewDeck } from './lib/forgetting-curve';
import { useReviewStore } from './store/use-review-store';
import type { ReviewCard } from './types';

export function App() {
  const hydrated = useReviewStore((state) => state.hydrated);
  const progressById = useReviewStore((state) => state.progressById);
  const rememberedDrawerOpen = useReviewStore((state) => state.rememberedDrawerOpen);
  const setRememberedDrawerOpen = useReviewStore((state) => state.setRememberedDrawerOpen);
  const rememberCard = useReviewStore((state) => state.rememberCard);
  const retryCard = useReviewStore((state) => state.retryCard);

  const cards = buildReviewDeck(noteSections, progressById);
  const dueCards = cards.filter((card) => card.status === 'due').sort(prioritizeStructuredCards);
  const rememberedCards = cards.filter(
    (card) => card.status === 'upcoming' && card.lastReviewedAt !== null
  );

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-[100svh] w-full max-w-md items-center justify-center px-4 py-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[24px] border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Loading your notes.
          </h1>
        </motion.div>
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="mx-auto flex min-h-[100svh] w-full max-w-md items-center justify-center px-4 py-6">
        <div className="w-full rounded-[24px] border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            No notes found yet.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-400">
            Add a dated <span className="font-semibold text-slate-900 dark:text-slate-100">##</span> or <span className="font-semibold text-slate-900 dark:text-slate-100">###</span> heading in <span className="font-semibold text-slate-900 dark:text-slate-100">apps/english-memory-card/src/app/data/*.md</span>, then refresh the page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-3 py-3 sm:px-5 sm:py-5">
        <HashTrainingHeader
          dueCount={dueCards.length}
          rememberedCount={rememberedCards.length}
          totalCount={cards.length}
        />

        {dueCards.length > 0 ? (
          <MemoryCardFeed
            cards={dueCards}
            rememberedCount={rememberedCards.length}
            onOpenRemembered={() => setRememberedDrawerOpen(true)}
            onRemember={rememberCard}
            onRetry={retryCard}
          />
        ) : (
          <section className="mt-3 flex min-h-[420px] flex-col justify-center rounded-[28px] border border-slate-200/80 bg-[rgba(255,255,255,0.88)] p-5 text-center backdrop-blur sm:mt-5 sm:min-h-[520px] sm:rounded-[32px] dark:border-slate-700/80 dark:bg-[rgba(15,23,42,0.88)]">
            <div className="mx-auto max-w-sm">
              <p className="text-[14px] font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                Session clear
              </p>
              <h1 className="mt-3 text-[32px] font-semibold leading-tight text-slate-900 dark:text-slate-100">
                No hash cards are due right now.
              </h1>
              <p className="mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-400">
                Cards you passed with a 0.5s retrieval will return to the main queue on the forgetting curve. You can also open remembered cards for an early review.
              </p>
              <button
                className="memory-glass mt-5 inline-flex items-center justify-center rounded-full border border-slate-200/80 bg-white/80 px-5 py-3 text-[15px] font-semibold text-slate-800 transition hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-600"
                onClick={() => setRememberedDrawerOpen(true)}
                type="button"
              >
                Open remembered cards ({rememberedCards.length})
              </button>
            </div>
          </section>
        )}
      </main>

      <RememberedCardDrawer
        cards={rememberedCards}
        onClose={() => setRememberedDrawerOpen(false)}
        open={rememberedDrawerOpen}
      />
    </>
  );
}

export default App;

interface HashTrainingHeaderProps {
  readonly dueCount: number;
  readonly rememberedCount: number;
  readonly totalCount: number;
}

function HashTrainingHeader({
  dueCount,
  rememberedCount,
  totalCount,
}: HashTrainingHeaderProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-slate-200/80 bg-[rgba(255,255,255,0.92)] p-4 shadow-sm backdrop-blur sm:rounded-[32px] sm:p-5 dark:border-slate-700/80 dark:bg-[rgba(15,23,42,0.9)]"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:gap-5">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-amber-700 sm:text-[14px] sm:tracking-[0.24em] dark:text-amber-300">
            Hash Retrieval Lab
          </p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight text-slate-950 sm:mt-3 sm:text-[34px] dark:text-white">
            Look at the Key. Say the chunk in 0.5s.
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600 sm:mt-4 sm:text-[16px] sm:leading-8 dark:text-slate-300">
            Train semantic-cluster retrieval by reinforcing each Key with physical cues, visual cues, and imagined listener feedback.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1 lg:gap-5">
          <HeaderMetric icon={<BrainCircuit className="h-4 w-4" />} label="Key" text="0.5s" />
          <HeaderMetric icon={<Gauge className="h-4 w-4" />} label="Due" text={`${dueCount}`} />
          <HeaderMetric icon={<Layers3 className="h-4 w-4" />} label="Total" text={`${totalCount}`} />
        </div>
      </div>

      <details className="mt-4 overflow-hidden rounded-[22px] bg-slate-50/90 dark:bg-slate-800/70">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 py-3 text-[14px] font-semibold text-slate-700 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
          <span>Training rules</span>
          <span className="rounded-full bg-white px-3 py-1 text-[13px] text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
            {rememberedCount} remembered
          </span>
        </summary>
        <div className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-700">
          <p className="text-[14px] leading-7 text-slate-600 dark:text-slate-300">
            The best Key is the simplest English cue that triggers an association within 0.5s.
          </p>
          <p className="text-[14px] leading-7 text-slate-600 dark:text-slate-300">
            Look only at the Key. If it does not come out, tap Missed / Rewire. If it does, tap 0.5s Hit.
          </p>
        </div>
      </details>
    </motion.section>
  );
}

interface HeaderMetricProps {
  readonly icon: ReactNode;
  readonly label: string;
  readonly text: string;
}

function HeaderMetric({ icon, label, text }: HeaderMetricProps) {
  return (
    <div className="rounded-[20px] bg-slate-50 p-3 dark:bg-slate-800/70 sm:p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 dark:text-slate-400 sm:gap-3 sm:text-[14px]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-[16px] font-semibold leading-7 text-slate-900 dark:text-slate-100 sm:mt-2 sm:text-[15px] sm:font-normal">
        {text}
      </p>
    </div>
  );
}

function prioritizeStructuredCards(left: ReviewCard, right: ReviewCard): number {
  const leftPriority = hasStructuredHashSyntax(left) ? 0 : 1;
  const rightPriority = hasStructuredHashSyntax(right) ? 0 : 1;

  return leftPriority - rightPriority;
}

function hasStructuredHashSyntax(card: ReviewCard): boolean {
  return /(?:^|\n)\s*[-*]?\s*Key\s*[:：].*\|\s*Value\s*[:：]/i.test(card.body);
}


