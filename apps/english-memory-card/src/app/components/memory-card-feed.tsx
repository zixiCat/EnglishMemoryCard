import { useEffect, useEffectEvent, useRef } from 'react';

import { BookText, CalendarDays, ChevronsDown, Clock3, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

import {
  formatCompactDate,
  formatDueDate,
  formatLastReviewedAt,
  formatStageLabel,
} from '../lib/forgetting-curve';
import type { ReviewCard } from '../types';
import { MemoryCardContent } from './memory-card-content';

interface MemoryCardFeedProps {
  readonly activeCardId: string | null;
  readonly cards: readonly ReviewCard[];
  readonly onActiveCardChange: (id: string) => void;
  readonly onRemember: (id: string) => void;
  readonly onRetry: (id: string) => void;
}

export function MemoryCardFeed({
  activeCardId,
  cards,
  onActiveCardChange,
  onRemember,
  onRetry,
}: MemoryCardFeedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  const handleVisibleCards = useEffectEvent((entries: IntersectionObserverEntry[]) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
    const nextActiveCardId = visibleEntry?.target instanceof HTMLElement
      ? visibleEntry.target.dataset.cardId
      : undefined;

    if (nextActiveCardId) {
      onActiveCardChange(nextActiveCardId);
    }
  });

  useEffect(() => {
    const containerNode = containerRef.current;

    if (!containerNode || cards.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        handleVisibleCards(entries);
      },
      {
        root: containerNode,
        threshold: [0.55, 0.7, 0.85],
      }
    );

    cardRefs.current.forEach((node) => observer.observe(node));

    if (!activeCardId) {
      onActiveCardChange(cards[0].id);
    }

    return () => {
      observer.disconnect();
    };
  }, [activeCardId, cards, handleVisibleCards, onActiveCardChange]);

  const scrollToNextCard = (currentCardId: string) => {
    const currentIndex = cards.findIndex((card) => card.id === currentCardId);
    const nextCard = cards[Math.min(currentIndex + 1, cards.length - 1)];

    if (!nextCard) {
      return;
    }

    cardRefs.current.get(nextCard.id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const rememberAndAdvance = (cardId: string) => {
    onRemember(cardId);
    scrollToNextCard(cardId);
  };

  const retryAndAdvance = (cardId: string) => {
    onRetry(cardId);
    scrollToNextCard(cardId);
  };

  return (
    <div
      className="memory-scroll h-[100svh] snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
      ref={containerRef}
    >
      {cards.map((card, index) => {
        const isActive = card.id === activeCardId || (!activeCardId && index === 0);

        return (
          <section
            className="flex min-h-[100svh] snap-start items-stretch px-5 pb-24 pt-24"
            data-card-id={card.id}
            key={card.id}
            ref={(node) => {
              if (node) {
                cardRefs.current.set(card.id, node);
                return;
              }

              cardRefs.current.delete(card.id);
            }}
          >
            <motion.article
              animate={{
                opacity: isActive ? 1 : 0.78,
                scale: isActive ? 1 : 0.975,
                y: isActive ? 0 : 18,
              }}
              className="memory-glass mx-auto flex h-[calc(100svh-7rem)] w-full max-w-md flex-col rounded-[34px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,248,235,0.82)_52%,rgba(239,246,255,0.9)_100%)] p-5 shadow-[0_28px_90px_rgba(20,33,61,0.16)]"
              initial={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div
                    className={[
                      'inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em]',
                      card.status === 'due'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-700',
                    ].join(' ')}
                  >
                    <Clock3 className="h-4 w-4" />
                    <span>{card.dueLabel}</span>
                  </div>
                  <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-900">
                    {card.title}
                  </h1>
                  <p className="mt-4 text-[15px] leading-7 text-slate-600">
                    {card.excerpt}
                  </p>
                </div>
                <div className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/12">
                  #{index + 1}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-5 text-sm text-slate-600">
                <div className="rounded-[24px] bg-white/75 p-5 shadow-inner shadow-slate-900/5">
                  <div className="flex items-center gap-3 text-slate-500">
                    <BookText className="h-4 w-4" />
                    <span>Source</span>
                  </div>
                  <p className="mt-3 text-[15px] font-semibold text-slate-900">{card.relativePath}</p>
                </div>
                <div className="rounded-[24px] bg-white/75 p-5 shadow-inner shadow-slate-900/5">
                  <div className="flex items-center gap-3 text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    <span>Captured</span>
                  </div>
                  <p className="mt-3 text-[15px] font-semibold text-slate-900">
                    {formatCompactDate(card.date)}
                  </p>
                </div>
              </div>

              <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-[28px] bg-white/68 p-5 shadow-inner shadow-slate-900/5">
                <div className="memory-scroll h-full overflow-y-auto pr-2">
                  <MemoryCardContent body={card.body} />
                </div>
              </div>

              <div className="mt-5 rounded-[28px] bg-slate-900 px-5 py-4 text-white shadow-lg shadow-slate-900/15">
                <div className="flex items-center justify-between gap-5 text-sm text-white/75">
                  <span>{formatStageLabel(card.stage)}</span>
                  <span>{card.statusLabel}</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/15">
                  <motion.div
                    animate={{ width: `${Math.round(card.progressRatio * 100)}%` }}
                    className="h-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500"
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-5 text-sm text-white/75">
                  <div>
                    <p className="uppercase tracking-[0.25em] text-white/45">Next curve jump</p>
                    <p className="mt-2 text-[15px] font-semibold text-white">{card.nextIntervalLabel}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.25em] text-white/45">Last review</p>
                    <p className="mt-2 text-[15px] font-semibold text-white">
                      {formatLastReviewedAt(card.lastReviewedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-5">
                <button
                  className="flex items-center justify-center gap-3 rounded-[24px] border border-slate-300 bg-white/85 px-5 py-4 text-[15px] font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
                  onClick={() => retryAndAdvance(card.id)}
                  type="button"
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span>Again soon</span>
                </button>
                <button
                  className="flex items-center justify-center gap-3 rounded-[24px] bg-slate-900 px-5 py-4 text-[15px] font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800"
                  onClick={() => rememberAndAdvance(card.id)}
                  type="button"
                >
                  <Clock3 className="h-4 w-4" />
                  <span>Remembered</span>
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 text-sm text-slate-500">
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.8, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
                >
                  <ChevronsDown className="h-4 w-4" />
                </motion.div>
                <span>Swipe down for the next card.</span>
                <span className="hidden sm:inline">Next due: {formatDueDate(card.dueAt)}</span>
              </div>
            </motion.article>
          </section>
        );
      })}
    </div>
  );
}