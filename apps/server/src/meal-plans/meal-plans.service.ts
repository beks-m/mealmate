import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';

interface Meal {
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_id?: string;
  recipe_title?: string;
  notes?: string;
}

interface MealPlanDay {
  date: string;
  meals: Meal[];
}

interface DietaryGoals {
  daily_calories?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
}

interface CreateMealPlanInput {
  name: string;
  start_date: string;
  days: number;
  goals?: DietaryGoals;
  family_member_ids?: string[];
  meals: Meal[];
}

interface MealPlan {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  days: MealPlanDay[];
  goals: DietaryGoals | null;
  family_member_ids: string[];
  created_at: string;
  updated_at: string;
}

@Injectable()
export class MealPlansService {
  private mealPlans: MealPlan[] = [];

  constructor(private readonly supabase: SupabaseService) {}

  async create(input: CreateMealPlanInput): Promise<MealPlan> {
    // Calculate end date
    const startDate = new Date(input.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + input.days - 1);

    // Group meals by date
    const daysMap = new Map<string, Meal[]>();
    for (const meal of input.meals) {
      const existing = daysMap.get(meal.date) ?? [];
      existing.push(meal);
      daysMap.set(meal.date, existing);
    }

    const days: MealPlanDay[] = Array.from(daysMap.entries()).map(([date, meals]) => ({
      date,
      meals,
    }));

    const mealPlan: MealPlan = {
      id: crypto.randomUUID(),
      user_id: 'demo-user',
      name: input.name,
      start_date: input.start_date,
      end_date: endDate.toISOString().split('T')[0] as string,
      days,
      goals: input.goals ?? null,
      family_member_ids: input.family_member_ids ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('meal_plans')
        .insert(mealPlan)
        .select()
        .single();

      if (error) throw error;
      return data as MealPlan;
    }

    this.mealPlans.push(mealPlan);
    return mealPlan;
  }

  async findAll(): Promise<MealPlan[]> {
    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('meal_plans')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as MealPlan[];
    }

    return [...this.mealPlans].sort(
      (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );
  }

  async findById(id: string): Promise<MealPlan | null> {
    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null;
      return data as MealPlan;
    }

    return this.mealPlans.find((mp) => mp.id === id) ?? null;
  }

  async findCurrent(): Promise<MealPlan | null> {
    const today = new Date().toISOString().split('T')[0] as string;

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('meal_plans')
        .select('*')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data as MealPlan;
    }

    return this.mealPlans.find(
      (mp) => mp.start_date <= today! && mp.end_date >= today!
    ) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    if (this.supabase.isConfigured()) {
      const { error } = await this.supabase
        .getClient()
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const index = this.mealPlans.findIndex((mp) => mp.id === id);
    if (index === -1) return false;
    this.mealPlans.splice(index, 1);
    return true;
  }
}
