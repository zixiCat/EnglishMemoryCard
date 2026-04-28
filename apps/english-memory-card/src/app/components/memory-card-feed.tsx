import { CalendarDays, Clock3, LibraryBig, RefreshCcw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import {
  formatDueDate,
  formatLastReviewedAt,
  formatNoteDate,
} from '../lib/forgetting-curve';
import type { ReviewCard } from '../types';
import { MemoryCardContent } from './memory-card-content';

interface MemoryCardFeedProps {
  readonly cards: readonly ReviewCard[];
  readonly rememberedCount: number;
  readonly onOpenRemembered: () => void;
  readonly onRemember: (id: string) => void;
  readonly onRetry: (id: string) => void;
}

export function MemoryCardFeed({
  cards,
  rememberedCount,
  onOpenRemembered,
  onRemember,
  onRetry,
}: MemoryCardFeedProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="memory-feed mt-3 overflow-visible pb-24 sm:mt-5 sm:max-h-[calc(100svh-18rem)] sm:min-h-[520px] sm:snap-y sm:snap-mandatory sm:overflow-y-auto sm:pb-5">
      <div className="space-y-5">
        {cards.map((card) => (
          <motion.article
            animate={{ opacity: 1 }}
            className="flex snap-start flex-col rounded-[28px] border border-slate-200/80 bg-[rgba(255,255,255,0.94)] p-3 backdrop-blur sm:min-h-[520px] sm:rounded-[32px] sm:p-5 dark:border-slate-700/80 dark:bg-[rgba(15,23,42,0.9)]"
            initial={{ opacity: 0 }}
            key={card.id}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[14px] font-medium text-amber-700 dark:text-amber-300">
                  <CalendarDays className="h-4 w-4" />
                  <span>Recorded {formatNoteDate(card.date)}</span>
                </p>
                <h2 className="mt-2 text-[24px] font-semibold leading-tight text-slate-900 sm:text-[28px] dark:text-slate-100">
                  {getDisplayTitle(card)}
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-slate-500 sm:text-[15px] sm:leading-7 dark:text-slate-400">
                  Key-first drill · {card.statusLabel}
                </p>
              </div>

              <button
                className="memory-glass flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-5 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-300 sm:w-auto dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600"
                onClick={onOpenRemembered}
                type="button"
              >
                <LibraryBig className="h-4 w-4" />
                <span>{rememberedCount} remembered</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-visible rounded-[24px] bg-slate-50/80 p-3 sm:overflow-hidden sm:rounded-[28px] sm:p-5 dark:bg-slate-800/60">
              <div className="memory-scroll sm:h-full sm:overflow-y-auto sm:pr-1">
                <MemoryCardContent body={card.body} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-5 text-[14px] text-slate-500 sm:mt-5 dark:text-slate-400">
              <span>{card.dueLabel}</span>
              <span>Next hash review: {card.nextIntervalLabel}</span>
            </div>

            <div className="sticky bottom-3 z-10 mt-4 grid grid-cols-2 gap-3 rounded-[24px] border border-slate-200/70 bg-white/88 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur sm:static sm:mt-5 sm:gap-5 sm:border-0 sm:bg-transparent sm:p-0 sm:pb-0 sm:shadow-none sm:backdrop-blur-none dark:border-slate-700/70 dark:bg-slate-900/85 sm:dark:bg-transparent">
              <button
                className="flex min-h-14 items-center justify-center gap-2 rounded-[20px] border border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400 sm:px-5 sm:text-[15px] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500"
                onClick={() => onRetry(card.id)}
                type="button"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Missed / Rewire</span>
              </button>
              <button
                className="flex min-h-14 items-center justify-center gap-2 rounded-[20px] bg-slate-900 px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-800 sm:px-5 sm:text-[15px] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                onClick={() => onRemember(card.id)}
                type="button"
              >
                <Clock3 className="h-4 w-4" />
                <span>0.5s Hit</span>
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

interface RememberedCardDrawerProps {
  readonly cards: readonly ReviewCard[];
  readonly onClose: () => void;
  readonly open: boolean;
}

export function RememberedCardDrawer({
  cards,
  onClose,
  open,
}: RememberedCardDrawerProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close remembered cards"
            className="absolute inset-0 bg-slate-950/40"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />

          <motion.aside
            animate={{ opacity: 1, x: 0 }}
            className="relative flex h-[100svh] w-full max-w-xl flex-col border-l border-slate-200/80 bg-[rgba(248,250,252,0.98)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur sm:p-5 dark:border-slate-700/80 dark:bg-[rgba(15,23,42,0.98)]"
            exit={{ opacity: 0, x: '100%' }}
            initial={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5 sm:gap-5 dark:border-slate-700">
              <div>
                <p className="text-[14px] font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                  Remembered cards
                </p>
                <h2 className="mt-2 text-[24px] font-semibold leading-tight text-slate-900 sm:text-[28px] dark:text-slate-100">
                  Cards you passed within 0.5s.
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-slate-600 dark:text-slate-400">
                  They leave the main queue for now and return when the next forgetting-curve review is due.
                </p>
              </div>

              <button
                aria-label="Close remembered cards"
                className="flex min-h-12 min-w-12 items-center justify-center rounded-[18px] border border-slate-200 bg-white px-4 text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                onClick={onClose}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="memory-scroll mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
              {cards.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-5 text-[15px] leading-7 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                  No passed cards yet. Tap 0.5s Hit only after you can produce the Value from the Key within 0.5s.
                </div>
              ) : (
                cards.map((card) => (
                  <article
                    className="rounded-[28px] border border-slate-200/80 bg-white/88 p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/78"
                    key={card.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 text-[14px] font-medium text-amber-700 dark:text-amber-300">
                          <CalendarDays className="h-4 w-4" />
                          <span>Recorded {formatNoteDate(card.date)}</span>
                        </p>
                        <h3 className="mt-2 text-[22px] font-semibold leading-tight text-slate-900 dark:text-slate-100">
                          {getDisplayTitle(card)}
                        </h3>
                      </div>

                      <div className="rounded-full bg-slate-100 px-4 py-2 text-[14px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Due {formatDueDate(card.dueAt)}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[22px] bg-slate-50/90 p-3 dark:bg-slate-800/70">
                      <MemoryCardContent body={card.body} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[14px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        <span>{formatLastReviewedAt(card.lastReviewedAt)}</span>
                      </span>
                      <span>{card.nextIntervalLabel}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function getDisplayTitle(card: ReviewCard): string {
  return card.title === '2026' ? 'Daily hash deck' : card.title;
}
