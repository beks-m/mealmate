import type { NutritionInfo } from '../types/recipe.js';
import type { MealPlanEntry } from '../types/meal-plan.js';

/**
 * Calculate total nutrition for a list of meal plan entries
 */
export function calculateTotalNutrition(entries: MealPlanEntry[]): NutritionInfo {
  return entries.reduce(
    (total, entry) => {
      if (!entry.recipe) return total;

      const multiplier = entry.servings / entry.recipe.servings;

      return {
        calories: total.calories + entry.recipe.nutrition.calories * multiplier,
        proteinG: total.proteinG + entry.recipe.nutrition.proteinG * multiplier,
        carbsG: total.carbsG + entry.recipe.nutrition.carbsG * multiplier,
        fatG: total.fatG + entry.recipe.nutrition.fatG * multiplier,
        fiberG: (total.fiberG ?? 0) + (entry.recipe.nutrition.fiberG ?? 0) * multiplier,
      };
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
  );
}

/**
 * Scale nutrition info based on servings
 */
export function scaleNutrition(
  nutrition: NutritionInfo,
  originalServings: number,
  newServings: number
): NutritionInfo {
  const multiplier = newServings / originalServings;

  return {
    calories: Math.round(nutrition.calories * multiplier),
    proteinG: Math.round(nutrition.proteinG * multiplier * 10) / 10,
    carbsG: Math.round(nutrition.carbsG * multiplier * 10) / 10,
    fatG: Math.round(nutrition.fatG * multiplier * 10) / 10,
    fiberG: nutrition.fiberG
      ? Math.round(nutrition.fiberG * multiplier * 10) / 10
      : undefined,
  };
}

/**
 * Format date as ISO date string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODateString(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z');
}

/**
 * Get date range for a week starting from given date
 */
export function getWeekDateRange(startDate: Date): { startDate: Date; endDate: Date } {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return { startDate, endDate };
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return toISODateString(date1) === toISODateString(date2);
}
