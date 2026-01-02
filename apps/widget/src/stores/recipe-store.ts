import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Recipe } from '@mealmate/shared';

interface RecipeState {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  removeRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRecipeStore = create<RecipeState>()(
  immer((set) => ({
    recipes: [],
    isLoading: false,
    error: null,

    setRecipes: (recipes) => set({ recipes }),

    addRecipe: (recipe) =>
      set((state) => {
        state.recipes.unshift(recipe);
      }),

    updateRecipe: (id, updates) =>
      set((state) => {
        const index = state.recipes.findIndex((r) => r.id === id);
        if (index !== -1) {
          Object.assign(state.recipes[index]!, updates);
        }
      }),

    removeRecipe: (id) =>
      set((state) => {
        state.recipes = state.recipes.filter((r) => r.id !== id);
      }),

    toggleFavorite: (id) =>
      set((state) => {
        const recipe = state.recipes.find((r) => r.id === id);
        if (recipe) {
          recipe.isFavorite = !recipe.isFavorite;
        }
      }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),
  }))
);
