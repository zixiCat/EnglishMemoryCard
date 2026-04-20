import { Brain } from 'lucide-react';
import { motion } from 'motion/react';

import { MemoryCardFeed } from './components/memory-card-feed';
import { importedNoteSections } from './data/generated-notes';
import {
  buildReviewDeck,
  getReviewSummary,
} from './lib/forgetting-curve';
import { useReviewStore } from './store/use-review-store';
import type { NoteSection } from './types';

const noteSections: readonly NoteSection[] = importedNoteSections;

export function App() {
  const activeCardId = useReviewStore((state) => state.activeCardId);
  const hydrated = useReviewStore((state) => state.hydrated);
  const progressById = useReviewStore((state) => state.progressById);
  const reviewedCardIds = useReviewStore((state) => state.sessionReviewedIds);
  const markCardReviewed = useReviewStore((state) => state.markCardReviewed);
  const rememberCard = useReviewStore((state) => state.rememberCard);
  const retryCard = useReviewStore((state) => state.retryCard);
  const setActiveCard = useReviewStore((state) => state.setActiveCard);

  const cards = buildReviewDeck(noteSections, progressById);
  const summary = getReviewSummary(cards);
  const activeCard = cards.find((card) => card.id === activeCardId) ?? cards[0] ?? null;

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-[100svh] w-full max-w-md items-center justify-center px-5 py-10">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
            Preparing review deck
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            Loading your next memory cards.
          </h1>
        </motion.div>
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="mx-auto flex min-h-[100svh] w-full max-w-md items-center justify-center px-5 py-10">
        <div className="w-full rounded-[24px] border border-slate-200 bg-white p-8 shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
            No cards yet
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            Import Markdown notes to build the feed.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-600">
            Run <span className="font-semibold text-slate-900">npm run import:cards -- &quot;C:\Users\huangzixi\OneDrive\EnglishMemoryCard&quot;</span>
            {' '}from the workspace root, then refresh the page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[100svh] w-full max-w-md px-5 py-5 sm:py-6">
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
        initial={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between gap-4 px-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              English Memory Card
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {summary.dueNow} due now, {summary.upcoming} upcoming
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <Brain className="h-4 w-4" />
            <span>{activeCard?.dueLabel ?? 'Ready'}</span>
          </div>
        </div>
      </motion.header>

      <MemoryCardFeed
        activeCardId={activeCard?.id ?? null}
        cards={cards}
        onActiveCardChange={setActiveCard}
        onCardReviewed={markCardReviewed}
        onRemember={rememberCard}
        reviewedCardIds={reviewedCardIds}
        onRetry={retryCard}
      />
    </main>
  );
}

export default App;


