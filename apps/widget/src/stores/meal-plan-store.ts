import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { MealPlan, MealPlanEntry } from '@mealmate/shared';

interface MealPlanState {
  currentPlan: MealPlan | null;
  plans: MealPlan[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentPlan: (plan: MealPlan | null) => void;
  setPlans: (plans: MealPlan[]) => void;
  addEntry: (entry: MealPlanEntry) => void;
  removeEntry: (entryId: string) => void;
  updateEntry: (entryId: string, updates: Partial<MealPlanEntry>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMealPlanStore = create<MealPlanState>()(
  immer((set) => ({
    currentPlan: null,
    plans: [],
    isLoading: false,
    error: null,

    setCurrentPlan: (plan) => set({ currentPlan: plan }),

    setPlans: (plans) => set({ plans }),

    addEntry: (entry) =>
      set((state) => {
        if (state.currentPlan) {
          state.currentPlan.entries.push(entry);
        }
      }),

    removeEntry: (entryId) =>
      set((state) => {
        if (state.currentPlan) {
          state.currentPlan.entries = state.currentPlan.entries.filter(
            (e) => e.id !== entryId
          );
        }
      }),

    updateEntry: (entryId, updates) =>
      set((state) => {
        if (state.currentPlan) {
          const entry = state.currentPlan.entries.find((e) => e.id === entryId);
          if (entry) {
            Object.assign(entry, updates);
          }
        }
      }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),
  }))
);
