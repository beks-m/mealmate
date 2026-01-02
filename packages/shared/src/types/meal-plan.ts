import type { Recipe } from './recipe.js';
import type { FamilyMember } from './user.js';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlan {
  id: string;
  profileId: string;
  name?: string;
  startDate: Date;
  endDate: Date;
  entries: MealPlanEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlanEntry {
  id: string;
  mealPlanId: string;
  recipeId?: string;
  recipe?: Recipe;
  familyMemberId?: string;
  familyMember?: FamilyMember;
  date: Date;
  mealType: MealType;
  servings: number;
  notes?: string;
  createdAt: Date;
}

export interface CreateMealPlanInput {
  name?: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}

export interface AddMealToPlanInput {
  mealPlanId: string;
  recipeId: string;
  date: string; // ISO date string
  mealType: MealType;
  servings?: number;
  familyMemberId?: string;
  notes?: string;
}

export interface MealPlanDaySummary {
  date: Date;
  meals: {
    breakfast?: MealPlanEntry[];
    lunch?: MealPlanEntry[];
    dinner?: MealPlanEntry[];
    snack?: MealPlanEntry[];
  };
  totalNutrition: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
}
