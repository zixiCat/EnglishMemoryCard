import { motion } from 'motion/react';

import { MemoryCardFeed } from './components/memory-card-feed';
import { noteSections } from './data/generated-notes';
import { buildReviewDeck } from './lib/forgetting-curve';
import { useReviewStore } from './store/use-review-store';

export function App() {
  const hydrated = useReviewStore((state) => state.hydrated);
  const progressById = useReviewStore((state) => state.progressById);
  const rememberCard = useReviewStore((state) => state.rememberCard);
  const retryCard = useReviewStore((state) => state.retryCard);

  const cards = buildReviewDeck(noteSections, progressById);

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-[100svh] w-full max-w-md items-center justify-center px-4 py-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[24px] border border-slate-200 bg-white p-6 text-center shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <h1 className="text-2xl font-semibold text-slate-900">
            Loading your notes.
          </h1>
        </motion.div>
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="mx-auto flex min-h-[100svh] w-full max-w-md items-center justify-center px-4 py-6">
        <div className="w-full rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
          <h1 className="text-2xl font-semibold text-slate-900">
            No notes found yet.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-600">
            Add a dated <span className="font-semibold text-slate-900">##</span> or <span className="font-semibold text-slate-900">###</span> heading in <span className="font-semibold text-slate-900">apps/english-memory-card/src/app/data/*.md</span>, then refresh the page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto h-[100svh] w-full max-w-md px-3 py-3">
      <MemoryCardFeed
        cards={cards}
        onRemember={rememberCard}
        onRetry={retryCard}
      />
    </main>
  );
}

export default App;


