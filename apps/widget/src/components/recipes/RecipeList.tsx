import { useEffect, useCallback, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRecipeStore } from '../../stores/recipe-store';
import { SET_GLOBALS_EVENT_TYPE } from '../../types/openai';
import type { Recipe } from '@mealmate/shared';

const RECIPES_PER_PAGE = 5;

export function RecipeList() {
  const intl = useIntl();
  const { recipes, isLoading, setRecipes, setLoading } = useRecipeStore();
  const dataLoadedRef = useRef(false);
  const [displayCount, setDisplayCount] = useState(RECIPES_PER_PAGE);

  // Check for toolOutput data - poll since it might not be available immediately
  // ChatGPT injects window.openai.toolOutput after the widget mounts
  const checkToolOutput = useCallback(() => {
    // Debug logging
    console.log('[MealMate] Checking toolOutput...');
    console.log('[MealMate] window.openai:', window.openai);
    console.log('[MealMate] window.openai?.toolOutput:', window.openai?.toolOutput);

    const toolOutput = window.openai?.toolOutput as { recipes?: Recipe[] } | undefined;

    if (toolOutput?.recipes && Array.isArray(toolOutput.recipes)) {
      console.log('[MealMate] Found recipes:', toolOutput.recipes.length);
      setRecipes(toolOutput.recipes);
      setLoading(false);
      dataLoadedRef.current = true;
      return true;
    }
    console.log('[MealMate] No recipes found in toolOutput');
    return false;
  }, [setRecipes, setLoading]);

  // Load recipes from window.openai.toolOutput on mount via event listener
  useEffect(() => {
    // Try immediately in case data is already available
    if (checkToolOutput()) {
      return;
    }

    // Listen for SET_GLOBALS_EVENT when ChatGPT sets toolOutput
    const handleGlobalsEvent = () => {
      console.log('[MealMate] SET_GLOBALS_EVENT received');
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
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse flex items-center gap-2 px-2.5 py-2 rounded-lg border border-subtle bg-surface"
          >
            <div className="h-4 w-1/2 bg-surface-hover rounded" />
            <div className="h-3 w-12 bg-surface-hover rounded-full ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-8 text-center"
      >
        <EmptyIcon className="size-8 mx-auto text-tertiary mb-2" />
        <p className="text-sm text-secondary font-medium">
          {intl.formatMessage({ id: 'recipes.empty' })}
        </p>
        <p className="mt-0.5 text-xs text-tertiary">
          {intl.formatMessage({ id: 'recipes.emptyHint' })}
        </p>
      </motion.div>
    );
  }

  const visibleRecipes = recipes.slice(0, displayCount);
  const hasMore = displayCount < recipes.length;

  const loadMore = () => {
    setDisplayCount((prev) => prev + RECIPES_PER_PAGE);
  };

  return (
    <div className="space-y-1.5">
      {/* Compact count badge */}
      <div className="flex items-center justify-end mb-1">
        <span className="text-[10px] font-medium text-tertiary">
          {recipes.length} recipes
        </span>
      </div>

      {/* Compact recipe list */}
      <div className="space-y-1">
        {visibleRecipes.map((recipe, index) => (
          <CompactRecipeCard key={recipe.id} recipe={recipe} index={index} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          className="w-full py-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
        >
          +{recipes.length - displayCount} more
        </button>
      )}
    </div>
  );
}

interface CompactRecipeCardProps {
  recipe: Recipe;
  index: number;
}

function CompactRecipeCard({ recipe, index }: CompactRecipeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.15 }}
    >
      <Link
        to={`/recipes/${recipe.id}`}
        className="group flex items-center gap-2 px-2.5 py-2 rounded-lg border border-subtle bg-surface hover:bg-surface-hover hover:border-primary/20 transition-all"
      >
        {/* Recipe name - truncated */}
        <span className="flex-1 text-sm font-medium text-primary truncate group-hover:text-link transition-colors">
          {recipe.name}
        </span>

        {/* Compact stats */}
        <span className="flex items-center gap-1.5 text-[11px] text-tertiary whitespace-nowrap">
          <span className="flex items-center gap-0.5">
            <FlameIcon className="size-3" />
            {recipe.nutrition.calories}
          </span>
          <span className="text-subtle">·</span>
          <span>{recipe.nutrition.proteinG}g</span>
        </span>

        <ChevronRightIcon className="size-3.5 text-tertiary group-hover:text-secondary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

// Icons
function EmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="13" y2="13" />
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6" />
    </svg>
  );
}
