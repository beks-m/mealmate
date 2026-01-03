import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';

interface CreateRecipeInput {
  title: string;
  description?: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  category: string;
  tags?: string[];
}

interface FindRecipesFilter {
  category?: string;
  search?: string;
  favorites_only?: boolean;
  limit?: number;
}

// Database format (snake_case, different field names)
interface DbRecipe {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  category: string;
  tags: string[];
  image_url: string | null;
  is_favorite: boolean;
  source: 'ai_generated' | 'manual' | 'imported';
  created_at: string;
  updated_at: string;
}

// Shared format (camelCase, used by frontend)
interface Recipe {
  id: string;
  profileId: string;
  name: string;
  description?: string;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    sortOrder: number;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
  };
  servings: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  isFavorite: boolean;
  source: 'ai_generated' | 'manual' | 'imported';
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RecipesService {
  // In-memory store for development without Supabase
  private recipes: Recipe[] = [];

  constructor(private readonly supabase: SupabaseService) {}

  // Transform database format to shared Recipe type format
  private transformDbToShared = (dbRecipe: DbRecipe): Recipe => ({
    id: dbRecipe.id,
    profileId: dbRecipe.user_id,
    name: dbRecipe.title,
    description: dbRecipe.description ?? undefined,
    ingredients: (dbRecipe.ingredients || []).map((ing, idx) => ({
      id: `${dbRecipe.id}-ing-${idx}`,
      name: ing.name,
      quantity: ing.amount,
      unit: ing.unit,
      category: 'other',
      sortOrder: idx,
    })),
    instructions: dbRecipe.instructions || [],
    nutrition: {
      calories: dbRecipe.nutrition?.calories ?? 0,
      proteinG: dbRecipe.nutrition?.protein ?? 0,
      carbsG: dbRecipe.nutrition?.carbs ?? 0,
      fatG: dbRecipe.nutrition?.fat ?? 0,
      fiberG: dbRecipe.nutrition?.fiber,
    },
    servings: dbRecipe.servings,
    prepTimeMinutes: dbRecipe.prep_time_minutes,
    cookTimeMinutes: dbRecipe.cook_time_minutes,
    isFavorite: dbRecipe.is_favorite,
    source: dbRecipe.source,
    tags: dbRecipe.tags || [],
    imageUrl: dbRecipe.image_url ?? undefined,
    createdAt: new Date(dbRecipe.created_at),
    updatedAt: new Date(dbRecipe.updated_at),
  });

  async create(input: CreateRecipeInput): Promise<Recipe> {
    // Create database format record
    const dbRecipe: DbRecipe = {
      id: crypto.randomUUID(),
      user_id: '00000000-0000-0000-0000-000000000001', // TODO: Get from auth context
      title: input.title,
      description: input.description ?? null,
      ingredients: input.ingredients,
      instructions: input.instructions,
      nutrition: input.nutrition,
      servings: input.servings,
      prep_time_minutes: input.prep_time_minutes,
      cook_time_minutes: input.cook_time_minutes,
      category: input.category,
      tags: input.tags ?? [],
      image_url: null,
      is_favorite: false,
      source: 'ai_generated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('recipes')
        .insert(dbRecipe)
        .select()
        .single();

      if (error) throw error;
      return this.transformDbToShared(data as DbRecipe);
    }

    // Fallback to in-memory - store and return shared format
    const sharedRecipe = this.transformDbToShared(dbRecipe);
    this.recipes.push(sharedRecipe);
    return sharedRecipe;
  }

  async findAll(filter: FindRecipesFilter = {}): Promise<Recipe[]> {
    if (this.supabase.isConfigured()) {
      let query = this.supabase.getClient().from('recipes').select('*');

      if (filter.category) {
        query = query.eq('category', filter.category);
      }

      if (filter.favorites_only) {
        query = query.eq('is_favorite', true);
      }

      if (filter.search) {
        query = query.ilike('title', `%${filter.search}%`);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      // Transform database format to shared Recipe type format
      return (data as DbRecipe[]).map(this.transformDbToShared);
    }

    // Fallback to in-memory filtering (recipes stored in shared format)
    let result = [...this.recipes];

    if (filter.category) {
      // Note: category filtering not available in shared format, skip for in-memory
    }

    if (filter.favorites_only) {
      result = result.filter((r) => r.isFavorite);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(search));
    }

    if (filter.limit) {
      result = result.slice(0, filter.limit);
    }

    return result;
  }

  async findById(id: string): Promise<Recipe | null> {
    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null;
      return this.transformDbToShared(data as DbRecipe);
    }

    return this.recipes.find((r) => r.id === id) ?? null;
  }

  async toggleFavorite(id: string): Promise<Recipe | null> {
    const recipe = await this.findById(id);
    if (!recipe) return null;

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('recipes')
        .update({ is_favorite: !recipe.isFavorite })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.transformDbToShared(data as DbRecipe);
    }

    recipe.isFavorite = !recipe.isFavorite;
    return recipe;
  }

  async delete(id: string): Promise<boolean> {
    if (this.supabase.isConfigured()) {
      const { error } = await this.supabase
        .getClient()
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const index = this.recipes.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.recipes.splice(index, 1);
    return true;
  }
}
