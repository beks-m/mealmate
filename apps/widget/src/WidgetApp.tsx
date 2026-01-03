import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { Dashboard } from './components/Dashboard';
import { RecipeList } from './components/recipes/RecipeList';
import { RecipeDetail } from './components/recipes/RecipeDetail';
import { MealPlanView } from './components/meal-plan/MealPlanView';
import { ShoppingListView } from './components/shopping/ShoppingListView';
import { Settings } from './components/Settings';

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
        <Route path="/meal-plan" element={<MealPlanView />} />
        <Route path="/shopping" element={<ShoppingListView />} />
        <Route path="/settings" element={<Settings />} />
        {/* Redirect to initial view */}
        <Route path="*" element={<Navigate to={initialRoute} replace />} />
      </Routes>
    </Layout>
  );
}
