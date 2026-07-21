import type { StoredReviewState } from '../types';

export interface ReviewProgressExport {
  readonly exportedAt: string;
  readonly progressById: Record<string, StoredReviewState>;
  readonly version: 1;
}

export function buildReviewProgressExport(
  progressById: Record<string, StoredReviewState>
): ReviewProgressExport {
  return {
    exportedAt: new Date().toISOString(),
    progressById,
    version: 1,
  };
}

export function parseImportedReviewProgress(
  fileContent: string
): Record<string, StoredReviewState> {
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(fileContent) as unknown;
  } catch {
    throw new Error('This file is not valid JSON.');
  }

  const progressById = extractProgressMap(parsedValue);
  const normalizedProgressById: Record<string, StoredReviewState> = {};

  for (const [key, value] of Object.entries(progressById)) {
    if (isStoredReviewState(value)) {
      normalizedProgressById[key] = value;
    }
  }

  if (
    Object.keys(normalizedProgressById).length === 0
    && Object.keys(progressById).length > 0
  ) {
    throw new Error('This file does not contain valid review progress entries.');
  }

  return normalizedProgressById;
}

function extractProgressMap(
  parsedValue: unknown
): Record<string, unknown> {
  if (!parsedValue || typeof parsedValue !== 'object') {
    throw new Error('This file does not contain review progress data.');
  }

  const candidate = parsedValue as {
    readonly progressById?: unknown;
  };

  if (candidate.progressById !== undefined) {
    if (!candidate.progressById || typeof candidate.progressById !== 'object') {
      throw new Error('The imported progress file has an invalid progressById field.');
    }

    return candidate.progressById as Record<string, unknown>;
  }

  return parsedValue as Record<string, unknown>;
}

function isStoredReviewState(value: unknown): value is StoredReviewState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<StoredReviewState>;

  return (
    typeof candidate.stage === 'number'
    && Number.isInteger(candidate.stage)
    && candidate.stage >= 0
    && typeof candidate.dueAt === 'string'
    && !Number.isNaN(Date.parse(candidate.dueAt))
    && isOptionalIsoDate(candidate.lastReviewedAt)
  );
}

function isOptionalIsoDate(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && !Number.isNaN(Date.parse(value)));
}