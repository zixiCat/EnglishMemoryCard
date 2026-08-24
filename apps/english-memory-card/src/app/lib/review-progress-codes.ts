import type { StoredReviewState } from '../types';
import { FORGETTING_CURVE_DAYS } from './forgetting-curve';

const PROGRESS_EXPORT_PREFIX = 'ENGLISH_MEMORY_CARD_PROGRESS_V1:';

interface ReviewProgressExport {
  readonly progressById: Record<string, StoredReviewState>;
  readonly version: 1;
}

export function buildReviewProgressCodes(
  progressById: Record<string, StoredReviewState>,
  cardIdAliases: ReadonlyMap<string, string>,
): string {
  const exportProgress: Record<string, StoredReviewState> = {};

  for (const [storedCardId, progress] of Object.entries(progressById)) {
    const currentCardId = cardIdAliases.get(storedCardId);

    if (!currentCardId) {
      continue;
    }

    const existingProgress = exportProgress[currentCardId];

    if (!existingProgress || isProgressNewer(progress, existingProgress)) {
      exportProgress[currentCardId] = progress;
    }
  }

  const payload: ReviewProgressExport = {
    version: 1,
    progressById: exportProgress,
  };

  return `${PROGRESS_EXPORT_PREFIX}${JSON.stringify(payload)}`;
}

export function parseReviewProgressCodes(
  text: string,
  cardIdAliases: ReadonlyMap<string, string>,
): Record<string, StoredReviewState> {
  const trimmedText = text.trim();

  if (!trimmedText.startsWith(PROGRESS_EXPORT_PREFIX)) {
    throw new Error('Invalid progress data. Copy it again from Memory Card.');
  }

  return parseFullProgressExport(
    trimmedText.slice(PROGRESS_EXPORT_PREFIX.length),
    cardIdAliases,
  );
}

function parseFullProgressExport(
  json: string,
  cardIdAliases: ReadonlyMap<string, string>,
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
    if (!isStoredReviewState(progress)) {
      throw new Error(`Invalid progress for card: ${cardId}`);
    }

    const currentCardId = cardIdAliases.get(cardId);

    if (!currentCardId) {
      continue;
    }

    progressById[currentCardId] = progress;
  }

  if (Object.keys(payload.progressById).length > 0 && Object.keys(progressById).length === 0) {
    throw new Error('None of the copied cards exist in this version. Local progress was kept.');
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

function isProgressNewer(
  candidate: StoredReviewState,
  current: StoredReviewState,
): boolean {
  const candidateReviewedAt = candidate.lastReviewedAt
    ? Date.parse(candidate.lastReviewedAt)
    : 0;
  const currentReviewedAt = current.lastReviewedAt
    ? Date.parse(current.lastReviewedAt)
    : 0;

  return candidateReviewedAt > currentReviewedAt
    || (candidateReviewedAt === currentReviewedAt && candidate.stage > current.stage);
}