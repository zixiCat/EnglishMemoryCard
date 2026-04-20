import { Brain, CalendarDays, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

import { MemoryCardFeed } from './components/memory-card-feed';
import { importedNoteSections } from './data/generated-notes';
import {
  buildReviewDeck,
  formatNoteDate,
  formatStageLabel,
  getReviewSummary,
} from './lib/forgetting-curve';
import { useReviewStore } from './store/use-review-store';
import type { NoteSection } from './types';

const noteSections: readonly NoteSection[] = importedNoteSections;

export function App() {
  const activeCardId = useReviewStore((state) => state.activeCardId);
  const hydrated = useReviewStore((state) => state.hydrated);
  const progressById = useReviewStore((state) => state.progressById);
  const rememberCard = useReviewStore((state) => state.rememberCard);
  const retryCard = useReviewStore((state) => state.retryCard);
  const setActiveCard = useReviewStore((state) => state.setActiveCard);

  const cards = buildReviewDeck(noteSections, progressById);
  const summary = getReviewSummary(cards);
  const activeCard = cards.find((card) => card.id === activeCardId) ?? cards[0] ?? null;

  if (!hydrated) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5 py-10">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="memory-glass w-full max-w-sm rounded-[32px] border border-white/80 bg-white/70 p-10 text-center shadow-[0_24px_80px_rgba(20,33,61,0.14)]"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            Preparing review deck
          </p>
          <h1 className="mt-5 text-4xl font-semibold text-slate-900">
            Loading your next memory cards.
          </h1>
        </motion.div>
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5 py-10">
        <div className="memory-glass w-full max-w-md rounded-[32px] border border-white/80 bg-white/75 p-10 shadow-[0_24px_80px_rgba(20,33,61,0.14)]">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            No cards yet
          </p>
          <h1 className="mt-5 text-4xl font-semibold text-slate-900">
            Import Markdown notes to build the feed.
          </h1>
          <p className="mt-5 text-[15px] leading-7 text-slate-600">
            Run <span className="font-semibold text-slate-900">npm run import:cards -- &quot;C:\Users\huangzixi\OneDrive\EnglishMemoryCard&quot;</span>
            {' '}from the workspace root, then refresh the page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[8%] h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-[10%] right-[-12%] h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />
      </div>

      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-30 px-5 pt-5"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="memory-glass pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-5 rounded-full border border-white/80 bg-white/72 px-5 py-3 shadow-[0_18px_50px_rgba(20,33,61,0.12)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
              English Memory Card
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {summary.dueNow} due now, {summary.upcoming} upcoming.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/15">
            <Brain className="h-4 w-4" />
            <span>{activeCard?.dueLabel ?? 'Ready'}</span>
          </div>
        </div>
      </motion.header>

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 px-5">
        <div className="mx-auto flex max-w-md items-center justify-between gap-5 text-[13px] text-slate-600">
          <div className="memory-glass rounded-full border border-white/70 bg-white/60 px-4 py-2">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4" />
              <span>{activeCard ? formatNoteDate(activeCard.date) : 'No active card'}</span>
            </div>
          </div>
          <div className="memory-glass rounded-full border border-white/70 bg-white/60 px-4 py-2">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4" />
              <span>{activeCard ? formatStageLabel(activeCard.stage) : 'Waiting for notes'}</span>
            </div>
          </div>
        </div>
      </div>

      <MemoryCardFeed
        activeCardId={activeCard?.id ?? null}
        cards={cards}
        onActiveCardChange={setActiveCard}
        onRemember={rememberCard}
        onRetry={retryCard}
      />
    </main>
  );
}

export default App;


