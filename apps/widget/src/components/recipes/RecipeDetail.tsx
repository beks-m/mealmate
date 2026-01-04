import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion, AnimatePresence } from 'framer-motion';
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
  const navigate = useNavigate();
  const intl = useIntl();
  const { recipes, setRecipes, toggleFavorite, removeRecipe } = useRecipeStore();
  const [isLoading, setIsLoading] = useState(recipes.length === 0);
  const dataLoadedRef = useRef(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adjustedServings, setAdjustedServings] = useState<number | null>(null);

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

  // Initialize adjustedServings when recipe loads
  useEffect(() => {
    if (recipe && adjustedServings === null) {
      setAdjustedServings(recipe.servings);
    }
  }, [recipe, adjustedServings]);

  // Calculate multiplier for ingredient/nutrition scaling
  const servingsMultiplier = useMemo(() => {
    if (!recipe || adjustedServings === null) return 1;
    return adjustedServings / recipe.servings;
  }, [recipe, adjustedServings]);

  // Scale a number by the servings multiplier
  const scaleValue = (value: number) => {
    const scaled = value * servingsMultiplier;
    return scaled % 1 === 0 ? scaled : Number(scaled.toFixed(1));
  };

  // Handle delete
  const handleDelete = () => {
    if (id) {
      removeRecipe(id);
      navigate('/recipes');
    }
  };

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
        <div className="flex items-center justify-between mb-2">
          <Link
            to="/recipes"
            className="inline-flex items-center gap-1 text-sm text-tertiary hover:text-secondary transition-colors"
          >
            <ChevronLeftIcon className="size-4" />
            <span>{intl.formatMessage({ id: 'recipe.backToList', defaultMessage: 'Back' })}</span>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => id && toggleFavorite(id)}
              className={`p-1.5 rounded-lg transition-colors ${
                recipe.isFavorite
                  ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                  : 'text-tertiary hover:text-red-500 hover:bg-surface-hover'
              }`}
              title={intl.formatMessage({ id: recipe.isFavorite ? 'recipe.unfavorite' : 'recipe.favorite', defaultMessage: recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites' })}
            >
              <HeartIcon className="size-4" filled={recipe.isFavorite} />
            </button>
            <Link
              to={`/recipes/${id}/edit`}
              className="p-1.5 text-tertiary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
              title={intl.formatMessage({ id: 'recipe.edit', defaultMessage: 'Edit' })}
            >
              <EditIcon className="size-4" />
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-tertiary hover:text-red-500 hover:bg-surface-hover rounded-lg transition-colors"
              title={intl.formatMessage({ id: 'recipe.delete', defaultMessage: 'Delete' })}
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-primary">
          {recipe.name}
        </h1>
        {recipe.description && (
          <p className="mt-1.5 text-secondary leading-relaxed">
            {recipe.description}
          </p>
        )}

        {/* Serving size adjuster */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-tertiary">
            {intl.formatMessage({ id: 'recipe.servings', defaultMessage: 'Servings' })}:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdjustedServings(Math.max(1, (adjustedServings ?? recipe.servings) - 1))}
              disabled={(adjustedServings ?? recipe.servings) <= 1}
              className="size-7 flex items-center justify-center rounded-lg border border-subtle bg-surface hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <MinusIcon className="size-3.5 text-secondary" />
            </button>
            <span className="min-w-[2rem] text-center text-base font-semibold text-primary">
              {adjustedServings ?? recipe.servings}
            </span>
            <button
              onClick={() => setAdjustedServings((adjustedServings ?? recipe.servings) + 1)}
              className="size-7 flex items-center justify-center rounded-lg border border-subtle bg-surface hover:bg-surface-hover transition-colors"
            >
              <PlusIcon className="size-3.5 text-secondary" />
            </button>
          </div>
          {adjustedServings !== recipe.servings && (
            <button
              onClick={() => setAdjustedServings(recipe.servings)}
              className="text-xs text-link hover:underline"
            >
              {intl.formatMessage({ id: 'recipe.resetServings', defaultMessage: 'Reset' })}
            </button>
          )}
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xs p-4 bg-surface border border-subtle rounded-xl shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-primary mb-2">
                {intl.formatMessage({ id: 'recipe.deleteConfirmTitle', defaultMessage: 'Delete Recipe?' })}
              </h3>
              <p className="text-sm text-secondary mb-4">
                {intl.formatMessage({ id: 'recipe.deleteConfirmMessage', defaultMessage: 'This action cannot be undone.' })}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 text-sm font-medium text-secondary bg-surface-hover hover:bg-surface-active rounded-lg transition-colors"
                >
                  {intl.formatMessage({ id: 'common.cancel', defaultMessage: 'Cancel' })}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  {intl.formatMessage({ id: 'recipe.delete', defaultMessage: 'Delete' })}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nutrition Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-4 gap-2"
      >
        <NutritionCard
          icon={<FlameIcon className="size-4" />}
          value={`${scaleValue(recipe.nutrition.calories)}`}
          label={intl.formatMessage({ id: 'nutrition.calories' })}
          color="red"
        />
        <NutritionCard
          icon={<ProteinIcon className="size-4" />}
          value={`${scaleValue(recipe.nutrition.proteinG)}g`}
          label={intl.formatMessage({ id: 'nutrition.protein' })}
          color="blue"
        />
        <NutritionCard
          icon={<CarbsIcon className="size-4" />}
          value={`${scaleValue(recipe.nutrition.carbsG)}g`}
          label={intl.formatMessage({ id: 'nutrition.carbs' })}
          color="amber"
        />
        <NutritionCard
          icon={<FatIcon className="size-4" />}
          value={`${scaleValue(recipe.nutrition.fatG)}g`}
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
                    {scaleValue(ingredient.quantity)} {ingredient.unit}
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

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
