import { useIntl } from 'react-intl';
import { useShoppingStore } from '../../stores/shopping-store';
import { CATEGORY_LABELS } from '@mealmate/shared';
import type { IngredientCategory } from '@mealmate/shared';

export function ShoppingListView() {
  const intl = useIntl();
  const { currentList, isLoading, toggleItem } = useShoppingStore();
  const locale = intl.locale as 'en' | 'ru';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500 dark:text-gray-400">
          {intl.formatMessage({ id: 'common.loading' })}
        </div>
      </div>
    );
  }

  if (!currentList || currentList.items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {intl.formatMessage({ id: 'nav.shopping' })}
        </h1>
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            {intl.formatMessage({ id: 'shopping.empty' })}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            {intl.formatMessage({ id: 'shopping.emptyHint' })}
          </p>
        </div>
      </div>
    );
  }

  // Group items by category
  const itemsByCategory = currentList.items.reduce(
    (acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<IngredientCategory, typeof currentList.items>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {intl.formatMessage({ id: 'nav.shopping' })}
      </h1>

      <div className="space-y-4">
        {(Object.entries(itemsByCategory) as [IngredientCategory, typeof currentList.items][]).map(
          ([category, items]) => (
            <section
              key={category}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                {CATEGORY_LABELS[category][locale]}
              </h2>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                    <span
                      className={`flex-1 ${
                        item.isChecked
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {item.quantity && item.unit
                        ? `${item.quantity} ${item.unit} `
                        : ''}
                      {locale === 'ru' && item.nameRu ? item.nameRu : item.name}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
      </div>
    </div>
  );
}
