import { useIntl } from 'react-intl';
import { useRecipeStore } from '../../stores/recipe-store';

export function RecipeList() {
  const intl = useIntl();
  const { recipes, isLoading } = useRecipeStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500 dark:text-gray-400">
          {intl.formatMessage({ id: 'common.loading' })}
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {intl.formatMessage({ id: 'nav.recipes' })}
        </h1>
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            {intl.formatMessage({ id: 'recipes.empty' })}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            {intl.formatMessage({ id: 'recipes.emptyHint' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {intl.formatMessage({ id: 'nav.recipes' })}
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

import type { Recipe } from '@mealmate/shared';
import { Link } from 'react-router-dom';

interface RecipeCardProps {
  recipe: Recipe;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  const intl = useIntl();

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white">
        {recipe.name}
      </h3>
      {recipe.description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {recipe.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
          {intl.formatMessage({ id: 'recipe.calories' }, { count: recipe.nutrition.calories })}
        </span>
        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
          {recipe.nutrition.proteinG}g {intl.formatMessage({ id: 'nutrition.protein' })}
        </span>
      </div>
    </Link>
  );
}
