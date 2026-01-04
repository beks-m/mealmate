import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { useRecipeStore } from '../../stores/recipe-store';
import { SET_GLOBALS_EVENT_TYPE } from '../../types/openai';
import type { Recipe, RecipeIngredient } from '@mealmate/shared';

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export function RecipeEditForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const intl = useIntl();
  const { recipes, setRecipes, updateRecipe } = useRecipeStore();
  const [isLoading, setIsLoading] = useState(recipes.length === 0);
  const dataLoadedRef = useRef(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(1);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  // Check for toolOutput data
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

  // Load recipes on mount
  useEffect(() => {
    if (recipes.length > 0) {
      setIsLoading(false);
      return;
    }
    if (checkToolOutput()) return;

    const handleGlobalsEvent = () => {
      if (!dataLoadedRef.current) checkToolOutput();
    };
    window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
    return () => window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
  }, [checkToolOutput, recipes.length]);

  const recipe = recipes.find((r) => r.id === id);

  // Initialize form when recipe loads
  useEffect(() => {
    if (recipe) {
      setName(recipe.name);
      setDescription(recipe.description || '');
      setServings(recipe.servings);
      setInstructions([...recipe.instructions]);
      setIngredients([...recipe.ingredients]);
    }
  }, [recipe]);

  const handleSave = () => {
    if (!id || !recipe) return;

    updateRecipe(id, {
      name,
      description,
      servings,
      instructions,
      ingredients,
    });
    navigate(`/recipes/${id}`);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index]!, [field]: value };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { id: crypto.randomUUID(), name: '', quantity: 1, unit: '', category: 'other', sortOrder: ingredients.length }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 w-1/2 bg-surface-hover rounded" />
        <div className="animate-pulse h-10 w-full bg-surface-hover rounded" />
        <div className="animate-pulse h-24 w-full bg-surface-hover rounded" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <motion.div {...fadeIn} className="p-6 text-center rounded-xl border border-dashed border-subtle bg-surface">
        <p className="text-secondary">{intl.formatMessage({ id: 'recipe.notFound' })}</p>
        <Link to="/recipes" className="mt-3 inline-block text-sm text-link hover:underline">
          {intl.formatMessage({ id: 'recipe.backToList', defaultMessage: 'Back to recipes' })}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <Link
          to={`/recipes/${id}`}
          className="inline-flex items-center gap-1 text-sm text-tertiary hover:text-secondary transition-colors"
        >
          <ChevronLeftIcon className="size-4" />
          <span>{intl.formatMessage({ id: 'common.cancel', defaultMessage: 'Cancel' })}</span>
        </Link>
        <button
          onClick={handleSave}
          className="px-4 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          {intl.formatMessage({ id: 'common.save', defaultMessage: 'Save' })}
        </button>
      </motion.div>

      {/* Form */}
      <motion.div {...fadeIn} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-tertiary uppercase tracking-wide mb-1">
            {intl.formatMessage({ id: 'recipe.name', defaultMessage: 'Name' })}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-subtle bg-surface focus:border-primary focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-tertiary uppercase tracking-wide mb-1">
            {intl.formatMessage({ id: 'recipe.description', defaultMessage: 'Description' })}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-subtle bg-surface focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* Servings */}
        <div>
          <label className="block text-xs font-medium text-tertiary uppercase tracking-wide mb-1">
            {intl.formatMessage({ id: 'recipe.servings', defaultMessage: 'Servings' })}
          </label>
          <input
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 text-sm rounded-lg border border-subtle bg-surface focus:border-primary focus:outline-none"
          />
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-tertiary uppercase tracking-wide">
              {intl.formatMessage({ id: 'recipe.ingredients', defaultMessage: 'Ingredients' })}
            </label>
            <button
              onClick={addIngredient}
              className="text-xs text-link hover:underline"
            >
              + {intl.formatMessage({ id: 'common.add', defaultMessage: 'Add' })}
            </button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ing, index) => (
              <div key={ing.id} className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1.5 text-sm rounded-lg border border-subtle bg-surface focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  placeholder="unit"
                  className="w-16 px-2 py-1.5 text-sm rounded-lg border border-subtle bg-surface focus:border-primary focus:outline-none placeholder:text-tertiary"
                />
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="ingredient"
                  className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-subtle bg-surface focus:border-primary focus:outline-none placeholder:text-tertiary"
                />
                <button
                  onClick={() => removeIngredient(index)}
                  className="p-1 text-tertiary hover:text-red-500 transition-colors"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-tertiary uppercase tracking-wide">
              {intl.formatMessage({ id: 'recipe.instructions', defaultMessage: 'Instructions' })}
            </label>
            <button
              onClick={addInstruction}
              className="text-xs text-link hover:underline"
            >
              + {intl.formatMessage({ id: 'common.add', defaultMessage: 'Add' })}
            </button>
          </div>
          <div className="space-y-2">
            {instructions.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 size-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-semibold mt-1">
                  {index + 1}
                </span>
                <textarea
                  value={step}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  rows={2}
                  className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-subtle bg-surface focus:border-primary focus:outline-none resize-none"
                />
                <button
                  onClick={() => removeInstruction(index)}
                  className="p-1 text-tertiary hover:text-red-500 transition-colors mt-1"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
