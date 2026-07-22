import { FORGETTING_CURVE_DAYS } from './forgetting-curve';
import type { StoredReviewState } from '../types';

const PROGRESS_CODE_PATTERN = /^(\d{4}-\d{2}-\d{2}-\d+)-(\d+)$/;
const PROGRESS_EXPORT_PREFIX = 'ENGLISH_MEMORY_CARD_PROGRESS_V1:';

interface ReviewProgressExport {
  readonly progressById: Record<string, StoredReviewState>;
  readonly version: 1;
}

export function buildReviewProgressCodes(
  progressById: Record<string, StoredReviewState>,
  validCardIds: ReadonlySet<string>,
): string {
  const exportProgress = Object.fromEntries(
    Object.entries(progressById).filter(([cardId]) => validCardIds.has(cardId)),
  );
  const payload: ReviewProgressExport = {
    version: 1,
    progressById: exportProgress,
  };

  return `${PROGRESS_EXPORT_PREFIX}${JSON.stringify(payload)}`;
}

export function parseReviewProgressCodes(
  text: string,
  validCardIds: ReadonlySet<string>,
  now = new Date(),
): Record<string, StoredReviewState> {
  const trimmedText = text.trim();

  if (trimmedText.startsWith(PROGRESS_EXPORT_PREFIX)) {
    return parseFullProgressExport(
      trimmedText.slice(PROGRESS_EXPORT_PREFIX.length),
      validCardIds,
    );
  }

  return parseLegacyProgressCodes(trimmedText, validCardIds, now);
}

function parseFullProgressExport(
  json: string,
  validCardIds: ReadonlySet<string>,
): Record<string, StoredReviewState> {
  let payload: unknown;

  try {
    payload = JSON.parse(json);
  } catch {
    throw new Error('The copied progress data is incomplete or invalid.');
  }

  if (!isRecord(payload) || payload.version !== 1 || !isRecord(payload.progressById)) {
    throw new Error('Unsupported progress data. Copy it again from Memory Card.');
  }

  const progressById: Record<string, StoredReviewState> = {};

  for (const [cardId, progress] of Object.entries(payload.progressById)) {
    if (!validCardIds.has(cardId)) {
      continue;
    }

    if (!isStoredReviewState(progress)) {
      throw new Error(`Invalid progress for card: ${cardId}`);
    }

    progressById[cardId] = progress;
  }

  return progressById;
}

function parseLegacyProgressCodes(
  text: string,
  validCardIds: ReadonlySet<string>,
  now: Date,
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

function isStoredReviewState(value: unknown): value is StoredReviewState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Number.isInteger(value.stage)
    && Number(value.stage) >= 0
    && Number(value.stage) <= FORGETTING_CURVE_DAYS.length
    && isValidIsoDate(value.dueAt)
    && (value.lastReviewedAt === null || isValidIsoDate(value.lastReviewedAt))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}