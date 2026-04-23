import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildRememberedState, buildRetryState } from '../lib/forgetting-curve';
import type { StoredReviewState } from '../types';

interface ReviewStoreState {
  readonly hydrated: boolean;
  readonly progressById: Record<string, StoredReviewState>;
  readonly rememberedDrawerOpen: boolean;
  readonly setHydrated: (hydrated: boolean) => void;
  readonly setRememberedDrawerOpen: (open: boolean) => void;
  readonly rememberCard: (id: string) => void;
  readonly retryCard: (id: string) => void;
}

export const useReviewStore = create<ReviewStoreState>()(
  persist(
    (set) => ({
      hydrated: false,
      progressById: {},
      rememberedDrawerOpen: false,
      setHydrated: (hydrated) => set({ hydrated }),
      setRememberedDrawerOpen: (open) => set({ rememberedDrawerOpen: open }),
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
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        progressById: state.progressById,
      }),
      migrate: (persistedState) => {
        const storedState = persistedState as Partial<ReviewStoreState> | undefined;

        return {
          progressById: storedState?.progressById ?? {},
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);