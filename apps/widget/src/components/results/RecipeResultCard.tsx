import { useEffect, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { useRecipeStore } from '../../stores/recipe-store';
import { SET_GLOBALS_EVENT_TYPE } from '../../types/openai';
import type { Recipe } from '@mealmate/shared';

export function RecipeResultCard() {
  const intl = useIntl();
  const { addRecipe } = useRecipeStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const dataLoadedRef = useRef(false);

  const checkToolOutput = useCallback(() => {
    const toolOutput = window.openai?.toolOutput as { recipe?: Recipe } | undefined;
    if (toolOutput?.recipe) {
      setRecipe(toolOutput.recipe);
      addRecipe(toolOutput.recipe);
      dataLoadedRef.current = true;
      return true;
    }
    return false;
  }, [addRecipe]);

  useEffect(() => {
    if (checkToolOutput()) return;

    const handleGlobalsEvent = () => {
      if (!dataLoadedRef.current) checkToolOutput();
    };
    window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
    return () => window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
  }, [checkToolOutput]);

  if (!recipe) {
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
      className="p-4 rounded-xl border border-green-500/30 bg-green-500/5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 size-10 flex items-center justify-center bg-green-500/20 text-green-600 rounded-lg">
          <CheckIcon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-600 mb-0.5">
            {intl.formatMessage({ id: 'result.recipeSaved', defaultMessage: 'Recipe saved!' })}
          </p>
          <h3 className="text-base font-semibold text-primary truncate">
            {recipe.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-tertiary">
            <span className="flex items-center gap-1">
              <FlameIcon className="size-3" />
              {recipe.nutrition.calories} cal
            </span>
            <span>{recipe.nutrition.proteinG}g protein</span>
          </div>
        </div>
      </div>
      <Link
        to={`/recipes/${recipe.id}`}
        className="mt-3 block w-full py-2 text-center text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
      >
        {intl.formatMessage({ id: 'result.viewRecipe', defaultMessage: 'View Recipe' })}
      </Link>
    </motion.div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  );
}
