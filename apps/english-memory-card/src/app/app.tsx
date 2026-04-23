import { motion } from 'motion/react';

import { MemoryCardFeed, RememberedCardDrawer } from './components/memory-card-feed';
import { noteSections } from './data/generated-notes';
import { buildReviewDeck } from './lib/forgetting-curve';
import { useReviewStore } from './store/use-review-store';

export function App() {
  const hydrated = useReviewStore((state) => state.hydrated);
  const progressById = useReviewStore((state) => state.progressById);
  const rememberedDrawerOpen = useReviewStore((state) => state.rememberedDrawerOpen);
  const setRememberedDrawerOpen = useReviewStore((state) => state.setRememberedDrawerOpen);
  const rememberCard = useReviewStore((state) => state.rememberCard);
  const retryCard = useReviewStore((state) => state.retryCard);

  const cards = buildReviewDeck(noteSections, progressById);
  const dueCards = cards.filter((card) => card.status === 'due');
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
      <main className="mx-auto h-[100svh] w-full max-w-md px-3 py-3">
        {dueCards.length > 0 ? (
          <MemoryCardFeed
            cards={dueCards}
            rememberedCount={rememberedCards.length}
            onOpenRemembered={() => setRememberedDrawerOpen(true)}
            onRemember={rememberCard}
            onRetry={retryCard}
          />
        ) : (
          <section className="flex h-[calc(100svh-1.5rem)] flex-col justify-center rounded-[28px] border border-slate-200/80 bg-[rgba(255,255,255,0.88)] p-5 text-center backdrop-blur dark:border-slate-700/80 dark:bg-[rgba(15,23,42,0.88)]">
            <div className="mx-auto max-w-sm">
              <p className="text-[14px] font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                Session clear
              </p>
              <h1 className="mt-3 text-[32px] font-semibold leading-tight text-slate-900 dark:text-slate-100">
                No cards are due right now.
              </h1>
              <p className="mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-400">
                The cards you marked remembered have moved out of the main queue. Open the remembered drawer to review them again before they are due.
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


