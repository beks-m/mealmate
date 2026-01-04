import { useEffect, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { useMealPlanStore } from '../../stores/meal-plan-store';
import { SET_GLOBALS_EVENT_TYPE } from '../../types/openai';
import type { MealPlan } from '@mealmate/shared';

export function MealPlanResultCard() {
  const intl = useIntl();
  const { setCurrentPlan } = useMealPlanStore();
  const [mealPlan, setLocalMealPlan] = useState<MealPlan | null>(null);
  const dataLoadedRef = useRef(false);

  const checkToolOutput = useCallback(() => {
    const toolOutput = window.openai?.toolOutput as { mealPlan?: MealPlan } | undefined;
    if (toolOutput?.mealPlan) {
      setLocalMealPlan(toolOutput.mealPlan);
      setCurrentPlan(toolOutput.mealPlan);
      dataLoadedRef.current = true;
      return true;
    }
    return false;
  }, [setCurrentPlan]);

  useEffect(() => {
    if (checkToolOutput()) return;

    const handleGlobalsEvent = () => {
      if (!dataLoadedRef.current) checkToolOutput();
    };
    window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
    return () => window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
  }, [checkToolOutput]);

  if (!mealPlan) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-5 w-32 bg-surface-hover rounded mb-2" />
        <div className="h-4 w-48 bg-surface-hover rounded" />
      </div>
    );
  }

  const mealCount = mealPlan.entries?.length ?? 0;
  // Calculate days from startDate and endDate
  const startDate = new Date(mealPlan.startDate);
  const endDate = new Date(mealPlan.endDate);
  const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 size-10 flex items-center justify-center bg-blue-500/20 text-blue-600 rounded-lg">
          <CalendarIcon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-600 mb-0.5">
            {intl.formatMessage({ id: 'result.mealPlanCreated', defaultMessage: 'Meal plan created!' })}
          </p>
          <h3 className="text-base font-semibold text-primary truncate">
            {mealPlan.name || 'Meal Plan'}
          </h3>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-tertiary">
            <span>{daysCount} days</span>
            <span>{mealCount} meals</span>
          </div>
        </div>
      </div>
      <Link
        to="/meal-plan"
        className="mt-3 block w-full py-2 text-center text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
      >
        {intl.formatMessage({ id: 'result.viewMealPlan', defaultMessage: 'View Meal Plan' })}
      </Link>
    </motion.div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
