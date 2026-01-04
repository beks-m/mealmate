import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { useRecipeStore } from '../../stores/recipe-store';
import { SET_GLOBALS_EVENT_TYPE } from '../../types/openai';
import type { Recipe } from '@mealmate/shared';

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const { recipes, setRecipes } = useRecipeStore();
  const [isLoading, setIsLoading] = useState(recipes.length === 0);
  const dataLoadedRef = useRef(false);

  // Check for toolOutput data - poll since it might not be available immediately
  // ChatGPT injects window.openai.toolOutput after the widget mounts
  const checkToolOutput = useCallback(() => {
    const toolOutput = window.openai?.toolOutput as { recipes?: Recipe[] } | undefined;

    if (toolOutput?.recipes && Array.isArray(toolOutput.recipes)) {
      setRecipes(toolOutput.recipes);
      setIsLoading(false);
      dataLoadedRef.current = true;
      return true;
    }
    return false;
  }, [setRecipes]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load recipes from window.openai.toolOutput on mount via event listener
  useEffect(() => {
    // If we already have recipes, don't load
    if (recipes.length > 0) {
      setIsLoading(false);
      return;
    }

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
  }, [checkToolOutput, recipes.length]);

  const recipe = recipes.find((r) => r.id === id);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="animate-pulse">
          <div className="h-4 w-16 bg-surface-hover rounded mb-2" />
          <div className="h-6 w-3/4 bg-surface-hover rounded mb-2" />
          <div className="h-4 w-full bg-surface-hover rounded" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse p-2.5 rounded-xl border border-subtle bg-surface">
              <div className="h-7 w-7 mx-auto bg-surface-hover rounded-lg mb-1" />
              <div className="h-5 w-10 mx-auto bg-surface-hover rounded mb-1" />
              <div className="h-3 w-12 mx-auto bg-surface-hover rounded" />
            </div>
          ))}
        </div>
        <div className="animate-pulse p-3 rounded-xl border border-subtle bg-surface">
          <div className="space-y-2">
            <div className="h-4 w-full bg-surface-hover rounded" />
            <div className="h-4 w-3/4 bg-surface-hover rounded" />
            <div className="h-4 w-5/6 bg-surface-hover rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <motion.div {...fadeIn} className="p-6 text-center rounded-xl border border-dashed border-subtle bg-surface">
        <NotFoundIcon className="size-10 mx-auto text-tertiary mb-3" />
        <p className="text-secondary">
          {intl.formatMessage({ id: 'recipe.notFound' })}
        </p>
        <Link to="/recipes" className="mt-3 inline-block text-sm text-link hover:underline">
          {intl.formatMessage({ id: 'recipe.backToList', defaultMessage: 'Back to recipes' })}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back button and header */}
      <motion.div {...fadeIn}>
        <Link
          to="/recipes"
          className="inline-flex items-center gap-1 text-sm text-tertiary hover:text-secondary transition-colors mb-2"
        >
          <ChevronLeftIcon className="size-4" />
          <span>{intl.formatMessage({ id: 'recipe.backToList', defaultMessage: 'Back' })}</span>
        </Link>
        <h1 className="text-xl font-semibold text-primary">
          {recipe.name}
        </h1>
        {recipe.description && (
          <p className="mt-1.5 text-secondary leading-relaxed">
            {recipe.description}
          </p>
        )}
      </motion.div>

      {/* Nutrition Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-4 gap-2"
      >
        <NutritionCard
          icon={<FlameIcon className="size-4" />}
          value={`${recipe.nutrition.calories}`}
          label={intl.formatMessage({ id: 'nutrition.calories' })}
          color="red"
        />
        <NutritionCard
          icon={<ProteinIcon className="size-4" />}
          value={`${recipe.nutrition.proteinG}g`}
          label={intl.formatMessage({ id: 'nutrition.protein' })}
          color="blue"
        />
        <NutritionCard
          icon={<CarbsIcon className="size-4" />}
          value={`${recipe.nutrition.carbsG}g`}
          label={intl.formatMessage({ id: 'nutrition.carbs' })}
          color="amber"
        />
        <NutritionCard
          icon={<FatIcon className="size-4" />}
          value={`${recipe.nutrition.fatG}g`}
          label={intl.formatMessage({ id: 'nutrition.fat' })}
          color="purple"
        />
      </motion.div>

      {/* Ingredients */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-sm font-medium text-tertiary uppercase tracking-wide mb-2">
          {intl.formatMessage({ id: 'recipe.ingredients' })}
        </h2>
        <div className="p-3 rounded-xl border border-subtle bg-surface">
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient) => (
              <li
                key={ingredient.id}
                className="flex items-center gap-2 text-secondary"
              >
                <span className="flex-shrink-0 size-1.5 bg-primary/40 rounded-full" />
                <span>
                  <span className="font-medium text-primary">
                    {ingredient.quantity} {ingredient.unit}
                  </span>{' '}
                  {ingredient.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* Instructions */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-sm font-medium text-tertiary uppercase tracking-wide mb-2">
          {intl.formatMessage({ id: 'recipe.instructions' })}
        </h2>
        <ol className="space-y-3">
          {recipe.instructions.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex-shrink-0 size-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-semibold">
                {index + 1}
              </span>
              <span className="text-secondary leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </motion.section>
    </div>
  );
}

interface NutritionCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: 'red' | 'blue' | 'amber' | 'purple';
}

const colorClasses = {
  red: 'text-red-500 bg-red-500/10',
  blue: 'text-blue-500 bg-blue-500/10',
  amber: 'text-amber-500 bg-amber-500/10',
  purple: 'text-purple-500 bg-purple-500/10',
};

function NutritionCard({ icon, value, label, color }: NutritionCardProps) {
  return (
    <div className="p-2.5 rounded-xl border border-subtle bg-surface text-center">
      <div className={`inline-flex p-1.5 rounded-lg mb-1 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-base font-semibold text-primary">{value}</div>
      <div className="text-[10px] text-tertiary uppercase tracking-wide">{label}</div>
    </div>
  );
}

// Icons
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}

function NotFoundIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
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

function CarbsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function FatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
