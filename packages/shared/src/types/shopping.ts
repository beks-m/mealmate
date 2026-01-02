import type { IngredientCategory } from './recipe.js';

export interface ShoppingList {
  id: string;
  profileId: string;
  mealPlanId?: string;
  name?: string;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  name: string;
  nameRu?: string;
  quantity?: number;
  unit?: string;
  unitRu?: string;
  category: IngredientCategory;
  isChecked: boolean;
  sortOrder: number;
}

export interface CreateShoppingListInput {
  mealPlanId?: string;
  name?: string;
}

export interface AddShoppingListItemInput {
  shoppingListId: string;
  name: string;
  nameRu?: string;
  quantity?: number;
  unit?: string;
  unitRu?: string;
  category?: IngredientCategory;
}

export interface ShoppingListByCategory {
  category: IngredientCategory;
  categoryLabel: string;
  categoryLabelRu: string;
  items: ShoppingListItem[];
}
