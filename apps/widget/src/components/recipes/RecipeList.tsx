import { useEffect, useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRecipeStore } from '../../stores/recipe-store';
import { SET_GLOBALS_EVENT_TYPE } from '../../types/openai';
import type { Recipe } from '@mealmate/shared';

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
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function RecipeList() {
  const intl = useIntl();
  const { recipes, isLoading, setRecipes, setLoading } = useRecipeStore();
  const dataLoadedRef = useRef(false);

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
      <div className="space-y-4">
        <Header intl={intl} count={0} />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse p-4 rounded-xl border border-subtle bg-surface"
            >
              <div className="h-5 w-2/3 bg-surface-hover rounded mb-2" />
              <div className="h-4 w-full bg-surface-hover rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-surface-hover rounded-full" />
                <div className="h-5 w-20 bg-surface-hover rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="space-y-4">
        <Header intl={intl} count={0} />
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 text-center rounded-xl border border-dashed border-subtle bg-surface"
        >
          <EmptyIcon className="size-10 mx-auto text-tertiary mb-3" />
          <p className="text-secondary font-medium">
            {intl.formatMessage({ id: 'recipes.empty' })}
          </p>
          <p className="mt-1 text-sm text-tertiary">
            {intl.formatMessage({ id: 'recipes.emptyHint' })}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header intl={intl} count={recipes.length} />

      <div className="space-y-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

function Header({ intl, count }: { intl: ReturnType<typeof useIntl>; count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <h1 className="text-xl font-semibold text-primary">
        {intl.formatMessage({ id: 'nav.recipes' })}
      </h1>
      {count > 0 && (
        <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
          {count}
        </span>
      )}
    </motion.div>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  const intl = useIntl();

  return (
    <div>
      <Link
        to={`/recipes/${recipe.id}`}
        className="group block p-4 rounded-xl border border-subtle bg-surface hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <RecipeIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-primary group-hover:text-link transition-colors">
              {recipe.name}
            </h3>
            {recipe.description && (
              <p className="mt-0.5 text-sm text-tertiary line-clamp-2">
                {recipe.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <NutritionBadge
                icon={<FlameIcon className="size-3" />}
                label={intl.formatMessage({ id: 'recipe.calories' }, { count: recipe.nutrition.calories })}
              />
              <NutritionBadge
                icon={<ProteinIcon className="size-3" />}
                label={`${recipe.nutrition.proteinG}g ${intl.formatMessage({ id: 'nutrition.protein' })}`}
              />
              {recipe.prepTimeMinutes && (
                <NutritionBadge
                  icon={<ClockIcon className="size-3" />}
                  label={`${recipe.prepTimeMinutes} min`}
                />
              )}
            </div>
          </div>
          <ChevronRightIcon className="flex-shrink-0 size-4 text-tertiary group-hover:text-secondary group-hover:translate-x-0.5 transition-all mt-1" />
        </div>
      </Link>
    </div>
  );
}

function NutritionBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-surface-hover text-secondary rounded-full">
      {icon}
      {label}
    </span>
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

function RecipeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
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

function ProteinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12" />
      <path d="M6 12h12" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
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
