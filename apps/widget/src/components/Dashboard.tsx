import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ComponentType } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function Dashboard() {
  const intl = useIntl();

  return (
    <div className="space-y-5">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-semibold text-primary">
          {intl.formatMessage({ id: 'app.title' })}
        </h1>
        <p className="mt-1 text-sm text-tertiary">
          {intl.formatMessage({ id: 'dashboard.subtitle', defaultMessage: 'Your personal meal planning assistant' })}
        </p>
      </motion.div>

      {/* Quick action cards */}
      <motion.div
        className="grid gap-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <DashboardCard
          title={intl.formatMessage({ id: 'nav.recipes' })}
          description={intl.formatMessage({ id: 'dashboard.recipesDescription' })}
          href="/recipes"
          icon={BookIcon}
          color="emerald"
        />
        <DashboardCard
          title={intl.formatMessage({ id: 'nav.mealPlan' })}
          description={intl.formatMessage({ id: 'dashboard.mealPlanDescription' })}
          href="/meal-plan"
          icon={CalendarIcon}
          color="blue"
        />
        <DashboardCard
          title={intl.formatMessage({ id: 'nav.shopping' })}
          description={intl.formatMessage({ id: 'dashboard.shoppingDescription' })}
          href="/shopping"
          icon={CartIcon}
          color="amber"
        />
      </motion.div>

      {/* Tip card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
      >
        <span className="flex-shrink-0 mt-0.5">
          <LightbulbIcon className="size-4 text-primary" />
        </span>
        <p className="text-sm text-secondary leading-relaxed">
          {intl.formatMessage({ id: 'dashboard.tip' })}
        </p>
      </motion.div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'amber';
}

const colorClasses = {
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

function DashboardCard({ title, description, href, icon: Icon, color }: DashboardCardProps) {
  return (
    <motion.div variants={item}>
      <Link
        to={href}
        className="group flex items-center gap-3 p-3 rounded-xl border border-subtle bg-surface hover:bg-surface-hover transition-colors"
      >
        <span className={`flex-shrink-0 p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-primary group-hover:text-link transition-colors">
            {title}
          </h3>
          <p className="text-sm text-tertiary line-clamp-1">{description}</p>
        </div>
        <ChevronRightIcon className="flex-shrink-0 size-4 text-tertiary group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
      </Link>
    </motion.div>
  );
}

// Icon components
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6" />
    </svg>
  );
}
