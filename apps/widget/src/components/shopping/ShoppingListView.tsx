import { useEffect, useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useShoppingStore } from '../../stores/shopping-store';
import { SET_GLOBALS_EVENT_TYPE } from '../../types/openai';
import { CATEGORY_LABELS } from '@mealmate/shared';
import type { ShoppingList, IngredientCategory } from '@mealmate/shared';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
};

export function ShoppingListView() {
  const intl = useIntl();
  const { currentList, isLoading, toggleItem, setCurrentList, setLoading } = useShoppingStore();
  const locale = intl.locale as 'en' | 'ru';
  const dataLoadedRef = useRef(false);

  // Check for toolOutput data - poll since it might not be available immediately
  // ChatGPT injects window.openai.toolOutput after the widget mounts
  const checkToolOutput = useCallback(() => {
    const toolOutput = window.openai?.toolOutput as { shoppingList?: ShoppingList } | undefined;

    if (toolOutput?.shoppingList) {
      setCurrentList(toolOutput.shoppingList);
      setLoading(false);
      dataLoadedRef.current = true;
      return true;
    }
    return false;
  }, [setCurrentList, setLoading]);

  // Load shopping list from window.openai.toolOutput on mount via event listener
  useEffect(() => {
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
  }, [checkToolOutput]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Header intl={intl} />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse p-4 rounded-xl border border-subtle bg-surface"
            >
              <div className="h-4 w-24 bg-surface-hover rounded mb-3" />
              <div className="space-y-2">
                <div className="h-5 w-full bg-surface-hover rounded" />
                <div className="h-5 w-3/4 bg-surface-hover rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentList || currentList.items.length === 0) {
    return (
      <div className="space-y-4">
        <Header intl={intl} />
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 text-center rounded-xl border border-dashed border-subtle bg-surface"
        >
          <CartEmptyIcon className="size-10 mx-auto text-tertiary mb-3" />
          <p className="text-secondary font-medium">
            {intl.formatMessage({ id: 'shopping.empty' })}
          </p>
          <p className="mt-1 text-sm text-tertiary">
            {intl.formatMessage({ id: 'shopping.emptyHint' })}
          </p>
        </motion.div>
      </div>
    );
  }

  // Group items by category
  const itemsByCategory = currentList.items.reduce(
    (acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<IngredientCategory, typeof currentList.items>
  );

  const checkedCount = currentList.items.filter(i => i.isChecked).length;
  const totalCount = currentList.items.length;

  return (
    <div className="space-y-4">
      <Header intl={intl} checkedCount={checkedCount} totalCount={totalCount} />

      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {(Object.entries(itemsByCategory) as [IngredientCategory, typeof currentList.items][]).map(
          ([category, items]) => (
            <CategorySection
              key={category}
              category={category}
              items={items}
              locale={locale}
              toggleItem={toggleItem}
            />
          )
        )}
      </motion.div>
    </div>
  );
}

function Header({ intl, checkedCount = 0, totalCount = 0 }: { intl: ReturnType<typeof useIntl>; checkedCount?: number; totalCount?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <h1 className="text-xl font-semibold text-primary">
        {intl.formatMessage({ id: 'nav.shopping' })}
      </h1>
      {totalCount > 0 && (
        <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
          {checkedCount}/{totalCount}
        </span>
      )}
    </motion.div>
  );
}

interface CategorySectionProps {
  category: IngredientCategory;
  items: {
    id: string;
    name: string;
    nameRu?: string;
    quantity?: number;
    unit?: string;
    isChecked: boolean;
  }[];
  locale: 'en' | 'ru';
  toggleItem: (id: string) => void;
}

function CategorySection({ category, items, locale, toggleItem }: CategorySectionProps) {
  const checkedInCategory = items.filter(i => i.isChecked).length;
  const allChecked = checkedInCategory === items.length;

  return (
    <motion.section
      variants={item}
      className="rounded-xl border border-subtle bg-surface overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-subtle">
        <h2 className="text-sm font-medium text-secondary">
          {CATEGORY_LABELS[category][locale]}
        </h2>
        {checkedInCategory > 0 && (
          <span className={`text-xs ${allChecked ? 'text-emerald-500' : 'text-tertiary'}`}>
            {checkedInCategory}/{items.length}
          </span>
        )}
      </div>
      <ul className="divide-y divide-subtle">
        <AnimatePresence>
          {items.map((item) => (
            <ShoppingItem
              key={item.id}
              item={item}
              locale={locale}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </AnimatePresence>
      </ul>
    </motion.section>
  );
}

interface ShoppingItemProps {
  item: {
    id: string;
    name: string;
    nameRu?: string;
    quantity?: number;
    unit?: string;
    isChecked: boolean;
  };
  locale: 'en' | 'ru';
  onToggle: () => void;
}

function ShoppingItem({ item, locale, onToggle }: ShoppingItemProps) {
  return (
    <motion.li
      layout
      className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <button
        className={`flex-shrink-0 size-5 rounded-md border-2 transition-all flex items-center justify-center ${
          item.isChecked
            ? 'bg-primary border-primary'
            : 'border-subtle hover:border-primary/50'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {item.isChecked && <CheckIcon className="size-3 text-white" />}
      </button>
      <span
        className={`flex-1 transition-colors ${
          item.isChecked
            ? 'line-through text-tertiary'
            : 'text-primary'
        }`}
      >
        {item.quantity && item.unit && (
          <span className="text-secondary">{item.quantity} {item.unit} </span>
        )}
        {locale === 'ru' && item.nameRu ? item.nameRu : item.name}
      </span>
    </motion.li>
  );
}

// Icons
function CartEmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      <line x1="10" y1="10" x2="18" y2="10" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}
