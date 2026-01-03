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

export function WidgetApp({ view }: WidgetAppProps) {
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'recipes':
        return <RecipeList />;
      case 'recipe-detail':
        return <RecipeDetail />;
      case 'meal-plan':
        return <MealPlanView />;
      case 'shopping-list':
        return <ShoppingListView />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return <Layout>{renderView()}</Layout>;
}
