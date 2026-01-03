import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';

interface DietaryGoals {
  daily_calories?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  fiber_grams?: number;
}

interface UserPreferences {
  language: 'en' | 'ru';
  cuisines?: string[];
  avoid_ingredients?: string[];
}

interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  dietary_restrictions: string[];
  preferences: {
    portion_size?: 'small' | 'regular' | 'large';
    allergies?: string[];
  } | null;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string | null;
  dietary_goals: DietaryGoals | null;
  preferences: UserPreferences | null;
  created_at: string;
  updated_at: string;
}

interface CreateUserInput {
  name: string;
  email?: string;
  preferences?: UserPreferences;
  dietary_goals?: DietaryGoals;
}

interface AddFamilyMemberInput {
  name: string;
  dietary_restrictions?: string[];
  preferences?: {
    portion_size?: 'small' | 'regular' | 'large';
    allergies?: string[];
  };
}

interface UserProfile {
  id: string;
  name: string;
  dietary_goals: DietaryGoals | null;
  dietary_restrictions: string[];
  preferences: UserPreferences | null;
  family_members: FamilyMember[];
}

@Injectable()
export class UsersService {
  private users: User[] = [];
  private familyMembers: FamilyMember[] = [];
  private dietaryRestrictions: Map<string, string[]> = new Map();

  // Default user ID for MVP (no auth)
  private readonly defaultUserId = '00000000-0000-0000-0000-000000000001';

  constructor(private readonly supabase: SupabaseService) {
    // Create a default demo user
    this.users.push({
      id: this.defaultUserId,
      name: 'Demo User',
      email: null,
      dietary_goals: {
        daily_calories: 2000,
        protein_grams: 150,
        carbs_grams: 200,
        fat_grams: 65,
      },
      preferences: { language: 'en' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async getProfile(userId?: string): Promise<UserProfile> {
    const id = userId ?? this.defaultUserId;
    const user = await this.findById(id);
    const familyMembers = await this.getFamilyMembers(id);

    if (!user) {
      // Return default profile for anonymous users
      return {
        id,
        name: 'Guest',
        dietary_goals: {
          daily_calories: 2000,
          protein_grams: 150,
          carbs_grams: 200,
          fat_grams: 65,
        },
        dietary_restrictions: this.dietaryRestrictions.get(id) ?? [],
        preferences: { language: 'en' },
        family_members: familyMembers,
      };
    }

    return {
      id: user.id,
      name: user.name,
      dietary_goals: user.dietary_goals,
      dietary_restrictions: this.dietaryRestrictions.get(id) ?? [],
      preferences: user.preferences,
      family_members: familyMembers,
    };
  }

  async updateGoals(goals: {
    daily_calories?: number;
    protein_grams?: number;
    carbs_grams?: number;
    fat_grams?: number;
    dietary_restrictions?: string[];
  }, userId?: string): Promise<DietaryGoals> {
    const id = userId ?? this.defaultUserId;

    // Handle dietary restrictions separately
    if (goals.dietary_restrictions) {
      this.dietaryRestrictions.set(id, goals.dietary_restrictions);
    }

    const dietaryGoals: DietaryGoals = {
      daily_calories: goals.daily_calories,
      protein_grams: goals.protein_grams,
      carbs_grams: goals.carbs_grams,
      fat_grams: goals.fat_grams,
    };

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('users')
        .update({ dietary_goals: dietaryGoals, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return (data as User).dietary_goals ?? dietaryGoals;
    }

    const user = this.users.find((u) => u.id === id);
    if (user) {
      user.dietary_goals = { ...user.dietary_goals, ...dietaryGoals };
      user.updated_at = new Date().toISOString();
      return user.dietary_goals;
    }

    return dietaryGoals;
  }

  async findById(id: string): Promise<User | null> {
    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null;
      return data as User;
    }

    return this.users.find((u) => u.id === id) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email ?? null,
      dietary_goals: input.dietary_goals ?? null,
      preferences: input.preferences ?? { language: 'en' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('users')
        .insert(user)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    }

    this.users.push(user);
    return user;
  }

  async updatePreferences(userId: string, preferences: UserPreferences): Promise<User | null> {
    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('users')
        .update({ preferences, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) return null;
      return data as User;
    }

    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;
    user.preferences = preferences;
    user.updated_at = new Date().toISOString();
    return user;
  }

  async addFamilyMember(userId: string, input: AddFamilyMemberInput): Promise<FamilyMember> {
    const member: FamilyMember = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: input.name,
      dietary_restrictions: input.dietary_restrictions ?? [],
      preferences: input.preferences ?? null,
      created_at: new Date().toISOString(),
    };

    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('family_members')
        .insert(member)
        .select()
        .single();

      if (error) throw error;
      return data as FamilyMember;
    }

    this.familyMembers.push(member);
    return member;
  }

  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    if (this.supabase.isConfigured()) {
      const { data, error } = await this.supabase
        .getClient()
        .from('family_members')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as FamilyMember[];
    }

    return this.familyMembers.filter((m) => m.user_id === userId);
  }

  async removeFamilyMember(memberId: string): Promise<boolean> {
    if (this.supabase.isConfigured()) {
      const { error } = await this.supabase
        .getClient()
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      return true;
    }

    const index = this.familyMembers.findIndex((m) => m.id === memberId);
    if (index === -1) return false;
    this.familyMembers.splice(index, 1);
    return true;
  }
}
