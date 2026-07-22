import { FORGETTING_CURVE_DAYS } from './forgetting-curve';
import type { ReviewCard, StoredReviewState } from '../types';

const PROGRESS_CODE_PATTERN = /^(\d{4}-\d{2}-\d{2}-\d+)-(\d+)$/;

export function buildReviewProgressCodes(cards: readonly ReviewCard[]): string {
  return cards
    .filter((card) => card.stage > 0)
    .map((card) => `${card.id}-${card.stage}`)
    .join('\n');
}

export function parseReviewProgressCodes(
  text: string,
  validCardIds: ReadonlySet<string>,
  now = new Date(),
): Record<string, StoredReviewState> {
  const codes = text.split(/[\s,]+/).map((code) => code.trim()).filter(Boolean);
  const progressById: Record<string, StoredReviewState> = {};

  for (const code of codes) {
    const match = code.match(PROGRESS_CODE_PATTERN);
    const cardId = match?.[1];
    const stage = Number(match?.[2]);

    if (
      !cardId
      || !validCardIds.has(cardId)
      || !Number.isInteger(stage)
      || stage < 1
      || stage > FORGETTING_CURVE_DAYS.length
    ) {
      throw new Error(`Invalid progress code: ${code}`);
    }

    const intervalDays = FORGETTING_CURVE_DAYS[
      Math.min(stage - 1, FORGETTING_CURVE_DAYS.length - 1)
    ];

    progressById[cardId] = {
      stage,
      dueAt: new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
      lastReviewedAt: now.toISOString(),
    };
  }

  return progressById;
}