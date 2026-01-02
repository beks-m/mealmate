import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { Dashboard } from './components/Dashboard';
import { RecipeList } from './components/recipes/RecipeList';
import { RecipeDetail } from './components/recipes/RecipeDetail';
import { MealPlanView } from './components/meal-plan/MealPlanView';
import { ShoppingListView } from './components/shopping/ShoppingListView';
import { Settings } from './components/Settings';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recipes" element={<RecipeList />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/meal-plan" element={<MealPlanView />} />
        <Route path="/shopping" element={<ShoppingListView />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
