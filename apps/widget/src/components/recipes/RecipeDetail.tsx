import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useRecipeStore } from '../../stores/recipe-store';

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const { recipes } = useRecipeStore();

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {intl.formatMessage({ id: 'recipe.notFound' })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {recipe.name}
        </h1>
        {recipe.description && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {recipe.description}
          </p>
        )}
      </div>

      {/* Nutrition Summary */}
      <div className="grid grid-cols-4 gap-4">
        <NutritionBadge
          label={intl.formatMessage({ id: 'nutrition.calories' })}
          value={`${recipe.nutrition.calories}`}
        />
        <NutritionBadge
          label={intl.formatMessage({ id: 'nutrition.protein' })}
          value={`${recipe.nutrition.proteinG}g`}
        />
        <NutritionBadge
          label={intl.formatMessage({ id: 'nutrition.carbs' })}
          value={`${recipe.nutrition.carbsG}g`}
        />
        <NutritionBadge
          label={intl.formatMessage({ id: 'nutrition.fat' })}
          value={`${recipe.nutrition.fatG}g`}
        />
      </div>

      {/* Ingredients */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {intl.formatMessage({ id: 'recipe.ingredients' })}
        </h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <span className="w-2 h-2 bg-gray-400 rounded-full" />
              <span>
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Instructions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {intl.formatMessage({ id: 'recipe.instructions' })}
        </h2>
        <ol className="space-y-3">
          {recipe.instructions.map((step, index) => (
            <li key={index} className="flex gap-3 text-gray-700 dark:text-gray-300">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-medium">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

interface NutritionBadgeProps {
  label: string;
  value: string;
}

function NutritionBadge({ label, value }: NutritionBadgeProps) {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
      <div className="text-lg font-semibold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}
