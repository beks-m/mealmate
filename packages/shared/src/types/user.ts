export type Locale = 'en' | 'ru';

export type DietaryGoal = 'weight_loss' | 'maintenance' | 'muscle_gain' | 'custom';

export interface UserProfile {
  id: string;
  displayName?: string;
  locale: Locale;
  dailyCalories?: number;
  dailyProteinG?: number;
  dailyCarbsG?: number;
  dailyFatG?: number;
  dietaryGoal?: DietaryGoal;
  dietaryRestrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  id: string;
  profileId: string;
  name: string;
  dailyCalories?: number;
  dailyProteinG?: number;
  dailyCarbsG?: number;
  dailyFatG?: number;
  dietaryRestrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  locale?: Locale;
  dailyCalories?: number;
  dailyProteinG?: number;
  dailyCarbsG?: number;
  dailyFatG?: number;
  dietaryGoal?: DietaryGoal;
  dietaryRestrictions?: string[];
}

export interface CreateFamilyMemberInput {
  name: string;
  dailyCalories?: number;
  dailyProteinG?: number;
  dailyCarbsG?: number;
  dailyFatG?: number;
  dietaryRestrictions?: string[];
}

export interface UpdateFamilyMemberInput {
  name?: string;
  dailyCalories?: number;
  dailyProteinG?: number;
  dailyCarbsG?: number;
  dailyFatG?: number;
  dietaryRestrictions?: string[];
}
