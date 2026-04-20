import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildRememberedState, buildRetryState } from '../lib/forgetting-curve';
import type { StoredReviewState } from '../types';

interface ReviewStoreState {
  readonly activeCardId: string | null;
  readonly hydrated: boolean;
  readonly progressById: Record<string, StoredReviewState>;
  readonly setHydrated: (hydrated: boolean) => void;
  readonly setActiveCard: (id: string) => void;
  readonly rememberCard: (id: string) => void;
  readonly retryCard: (id: string) => void;
}

export const useReviewStore = create<ReviewStoreState>()(
  persist(
    (set) => ({
      activeCardId: null,
      hydrated: false,
      progressById: {},
      setHydrated: (hydrated) => set({ hydrated }),
      setActiveCard: (id) => set({ activeCardId: id }),
      rememberCard: (id) =>
        set((state) => ({
          progressById: {
            ...state.progressById,
            [id]: buildRememberedState(state.progressById[id]),
          },
        })),
      retryCard: (id) =>
        set((state) => ({
          progressById: {
            ...state.progressById,
            [id]: buildRetryState(),
          },
        })),
    }),
    {
      name: 'english-memory-card-progress',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeCardId: state.activeCardId,
        progressById: state.progressById,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);