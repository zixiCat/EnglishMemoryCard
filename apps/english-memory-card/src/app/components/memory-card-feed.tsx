import { Clock3, LibraryBig, RefreshCcw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  FORGETTING_CURVE_DAYS,
  formatDueDateTime,
  formatLastReviewedAt,
  formatStageLabel,
} from "../lib/forgetting-curve";
import type { ReviewCard } from "../types";
import { MemoryCardContent } from "./memory-card-content";

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
    <div className="memory-feed mt-3 overflow-visible pb-24 sm:max-h-[calc(100svh-9rem)] sm:overflow-y-auto sm:pb-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-slate-200/80 bg-white/88 px-4 py-3 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/80">
        <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-300">
          {cards.length} due
        </p>
        <button
          className="memory-glass flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-[14px] font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600"
          onClick={onOpenRemembered}
          type="button"
        >
          <LibraryBig className="h-4 w-4" />
          <span>{rememberedCount} remembered</span>
        </button>
      </div>

      <div className="space-y-3">
        {cards.map((card) => (
          <motion.article
            animate={{ opacity: 1 }}
            className="rounded-[22px] border border-slate-200/80 bg-[rgba(255,255,255,0.94)] p-3 backdrop-blur dark:border-slate-700/80 dark:bg-[rgba(15,23,42,0.9)]"
            initial={{ opacity: 0 }}
            key={card.id}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="space-y-2.5">
              <MemoryCardContent body={card.body} />

              <div>
                <ReviewProgressDetails card={card} />

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    className="flex min-h-11 items-center justify-center gap-2 rounded-[16px] border border-slate-300 bg-white px-3 py-2 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500"
                    onClick={() => onRetry(card.id)}
                    type="button"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    <span>Retry</span>
                  </button>
                  <button
                    className="flex min-h-11 items-center justify-center gap-2 rounded-[16px] bg-slate-900 px-3 py-2 text-[14px] font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    onClick={() => onRemember(card.id)}
                    type="button"
                  >
                    <Clock3 className="h-4 w-4" />
                    <span>Hit</span>
                  </button>
                </div>
              </div>
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
            exit={{ opacity: 0, x: "100%" }}
            initial={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 sm:gap-5 dark:border-slate-700">
              <div>
                <p className="text-[14px] font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                  Remembered
                </p>
                <h2 className="mt-2 text-[22px] font-semibold leading-tight text-slate-900 dark:text-slate-100">
                  {cards.length} cards
                </h2>
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

            <div className="memory-scroll mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
              {cards.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-slate-300 bg-white/80 p-4 text-[15px] leading-7 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                  No remembered cards yet.
                </div>
              ) : (
                cards.map((card) => (
                  <article
                    className="rounded-[22px] border border-slate-200/80 bg-white/88 p-3 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/78"
                    key={card.id}
                  >
                    <MemoryCardContent body={card.body} />

                    <ReviewProgressDetails card={card} />

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        <span>{formatLastReviewedAt(card.lastReviewedAt)}</span>
                      </span>
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

interface ReviewProgressDetailsProps {
  readonly card: ReviewCard;
}

function ReviewProgressDetails({ card }: ReviewProgressDetailsProps) {
  const completedStage = Math.min(card.stage, FORGETTING_CURVE_DAYS.length);
  const nextHitLabel = card.status === "due" ? "Next hit" : "After hit";

  return (
    <div className="text-[13px] text-slate-500 dark:text-slate-400">
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          Stage {completedStage} / {FORGETTING_CURVE_DAYS.length}
        </span>
        <span>{formatStageLabel(completedStage)}</span>
      </div>

      <div className="mt-1.5 ml-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1.5">
          <span>{nextHitLabel}</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {card.nextIntervalLabel}
          </span>
        </span>
        <span className="hidden text-slate-300 dark:text-slate-600 sm:inline">
          •
        </span>
        <span className="flex items-center gap-1.5">
          <span>Returns</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {formatDueDateTime(card.nextReviewPreviewAt)}
          </span>
        </span>
      </div>
    </div>
  );
}
