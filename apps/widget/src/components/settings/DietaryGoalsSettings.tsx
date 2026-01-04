import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export function DietaryGoalsSettings() {
  const intl = useIntl();
  const navigate = useNavigate();

  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(250);
  const [fat, setFat] = useState(65);

  const handleSave = () => {
    // In a real app, this would save to the backend
    // For now, just navigate back
    navigate('/settings');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 text-sm text-tertiary hover:text-secondary transition-colors"
        >
          <ChevronLeftIcon className="size-4" />
          <span>{intl.formatMessage({ id: 'settings.back', defaultMessage: 'Back' })}</span>
        </Link>
        <button
          onClick={handleSave}
          className="px-4 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          {intl.formatMessage({ id: 'common.save', defaultMessage: 'Save' })}
        </button>
      </motion.div>

      <motion.div {...fadeIn}>
        <h1 className="text-xl font-semibold text-primary">
          {intl.formatMessage({ id: 'settings.dietaryGoals', defaultMessage: 'Dietary Goals' })}
        </h1>
        <p className="mt-1 text-sm text-tertiary">
          {intl.formatMessage({ id: 'settings.dietaryGoalsHint', defaultMessage: 'Set your daily nutrition targets' })}
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="p-4 rounded-xl border border-subtle bg-surface space-y-4">
          {/* Calories */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">
                {intl.formatMessage({ id: 'nutrition.calories', defaultMessage: 'Calories' })}
              </span>
              <span className="text-sm text-tertiary">{calories} kcal</span>
            </label>
            <input
              type="range"
              min="1200"
              max="4000"
              step="50"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Protein */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">
                {intl.formatMessage({ id: 'nutrition.protein', defaultMessage: 'Protein' })}
              </span>
              <span className="text-sm text-tertiary">{protein}g</span>
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="5"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Carbs */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">
                {intl.formatMessage({ id: 'nutrition.carbs', defaultMessage: 'Carbs' })}
              </span>
              <span className="text-sm text-tertiary">{carbs}g</span>
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="5"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Fat */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">
                {intl.formatMessage({ id: 'nutrition.fat', defaultMessage: 'Fat' })}
              </span>
              <span className="text-sm text-tertiary">{fat}g</span>
            </label>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={fat}
              onChange={(e) => setFat(Number(e.target.value))}
              className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-2">
          <SummaryCard value={calories} label="kcal" color="red" />
          <SummaryCard value={`${protein}g`} label="protein" color="blue" />
          <SummaryCard value={`${carbs}g`} label="carbs" color="amber" />
          <SummaryCard value={`${fat}g`} label="fat" color="purple" />
        </div>
      </motion.div>
    </div>
  );
}

function SummaryCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  const colorClasses: Record<string, string> = {
    red: 'text-red-500',
    blue: 'text-blue-500',
    amber: 'text-amber-500',
    purple: 'text-purple-500',
  };

  return (
    <div className="p-2 rounded-lg border border-subtle bg-surface text-center">
      <div className={`text-base font-semibold ${colorClasses[color]}`}>{value}</div>
      <div className="text-[10px] text-tertiary uppercase">{label}</div>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}
