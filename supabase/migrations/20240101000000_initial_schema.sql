-- MealMate Initial Schema
-- This migration creates all tables needed for the meal planning app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  dietary_goals JSONB DEFAULT NULL,
  preferences JSONB DEFAULT '{"language": "en"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dietary_restrictions TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_family_members_user_id ON family_members(user_id);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  nutrition JSONB NOT NULL DEFAULT '{}',
  servings INTEGER NOT NULL DEFAULT 1,
  prep_time_minutes INTEGER NOT NULL DEFAULT 0,
  cook_time_minutes INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  source TEXT NOT NULL DEFAULT 'ai_generated' CHECK (source IN ('ai_generated', 'manual', 'imported')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_is_favorite ON recipes(is_favorite);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);

-- Full-text search index for recipes
CREATE INDEX idx_recipes_title_search ON recipes USING gin(to_tsvector('english', title));

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days JSONB NOT NULL DEFAULT '[]',
  goals JSONB DEFAULT NULL,
  family_member_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_dates ON meal_plans(start_date, end_date);

-- Shopping lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_meal_plan_id ON shopping_lists(meal_plan_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_insert_own ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Family members policies
CREATE POLICY family_members_select_own ON family_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY family_members_insert_own ON family_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY family_members_update_own ON family_members
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY family_members_delete_own ON family_members
  FOR DELETE USING (user_id = auth.uid());

-- Recipes policies
CREATE POLICY recipes_select_own ON recipes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY recipes_insert_own ON recipes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY recipes_update_own ON recipes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY recipes_delete_own ON recipes
  FOR DELETE USING (user_id = auth.uid());

-- Meal plans policies
CREATE POLICY meal_plans_select_own ON meal_plans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY meal_plans_insert_own ON meal_plans
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY meal_plans_update_own ON meal_plans
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY meal_plans_delete_own ON meal_plans
  FOR DELETE USING (user_id = auth.uid());

-- Shopping lists policies
CREATE POLICY shopping_lists_select_own ON shopping_lists
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY shopping_lists_insert_own ON shopping_lists
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY shopping_lists_update_own ON shopping_lists
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY shopping_lists_delete_own ON shopping_lists
  FOR DELETE USING (user_id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles with dietary goals and preferences';
COMMENT ON TABLE family_members IS 'Family members for meal planning (portion sizes, restrictions)';
COMMENT ON TABLE recipes IS 'User''s saved recipes with nutrition info';
COMMENT ON TABLE meal_plans IS 'Weekly or multi-day meal plans';
COMMENT ON TABLE shopping_lists IS 'Shopping lists generated from meal plans';
