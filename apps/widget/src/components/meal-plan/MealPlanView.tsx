import { useEffect, useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { useMealPlanStore } from '../../stores/meal-plan-store';
import { SET_GLOBALS_EVENT_TYPE } from '../../types/openai';
import type { MealPlan } from '@mealmate/shared';

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export function MealPlanView() {
  const intl = useIntl();
  const { currentPlan, isLoading, setCurrentPlan, setLoading } = useMealPlanStore();
  const dataLoadedRef = useRef(false);

  // Check for toolOutput data - poll since it might not be available immediately
  // ChatGPT injects window.openai.toolOutput after the widget mounts
  const checkToolOutput = useCallback(() => {
    const toolOutput = window.openai?.toolOutput as { mealPlan?: MealPlan } | undefined;

    if (toolOutput?.mealPlan) {
      setCurrentPlan(toolOutput.mealPlan);
      setLoading(false);
      dataLoadedRef.current = true;
      return true;
    }
    return false;
  }, [setCurrentPlan, setLoading]);

  // Load meal plan from window.openai.toolOutput on mount via event listener
  useEffect(() => {
    // Try immediately in case data is already available
    if (checkToolOutput()) {
      return;
    }

    // Listen for SET_GLOBALS_EVENT when ChatGPT sets toolOutput
    const handleGlobalsEvent = () => {
      if (!dataLoadedRef.current) {
        checkToolOutput();
      }
    };
    window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);

    return () => {
      window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
    };
  }, [checkToolOutput]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Header intl={intl} />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse p-4 rounded-xl border border-subtle bg-surface"
            >
              <div className="h-4 w-24 bg-surface-hover rounded mb-3" />
              <div className="h-5 w-3/4 bg-surface-hover rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="space-y-4">
        <Header intl={intl} />
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 text-center rounded-xl border border-dashed border-subtle bg-surface"
        >
          <CalendarEmptyIcon className="size-10 mx-auto text-tertiary mb-3" />
          <p className="text-secondary font-medium">
            {intl.formatMessage({ id: 'mealPlan.empty' })}
          </p>
          <p className="mt-1 text-sm text-tertiary">
            {intl.formatMessage({ id: 'mealPlan.emptyHint' })}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header intl={intl} />

      {/* Week navigation */}
      <motion.div
        {...fadeIn}
        className="flex items-center justify-between p-3 rounded-xl border border-subtle bg-surface"
      >
        <button className="p-1.5 text-tertiary hover:text-secondary rounded-lg hover:bg-surface-hover transition-colors">
          <ChevronLeftIcon className="size-4" />
        </button>
        <span className="text-sm font-medium text-primary">
          {intl.formatMessage({ id: 'mealPlan.thisWeek', defaultMessage: 'This Week' })}
        </span>
        <button className="p-1.5 text-tertiary hover:text-secondary rounded-lg hover:bg-surface-hover transition-colors">
          <ChevronRightIcon className="size-4" />
        </button>
      </motion.div>

      {/* Meal plan entries */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-3"
      >
        {currentPlan.entries.length > 0 ? (
          currentPlan.entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded-xl border border-subtle bg-surface"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-tertiary uppercase">
                  {entry.mealType}
                </span>
                <span className="text-xs text-tertiary">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-primary font-medium">{entry.recipeId}</p>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl border border-subtle bg-surface">
            <p className="text-secondary text-center">
              {intl.formatMessage({ id: 'mealPlan.calendarPlaceholder' })}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Header({ intl }: { intl: ReturnType<typeof useIntl> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <h1 className="text-xl font-semibold text-primary">
        {intl.formatMessage({ id: 'nav.mealPlan' })}
      </h1>
    </motion.div>
  );
}

// Icons
function CalendarEmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6" />
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
