export interface Recipe {
  id: string;
  profileId: string;
  name: string;
  nameRu?: string;
  description?: string;
  descriptionRu?: string;
  servings: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  instructions: string[];
  instructionsRu?: string[];
  ingredients: RecipeIngredient[];
  nutrition: NutritionInfo;
  isFavorite: boolean;
  source: RecipeSource;
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  nameRu?: string;
  quantity: number;
  unit: string;
  unitRu?: string;
  nutrition?: NutritionInfo;
  category: IngredientCategory;
  sortOrder: number;
}

export interface NutritionInfo {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
}

export type RecipeSource = 'ai_generated' | 'manual' | 'imported';

export type IngredientCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'seafood'
  | 'grains'
  | 'pantry'
  | 'frozen'
  | 'beverages'
  | 'other';

export interface CreateRecipeInput {
  name: string;
  nameRu?: string;
  description?: string;
  descriptionRu?: string;
  servings: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  instructions: string[];
  instructionsRu?: string[];
  ingredients: Omit<RecipeIngredient, 'id'>[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  tags?: string[];
  imageUrl?: string;
}

export interface UpdateRecipeInput {
  name?: string;
  nameRu?: string;
  description?: string;
  descriptionRu?: string;
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  instructions?: string[];
  instructionsRu?: string[];
  ingredients?: Omit<RecipeIngredient, 'id'>[];
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  tags?: string[];
  imageUrl?: string;
  isFavorite?: boolean;
}
