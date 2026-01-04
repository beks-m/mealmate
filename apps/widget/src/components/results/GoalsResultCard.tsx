import { useEffect, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { SET_GLOBALS_EVENT_TYPE } from '../../types/openai';

interface DietaryGoals {
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export function GoalsResultCard() {
  const intl = useIntl();
  const [goals, setGoals] = useState<DietaryGoals | null>(null);
  const dataLoadedRef = useRef(false);

  const checkToolOutput = useCallback(() => {
    const toolOutput = window.openai?.toolOutput as { goals?: DietaryGoals } | undefined;
    if (toolOutput?.goals) {
      setGoals(toolOutput.goals);
      dataLoadedRef.current = true;
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (checkToolOutput()) return;

    const handleGlobalsEvent = () => {
      if (!dataLoadedRef.current) checkToolOutput();
    };
    window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
    return () => window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
  }, [checkToolOutput]);

  if (!goals) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-5 w-32 bg-surface-hover rounded mb-2" />
        <div className="h-4 w-48 bg-surface-hover rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 size-10 flex items-center justify-center bg-purple-500/20 text-purple-600 rounded-lg">
          <TargetIcon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-purple-600 mb-0.5">
            {intl.formatMessage({ id: 'result.goalsUpdated', defaultMessage: 'Goals updated!' })}
          </p>
          <h3 className="text-base font-semibold text-primary">
            {intl.formatMessage({ id: 'settings.dietaryGoals', defaultMessage: 'Dietary Goals' })}
          </h3>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {goals.calories && (
              <div className="text-center">
                <div className="text-sm font-semibold text-primary">{goals.calories}</div>
                <div className="text-[10px] text-tertiary">cal</div>
              </div>
            )}
            {goals.proteinG && (
              <div className="text-center">
                <div className="text-sm font-semibold text-primary">{goals.proteinG}g</div>
                <div className="text-[10px] text-tertiary">protein</div>
              </div>
            )}
            {goals.carbsG && (
              <div className="text-center">
                <div className="text-sm font-semibold text-primary">{goals.carbsG}g</div>
                <div className="text-[10px] text-tertiary">carbs</div>
              </div>
            )}
            {goals.fatG && (
              <div className="text-center">
                <div className="text-sm font-semibold text-primary">{goals.fatG}g</div>
                <div className="text-[10px] text-tertiary">fat</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Link
        to="/settings"
        className="mt-3 block w-full py-2 text-center text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
      >
        {intl.formatMessage({ id: 'nav.settings', defaultMessage: 'View Settings' })}
      </Link>
    </motion.div>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
