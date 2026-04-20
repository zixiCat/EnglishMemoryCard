import { useEffect } from 'react';

import { Clock3, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

import {
  formatDueDate,
  formatLastReviewedAt,
  formatStageLabel,
} from '../lib/forgetting-curve';
import type { ReviewCard } from '../types';
import { MemoryCardContent } from './memory-card-content';

interface MemoryCardFeedProps {
  readonly activeCardId: string | null;
  readonly cards: readonly ReviewCard[];
  readonly reviewedCardIds: readonly string[];
  readonly onActiveCardChange: (id: string) => void;
  readonly onCardReviewed: (id: string) => void;
  readonly onRemember: (id: string) => void;
  readonly onRetry: (id: string) => void;
}

export function MemoryCardFeed({
  activeCardId,
  cards,
  reviewedCardIds,
  onActiveCardChange,
  onCardReviewed,
  onRemember,
  onRetry,
}: MemoryCardFeedProps) {
  const reviewedCardIdSet = new Set(reviewedCardIds);
  const nextPendingCard = cards.find((card) => !reviewedCardIdSet.has(card.id)) ?? null;
  const sessionComplete = cards.length > 0 && nextPendingCard === null;
  const activeCard = nextPendingCard
    ?? cards.find((card) => card.id === activeCardId)
    ?? cards[cards.length - 1]
    ?? null;
  const activeCardIndex = activeCard ? cards.findIndex((card) => card.id === activeCard.id) : -1;
  const remainingCards = cards.filter((card) => !reviewedCardIdSet.has(card.id)).length;
  const remainingCardsAfterCurrent = Math.max(remainingCards - 1, 0);

  useEffect(() => {
    if (!nextPendingCard || activeCardId === nextPendingCard.id) {
      return;
    }

    onActiveCardChange(nextPendingCard.id);
  }, [activeCardId, nextPendingCard, onActiveCardChange]);

  const rememberAndAdvance = (cardId: string) => {
    onRemember(cardId);
    onCardReviewed(cardId);
  };

  const retryAndAdvance = (cardId: string) => {
    onRetry(cardId);
    onCardReviewed(cardId);
  };

  if (cards.length === 0) {
    return null;
  }

  if (sessionComplete) {
    return (
      <div className="pb-5">
        <motion.section
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex min-h-[calc(100svh-9rem)] flex-col items-center justify-center rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
            Session complete
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900">
            You finished this review pass.
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-7 text-slate-600">
            All {cards.length} cards have been recorded for this session. Come back when the next note is due on the forgetting curve.
          </p>
        </motion.section>
      </div>
    );
  }

  if (!activeCard) {
    return null;
  }

  return (
    <div className="pb-5">
      <motion.article
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex min-h-[calc(100svh-9rem)] flex-col rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        key={activeCard.id}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className={[
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]',
                activeCard.status === 'due'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-sky-100 text-sky-700',
              ].join(' ')}
            >
              <Clock3 className="h-4 w-4" />
              <span>{activeCard.dueLabel}</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900">
              {activeCard.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
              <span>{activeCard.relativePath}</span>
              <span className="text-slate-300">•</span>
              <span>{activeCard.statusLabel}</span>
            </div>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            {activeCardIndex + 1}/{cards.length}
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>{formatStageLabel(activeCard.stage)}</span>
            <span className="text-slate-300">•</span>
            <span>Next {activeCard.nextIntervalLabel}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Last review: {formatLastReviewedAt(activeCard.lastReviewedAt)}
          </p>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50 p-4">
          <div className="memory-scroll h-full overflow-y-auto pr-1">
            <MemoryCardContent body={activeCard.body} />
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 rounded-full bg-slate-200">
            <motion.div
              animate={{ width: `${Math.round(activeCard.progressRatio * 100)}%` }}
              className="h-2 rounded-full bg-slate-900"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          <button
            className="flex min-h-12 items-center justify-center gap-3 rounded-[18px] border border-slate-300 bg-white px-5 py-4 text-[15px] font-semibold text-slate-700 transition hover:border-slate-400"
            onClick={() => retryAndAdvance(activeCard.id)}
            type="button"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Again soon</span>
          </button>
          <button
            className="flex min-h-12 items-center justify-center gap-3 rounded-[18px] bg-slate-900 px-5 py-4 text-[15px] font-semibold text-white transition hover:bg-slate-800"
            onClick={() => rememberAndAdvance(activeCard.id)}
            type="button"
          >
            <Clock3 className="h-4 w-4" />
            <span>Remembered</span>
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          <span>
            {remainingCardsAfterCurrent > 1
              ? `${remainingCardsAfterCurrent} cards left after this one.`
              : remainingCardsAfterCurrent === 1
                ? '1 card left after this one.'
                : `Last card in this pass. Next due ${formatDueDate(activeCard.dueAt)}.`}
          </span>
        </div>
      </motion.article>
    </div>
  );
}