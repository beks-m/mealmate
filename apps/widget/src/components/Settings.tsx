import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function Settings() {
  const intl = useIntl();

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-semibold text-primary">
          {intl.formatMessage({ id: 'nav.settings' })}
        </h1>
        <p className="mt-1 text-sm text-tertiary">
          {intl.formatMessage({ id: 'settings.description', defaultMessage: 'Customize your meal planning experience' })}
        </p>
      </motion.div>

      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Dietary Goals */}
        <SettingsCard
          icon={<TargetIcon className="size-5" />}
          title={intl.formatMessage({ id: 'settings.dietaryGoals' })}
          description={intl.formatMessage({ id: 'settings.dietaryGoalsDescription' })}
          color="emerald"
        />

        {/* Family Members */}
        <SettingsCard
          icon={<UsersIcon className="size-5" />}
          title={intl.formatMessage({ id: 'settings.familyMembers' })}
          description={intl.formatMessage({ id: 'settings.familyMembersDescription' })}
          color="blue"
        />

        {/* Language */}
        <SettingsCard
          icon={<GlobeIcon className="size-5" />}
          title={intl.formatMessage({ id: 'settings.language' })}
          description={intl.formatMessage({ id: 'settings.languageDescription' })}
          color="purple"
        />
      </motion.div>

      {/* App info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-4 text-center"
      >
        <p className="text-xs text-tertiary">
          MealMate v1.0.0
        </p>
      </motion.div>
    </div>
  );
}

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'emerald' | 'blue' | 'purple';
}

const colorClasses = {
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

function SettingsCard({ icon, title, description, color }: SettingsCardProps) {
  return (
    <motion.div variants={item}>
      <button className="group w-full flex items-center gap-3 p-3 rounded-xl border border-subtle bg-surface hover:bg-surface-hover transition-colors text-left">
        <span className={`flex-shrink-0 p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-primary group-hover:text-link transition-colors">
            {title}
          </h3>
          <p className="text-sm text-tertiary line-clamp-1">{description}</p>
        </div>
        <ChevronRightIcon className="flex-shrink-0 size-4 text-tertiary group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
      </button>
    </motion.div>
  );
}

// Icons
function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
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
