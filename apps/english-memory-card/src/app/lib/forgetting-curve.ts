import type { NoteSection, ReviewCard, ReviewSummary, StoredReviewState } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;
const QUICK_RETRY_MS = 10 * 60 * 1000;
const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});
const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
const longDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const FORGETTING_CURVE_DAYS = [1, 3, 7, 14, 30, 60] as const;

export function buildReviewDeck(
  sections: readonly NoteSection[],
  progressById: Record<string, StoredReviewState>,
  now = new Date()
): ReviewCard[] {
  return [...sections]
    .map((section) => {
      const savedProgress = progressById[section.id];
      const dueAt = savedProgress?.dueAt ?? createInitialDueAt(section.date);
      const dueDate = new Date(dueAt);
      const dueNow = dueDate.getTime() <= now.getTime();
      const stage = savedProgress?.stage ?? 0;

      return {
        ...section,
        stage,
        dueAt,
        dueLabel: formatRelativeDueLabel(dueAt, now),
        status: dueNow ? 'due' : 'upcoming',
        statusLabel: dueNow ? 'Ready for review' : `Next review ${longDateFormatter.format(dueDate)}`,
        progressRatio: Math.max((stage + 1) / (FORGETTING_CURVE_DAYS.length + 1), 0.12),
        lastReviewedAt: savedProgress?.lastReviewedAt ?? null,
        nextIntervalLabel: formatIntervalLabel(
          FORGETTING_CURVE_DAYS[Math.min(stage, FORGETTING_CURVE_DAYS.length - 1)]
        ),
      } satisfies ReviewCard;
    })
    .sort((left, right) => {
      const leftPriority = left.status === 'due' ? 0 : 1;
      const rightPriority = right.status === 'due' ? 0 : 1;

      return (
        leftPriority - rightPriority
        || new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()
        || left.date.localeCompare(right.date)
      );
    });
}

export function buildRememberedState(
  currentProgress?: StoredReviewState,
  now = new Date()
): StoredReviewState {
  const nextStage = Math.min((currentProgress?.stage ?? 0) + 1, FORGETTING_CURVE_DAYS.length);
  const intervalDays = FORGETTING_CURVE_DAYS[Math.min(nextStage - 1, FORGETTING_CURVE_DAYS.length - 1)];

  return {
    stage: nextStage,
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

export function buildRetryState(now = new Date()): StoredReviewState {
  return {
    stage: 0,
    dueAt: new Date(now.getTime() + QUICK_RETRY_MS).toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

export function createInitialDueAt(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Date(year, month - 1, day, 8, 0, 0, 0).toISOString();
}

export function getReviewSummary(cards: readonly ReviewCard[]): ReviewSummary {
  const dueNow = cards.filter((card) => card.status === 'due').length;
  const mastered = cards.filter((card) => card.stage >= FORGETTING_CURVE_DAYS.length).length;

  return {
    total: cards.length,
    dueNow,
    upcoming: cards.length - dueNow,
    mastered,
  };
}

export function formatStageLabel(stage: number): string {
  if (stage === 0) {
    return 'Fresh note';
  }

  if (stage === 1) {
    return '1 review completed';
  }

  return `${stage} reviews completed`;
}

export function formatNoteDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  return longDateFormatter.format(new Date(year, month - 1, day));
}

export function formatDueDate(dueAt: string): string {
  return longDateFormatter.format(new Date(dueAt));
}

export function formatLastReviewedAt(lastReviewedAt: string | null): string {
  if (!lastReviewedAt) {
    return 'Not reviewed yet';
  }

  return longDateTimeFormatter.format(new Date(lastReviewedAt));
}

function formatIntervalLabel(days: number): string {
  return days === 1 ? '1 day' : `${days} days`;
}

function formatRelativeDueLabel(dueAt: string, now: Date): string {
  const differenceInMinutes = Math.round((new Date(dueAt).getTime() - now.getTime()) / (1000 * 60));

  if (differenceInMinutes <= 0) {
    const overdueMinutes = Math.abs(differenceInMinutes);

    if (overdueMinutes < 60) {
      return 'Due now';
    }

    const overdueHours = Math.round(overdueMinutes / 60);

    if (overdueHours < 48) {
      return `Overdue ${overdueHours}h`;
    }

    return `Overdue ${Math.round(overdueHours / 24)}d`;
  }

  if (differenceInMinutes < 60) {
    return `In ${differenceInMinutes} min`;
  }

  const differenceInHours = Math.round(differenceInMinutes / 60);

  if (differenceInHours < 48) {
    return `In ${differenceInHours}h`;
  }

  return `In ${Math.round(differenceInHours / 24)}d`;
}

export function formatCompactDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  return shortDateFormatter.format(new Date(year, month - 1, day));
}