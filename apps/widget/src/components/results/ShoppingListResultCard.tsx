import { useEffect, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { useShoppingStore } from '../../stores/shopping-store';
import { SET_GLOBALS_EVENT_TYPE } from '../../types/openai';
import type { ShoppingList } from '@mealmate/shared';

export function ShoppingListResultCard() {
  const intl = useIntl();
  const { setCurrentList } = useShoppingStore();
  const [shoppingList, setLocalShoppingList] = useState<ShoppingList | null>(null);
  const dataLoadedRef = useRef(false);

  const checkToolOutput = useCallback(() => {
    const toolOutput = window.openai?.toolOutput as { shoppingList?: ShoppingList } | undefined;
    if (toolOutput?.shoppingList) {
      setLocalShoppingList(toolOutput.shoppingList);
      setCurrentList(toolOutput.shoppingList);
      dataLoadedRef.current = true;
      return true;
    }
    return false;
  }, [setCurrentList]);

  useEffect(() => {
    if (checkToolOutput()) return;

    const handleGlobalsEvent = () => {
      if (!dataLoadedRef.current) checkToolOutput();
    };
    window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
    return () => window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleGlobalsEvent);
  }, [checkToolOutput]);

  if (!shoppingList) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-5 w-32 bg-surface-hover rounded mb-2" />
        <div className="h-4 w-48 bg-surface-hover rounded" />
      </div>
    );
  }

  const itemCount = shoppingList.items?.length ?? 0;
  // Group items by category to show preview
  const categoryCounts = shoppingList.items?.reduce((acc, item) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 size-10 flex items-center justify-center bg-amber-500/20 text-amber-600 rounded-lg">
          <CartIcon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-600 mb-0.5">
            {intl.formatMessage({ id: 'result.shoppingListGenerated', defaultMessage: 'Shopping list ready!' })}
          </p>
          <h3 className="text-base font-semibold text-primary truncate">
            {shoppingList.name || 'Shopping List'}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-tertiary flex-wrap">
            <span className="font-medium">{itemCount} items</span>
            {topCategories.length > 0 && (
              <>
                <span className="text-subtle">·</span>
                {topCategories.map(([cat, count]) => (
                  <span key={cat}>{cat}: {count}</span>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      <Link
        to="/shopping"
        className="mt-3 block w-full py-2 text-center text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
      >
        {intl.formatMessage({ id: 'result.viewShoppingList', defaultMessage: 'View Shopping List' })}
      </Link>
    </motion.div>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}
