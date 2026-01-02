import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const intl = useIntl();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {intl.formatMessage({ id: 'app.title' })}
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <DashboardCard
          title={intl.formatMessage({ id: 'nav.recipes' })}
          description={intl.formatMessage({ id: 'dashboard.recipesDescription' })}
          href="/recipes"
        />
        <DashboardCard
          title={intl.formatMessage({ id: 'nav.mealPlan' })}
          description={intl.formatMessage({ id: 'dashboard.mealPlanDescription' })}
          href="/meal-plan"
        />
        <DashboardCard
          title={intl.formatMessage({ id: 'nav.shopping' })}
          description={intl.formatMessage({ id: 'dashboard.shoppingDescription' })}
          href="/shopping"
        />
      </div>

      {/* Tip */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {intl.formatMessage({ id: 'dashboard.tip' })}
        </p>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
}

function DashboardCard({ title, description, href }: DashboardCardProps) {
  return (
    <Link
      to={href}
      className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}
