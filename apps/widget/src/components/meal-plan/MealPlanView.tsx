import { useIntl } from 'react-intl';
import { useMealPlanStore } from '../../stores/meal-plan-store';

export function MealPlanView() {
  const intl = useIntl();
  const { currentPlan, isLoading } = useMealPlanStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500 dark:text-gray-400">
          {intl.formatMessage({ id: 'common.loading' })}
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {intl.formatMessage({ id: 'nav.mealPlan' })}
        </h1>
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            {intl.formatMessage({ id: 'mealPlan.empty' })}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            {intl.formatMessage({ id: 'mealPlan.emptyHint' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {intl.formatMessage({ id: 'nav.mealPlan' })}
      </h1>

      {/* Calendar placeholder */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          {intl.formatMessage({ id: 'mealPlan.calendarPlaceholder' })}
        </p>
      </div>
    </div>
  );
}
