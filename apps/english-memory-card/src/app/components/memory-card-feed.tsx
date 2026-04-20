import { Clock3, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

import type { ReviewCard } from '../types';
import { MemoryCardContent } from './memory-card-content';

interface MemoryCardFeedProps {
  readonly cards: readonly ReviewCard[];
  readonly onRemember: (id: string) => void;
  readonly onRetry: (id: string) => void;
}

export function MemoryCardFeed({
  cards,
  onRemember,
  onRetry,
}: MemoryCardFeedProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="memory-feed h-[calc(100svh-1.5rem)] snap-y snap-mandatory overflow-y-auto pb-4">
      <div className="space-y-3">
        {cards.map((card) => (
          <motion.article
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex min-h-[calc(100svh-1.5rem)] snap-start flex-col rounded-[28px] border border-slate-200/80 bg-[rgba(255,255,255,0.88)] p-4 shadow-[0_14px_40px_rgba(15,23,42,0.10)] backdrop-blur"
            initial={{ opacity: 0, scale: 0.985, y: 20 }}
            key={card.id}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="min-h-0 flex-1 overflow-hidden rounded-[22px] bg-slate-50/80 p-3">
              <div className="memory-scroll h-full overflow-y-auto pr-1">
                <MemoryCardContent body={card.body} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                className="flex min-h-12 items-center justify-center gap-2 rounded-[18px] border border-slate-300 bg-white px-4 py-3 text-[15px] font-semibold text-slate-700 transition hover:border-slate-400"
                onClick={() => onRetry(card.id)}
                type="button"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Again</span>
              </button>
              <button
                className="flex min-h-12 items-center justify-center gap-2 rounded-[18px] bg-slate-900 px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-slate-800"
                onClick={() => onRemember(card.id)}
                type="button"
              >
                <Clock3 className="h-4 w-4" />
                <span>Remembered</span>
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}