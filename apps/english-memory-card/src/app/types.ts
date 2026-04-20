export interface NoteSection {
  readonly id: string;
  readonly fileName: string;
  readonly relativePath: string;
  readonly date: string;
  readonly title: string;
  readonly body: string;
  readonly excerpt: string;
  readonly wordCount: number;
}

export interface StoredReviewState {
  readonly stage: number;
  readonly dueAt: string;
  readonly lastReviewedAt: string | null;
}

export interface ReviewCard extends NoteSection {
  readonly stage: number;
  readonly dueAt: string;
  readonly dueLabel: string;
  readonly status: 'due' | 'upcoming';
  readonly statusLabel: string;
  readonly progressRatio: number;
  readonly lastReviewedAt: string | null;
  readonly nextIntervalLabel: string;
}

export interface ReviewSummary {
  readonly total: number;
  readonly dueNow: number;
  readonly upcoming: number;
  readonly mastered: number;
}