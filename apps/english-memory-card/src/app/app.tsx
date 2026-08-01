import { BrainCircuit, Clipboard, Copy, Gauge, Layers3 } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode } from "react";

import {
  MemoryCardFeed,
  RememberedCardDrawer,
} from "./components/memory-card-feed";
import { noteSections } from "./data/generated-notes";
import { buildReviewDeck } from "./lib/forgetting-curve";
import { buildHashReviewSections } from "./lib/hash-drills";
import {
  buildReviewProgressCodes,
  parseReviewProgressCodes,
} from "./lib/review-progress-codes";
import { useReviewStore } from "./store/use-review-store";
import type { ReviewCard } from "./types";

const hashReviewSections = buildHashReviewSections(noteSections);

export function App() {
  const hydrated = useReviewStore((state) => state.hydrated);
  const progressById = useReviewStore((state) => state.progressById);
  const replaceProgress = useReviewStore((state) => state.replaceProgress);
  const rememberedDrawerOpen = useReviewStore(
    (state) => state.rememberedDrawerOpen,
  );
  const setRememberedDrawerOpen = useReviewStore(
    (state) => state.setRememberedDrawerOpen,
  );
  const rememberCard = useReviewStore((state) => state.rememberCard);
  const retryCard = useReviewStore((state) => state.retryCard);

  const cards = buildReviewDeck(hashReviewSections, progressById);
  const dueCards = cards
    .filter((card) => card.status === "due")
    .sort(compareDueCardsNewestFirst);
  const rememberedCards = cards
    .filter((card) => card.lastReviewedAt !== null)
    .sort((left, right) =>
      (right.lastReviewedAt ?? "").localeCompare(left.lastReviewedAt ?? ""),
    );
  const cardIdAliases = buildCardIdAliases(cards);

  const handleCopyProgress = async () => {
    const codes = buildReviewProgressCodes(
      progressById,
      cardIdAliases,
    );

    await navigator.clipboard.writeText(codes);
  };

  const handlePasteProgress = async () => {
    const codes = await navigator.clipboard.readText();
    const pastedProgress = parseReviewProgressCodes(
      codes,
      cardIdAliases,
    );

    replaceProgress(pastedProgress);
  };

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-[100svh] w-full max-w-md items-center justify-center px-4 py-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[24px] border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
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
            No drills found yet.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-400">
            Add a dated{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              ##
            </span>{" "}
            or{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              ###
            </span>{" "}
            heading in{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              apps/english-memory-card/src/app/data/*.md
            </span>{" "}
            with at least one bullet or Key / Value line, then refresh the page.
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
          onCopyProgress={handleCopyProgress}
          onPasteProgress={handlePasteProgress}
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
                Cards you passed with a 0.5s retrieval will return to the main
                queue on the forgetting curve. You can also open remembered
                cards for an early review.
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
  readonly onCopyProgress: () => Promise<void>;
  readonly onPasteProgress: () => Promise<void>;
  readonly rememberedCount: number;
  readonly totalCount: number;
}

function HashTrainingHeader({
  dueCount,
  onCopyProgress,
  onPasteProgress,
  rememberedCount,
  totalCount,
}: HashTrainingHeaderProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-slate-200/80 bg-[rgba(255,255,255,0.92)] p-3 shadow-sm backdrop-blur sm:p-4 dark:border-slate-700/80 dark:bg-[rgba(15,23,42,0.9)]"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
            Key / Value
          </p>
          <h1 className="mt-1 text-[22px] font-semibold leading-tight text-slate-950 sm:text-[26px] dark:text-white">
            English Memory Card
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:min-w-[300px] sm:items-end">
          <div className="grid grid-cols-3 gap-2 sm:w-full">
            <HeaderMetric
              icon={<Gauge className="h-4 w-4" />}
              label="Due"
              text={`${dueCount}`}
            />
            <HeaderMetric
              icon={<BrainCircuit className="h-4 w-4" />}
              label="Saved"
              text={`${rememberedCount}`}
            />
            <HeaderMetric
              icon={<Layers3 className="h-4 w-4" />}
              label="Total"
              text={`${totalCount}`}
            />
          </div>

          <div className="flex w-full flex-wrap justify-end gap-2">
            <button
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/88 px-4 py-2 text-[14px] font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600"
              onClick={onPasteProgress}
              type="button"
            >
              <Clipboard className="h-4 w-4" />
              <span>Paste all progress</span>
            </button>
            <button
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              onClick={onCopyProgress}
              type="button"
            >
              <Copy className="h-4 w-4" />
              <span>Copy all progress</span>
            </button>
          </div>
        </div>
      </div>
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
    <div className="rounded-[16px] bg-slate-50 p-3 dark:bg-slate-800/70">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 dark:text-slate-400 sm:text-[14px]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-[16px] font-semibold leading-7 text-slate-900 dark:text-slate-100">
        {text}
      </p>
    </div>
  );
}

function prioritizeStructuredCards(
  left: ReviewCard,
  right: ReviewCard,
): number {
  const leftPriority = hasStructuredHashSyntax(left) ? 0 : 1;
  const rightPriority = hasStructuredHashSyntax(right) ? 0 : 1;

  return leftPriority - rightPriority;
}

function hasStructuredHashSyntax(card: ReviewCard): boolean {
  return /(?:^|\n)\s*[-*]?\s*Key\s*[:：].*\|\s*Value\s*[:：]/i.test(card.body);
}

function compareDueCardsNewestFirst(
  left: ReviewCard,
  right: ReviewCard,
): number {
  return (
    prioritizeStructuredCards(left, right)
    || right.date.localeCompare(left.date)
    || getReviewCardSequence(right) - getReviewCardSequence(left)
    || right.id.localeCompare(left.id)
  );
}

function getReviewCardSequence(card: ReviewCard): number {
  const trailingNumber = card.legacyId?.match(/-(\d+)$/)?.[1];

  return trailingNumber ? Number(trailingNumber) : 0;
}

function buildCardIdAliases(cards: readonly ReviewCard[]): ReadonlyMap<string, string> {
  return new Map(
    cards.flatMap((card) => [
      [card.id, card.id] as const,
      ...(card.legacyId ? [[card.legacyId, card.id] as const] : []),
    ]),
  );
}
