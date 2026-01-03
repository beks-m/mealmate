import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { MealPlansService } from '../meal-plans/meal-plans.service.js';
import { RecipesService } from '../recipes/recipes.service.js';

interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  checked: boolean;
  recipe_ids: string[];
}

interface ShoppingList {
  id: string;
  user_id: string;
  meal_plan_id: string | null;
  name: string;
  items: ShoppingItem[];
  created_at: string;
  updated_at: string;
}

// Category mapping for ingredients
const INGREDIENT_CATEGORIES: Record<string, string> = {
  // Produce
  tomato: 'produce',
  onion: 'produce',
  garlic: 'produce',
  lettuce: 'produce',
  spinach: 'produce',
  carrot: 'produce',
  potato: 'produce',
  apple: 'produce',
  banana: 'produce',
  lemon: 'produce',
  // Dairy
  milk: 'dairy',
  cheese: 'dairy',
  butter: 'dairy',
  yogurt: 'dairy',
  cream: 'dairy',
  egg: 'dairy',
  // Meat
  chicken: 'meat',
  beef: 'meat',
  pork: 'meat',
  fish: 'meat',
  salmon: 'meat',
  // Pantry
  flour: 'pantry',
  sugar: 'pantry',
  salt: 'pantry',
  pepper: 'pantry',
  oil: 'pantry',
  rice: 'pantry',
  pasta: 'pantry',
  // Frozen
  frozen: 'frozen',
  // Bakery
  bread: 'bakery',
};

function categorizeIngredient(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [keyword, category] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (lowerName.includes(keyword)) {
      return category;
    }
  }
  return 'other';
}

@Injectable()
export class ShoppingListsService {
  private shoppingLists: ShoppingList[] = [];

  constructor(
    private readonly supabase: SupabaseService,
    private readonly mealPlansService: MealPlansService,
    private readonly recipesService: RecipesService,
  ) {}

  async generateFromMealPlan(mealPlanId: string, name?: string): Promise<ShoppingList> {
    const mealPlan = await this.mealPlansService.findById(mealPlanId);
    if (!mealPlan) {
      throw new Error(`Meal plan not found: ${mealPlanId}`);
    }

    // Collect all recipe IDs from the meal plan
    const recipeIds = new Set<string>();
    for (const day of mealPlan.days) {
      for (const meal of day.meals) {
        if (meal.recipe_id) {
          recipeIds.add(meal.recipe_id);
        }
      }
    }

    // Aggregate ingredients from all recipes
    const ingredientMap = new Map<string, ShoppingItem>();

    for (const recipeId of recipeIds) {
      const recipe = await this.recipesService.findById(recipeId);
      if (!recipe) continue;

      for (const ingredient of recipe.ingredients) {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit.toLowerCase()}`;
        const existing = ingredientMap.get(key);

        if (existing) {
          existing.amount += ingredient.quantity;
          if (!existing.recipe_ids.includes(recipeId)) {
            existing.recipe_ids.push(recipeId);
          }
        } else {
          ingredientMap.set(key, {
            id: crypto.randomUUID(),
            name: ingredient.name,
            amount: ingredient.quantity,
            unit: ingredient.unit,
            category: categorizeIngredient(ingredient.name),
            checked: false,
            recipe_ids: [recipeId],
          });
        }
      }
    }

    const items = Array.from(ingredientMap.values()).sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });

    const shoppingList: ShoppingList = {
      id: crypto.randomUUID(),
      user_id: '00000000-0000-0000-0000-000000000001',
      meal_plan_id: mealPlanId,
      name: name ?? `Shopping list for ${mealPlan.name}`,
      items,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('shopping_lists')
        .insert(shoppingList)
        .select()
        .single();

      if (error) throw error;
      return data as ShoppingList;
    }

    this.shoppingLists.push(shoppingList);
    return shoppingList;
  }

  async findById(id: string): Promise<ShoppingList | null> {
    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('shopping_lists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null;
      return data as ShoppingList;
    }

    return this.shoppingLists.find((sl) => sl.id === id) ?? null;
  }

  async findAll(): Promise<ShoppingList[]> {
    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('shopping_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShoppingList[];
    }

    return [...this.shoppingLists].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async toggleItemById(listId: string, itemId: string): Promise<ShoppingList | null> {
    const list = await this.findById(listId);
    if (!list) return null;

    const item = list.items.find((i) => i.id === itemId);
    if (!item) return null;

    item.checked = !item.checked;

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('shopping_lists')
        .update({ items: list.items, updated_at: new Date().toISOString() })
        .eq('id', listId)
        .select()
        .single();

      if (error) throw error;
      return data as ShoppingList;
    }

    return list;
  }

  async toggleItem(listId: string, itemIndex: number, checked: boolean): Promise<ShoppingList | null> {
    const list = await this.findById(listId);
    if (!list) return null;

    if (itemIndex < 0 || itemIndex >= list.items.length) {
      throw new Error(`Item index ${itemIndex} out of bounds`);
    }

    const item = list.items[itemIndex];
    if (item) {
      item.checked = checked;
    }

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('shopping_lists')
        .update({ items: list.items, updated_at: new Date().toISOString() })
        .eq('id', listId)
        .select()
        .single();

      if (error) throw error;
      return data as ShoppingList;
    }

    return list;
  }
}
