import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ShoppingList, ShoppingListItem } from '@mealmate/shared';

interface ShoppingState {
  currentList: ShoppingList | null;
  lists: ShoppingList[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentList: (list: ShoppingList | null) => void;
  setLists: (lists: ShoppingList[]) => void;
  addItem: (item: ShoppingListItem) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<ShoppingListItem>) => void;
  clearChecked: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useShoppingStore = create<ShoppingState>()(
  immer((set) => ({
    currentList: null,
    lists: [],
    isLoading: false,
    error: null,

    setCurrentList: (list) => set({ currentList: list }),

    setLists: (lists) => set({ lists }),

    addItem: (item) =>
      set((state) => {
        if (state.currentList) {
          state.currentList.items.push(item);
        }
      }),

    removeItem: (itemId) =>
      set((state) => {
        if (state.currentList) {
          state.currentList.items = state.currentList.items.filter(
            (i) => i.id !== itemId
          );
        }
      }),

    toggleItem: (itemId) =>
      set((state) => {
        if (state.currentList) {
          const item = state.currentList.items.find((i) => i.id === itemId);
          if (item) {
            item.isChecked = !item.isChecked;
          }
        }
      }),

    updateItem: (itemId, updates) =>
      set((state) => {
        if (state.currentList) {
          const item = state.currentList.items.find((i) => i.id === itemId);
          if (item) {
            Object.assign(item, updates);
          }
        }
      }),

    clearChecked: () =>
      set((state) => {
        if (state.currentList) {
          state.currentList.items = state.currentList.items.filter(
            (i) => !i.isChecked
          );
        }
      }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),
  }))
);
