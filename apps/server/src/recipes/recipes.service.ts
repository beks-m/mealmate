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

interface Recipe extends CreateRecipeInput {
  id: string;
  user_id: string;
  is_favorite: boolean;
  source: 'ai_generated' | 'manual' | 'imported';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class RecipesService {
  // In-memory store for development without Supabase
  private recipes: Recipe[] = [];

  constructor(private readonly supabase: SupabaseService) {}

  async create(input: CreateRecipeInput): Promise<Recipe> {
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      user_id: '00000000-0000-0000-0000-000000000001', // TODO: Get from auth context
      ...input,
      tags: input.tags ?? [],
      is_favorite: false,
      source: 'ai_generated',
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('recipes')
        .insert(recipe)
        .select()
        .single();

      if (error) throw error;
      return data as Recipe;
    }

    // Fallback to in-memory
    this.recipes.push(recipe);
    return recipe;
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
      return data as Recipe[];
    }

    // Fallback to in-memory filtering
    let result = [...this.recipes];

    if (filter.category) {
      result = result.filter((r) => r.category === filter.category);
    }

    if (filter.favorites_only) {
      result = result.filter((r) => r.is_favorite);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(search));
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
      return data as Recipe;
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
        .update({ is_favorite: !recipe.is_favorite })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Recipe;
    }

    recipe.is_favorite = !recipe.is_favorite;
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
