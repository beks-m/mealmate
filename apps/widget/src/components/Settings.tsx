import { useIntl } from 'react-intl';

export function Settings() {
  const intl = useIntl();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {intl.formatMessage({ id: 'nav.settings' })}
      </h1>

      <div className="space-y-4">
        {/* Dietary Goals */}
        <section className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            {intl.formatMessage({ id: 'settings.dietaryGoals' })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {intl.formatMessage({ id: 'settings.dietaryGoalsDescription' })}
          </p>
        </section>

        {/* Family Members */}
        <section className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            {intl.formatMessage({ id: 'settings.familyMembers' })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {intl.formatMessage({ id: 'settings.familyMembersDescription' })}
          </p>
        </section>

        {/* Language */}
        <section className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            {intl.formatMessage({ id: 'settings.language' })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {intl.formatMessage({ id: 'settings.languageDescription' })}
          </p>
        </section>
      </div>
    </div>
  );
}
