import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { Dashboard } from './components/Dashboard';
import { RecipeList } from './components/recipes/RecipeList';
import { RecipeDetail } from './components/recipes/RecipeDetail';
import { RecipeEditForm } from './components/recipes/RecipeEditForm';
import { MealPlanView } from './components/meal-plan/MealPlanView';
import { ShoppingListView } from './components/shopping/ShoppingListView';
import { Settings } from './components/Settings';
import { DietaryGoalsSettings } from './components/settings/DietaryGoalsSettings';
import { FamilyMembersSettings } from './components/settings/FamilyMembersSettings';
import { LanguageSettings } from './components/settings/LanguageSettings';
// Result widgets
import { RecipeResultCard } from './components/results/RecipeResultCard';
import { MealPlanResultCard } from './components/results/MealPlanResultCard';
import { ShoppingListResultCard } from './components/results/ShoppingListResultCard';
import { GoalsResultCard } from './components/results/GoalsResultCard';

interface WidgetAppProps {
  view: string;
}

// Map view names to routes
const viewToRoute: Record<string, string> = {
  'dashboard': '/',
  'recipes': '/recipes',
  'recipe-detail': '/recipes/:id',
  'meal-plan': '/meal-plan',
  'shopping-list': '/shopping',
  'settings': '/settings',
  // Result widgets
  'recipe-result': '/recipe-result',
  'meal-plan-result': '/meal-plan-result',
  'shopping-list-result': '/shopping-list-result',
  'goals-result': '/goals-result',
};

export function WidgetApp({ view }: WidgetAppProps) {
  // Get initial route from view prop
  const initialRoute = viewToRoute[view] || '/';

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recipes" element={<RecipeList />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/recipes/:id/edit" element={<RecipeEditForm />} />
        <Route path="/meal-plan" element={<MealPlanView />} />
        <Route path="/shopping" element={<ShoppingListView />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/dietary-goals" element={<DietaryGoalsSettings />} />
        <Route path="/settings/family-members" element={<FamilyMembersSettings />} />
        <Route path="/settings/language" element={<LanguageSettings />} />
        {/* Result widgets */}
        <Route path="/recipe-result" element={<RecipeResultCard />} />
        <Route path="/meal-plan-result" element={<MealPlanResultCard />} />
        <Route path="/shopping-list-result" element={<ShoppingListResultCard />} />
        <Route path="/goals-result" element={<GoalsResultCard />} />
        {/* Redirect to initial view */}
        <Route path="*" element={<Navigate to={initialRoute} replace />} />
      </Routes>
    </Layout>
  );
}
