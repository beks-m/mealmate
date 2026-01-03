import { useMemo } from 'react';

export function useWidgetProps<T extends Record<string, unknown>>(
  defaultState?: T | (() => T)
): T {
  // Read directly from window.openai - this is only set once by ChatGPT
  const props = useMemo(() => {
    if (typeof window !== 'undefined' && window.openai?.toolOutput) {
      return window.openai.toolOutput as T;
    }
    return null;
  }, []);

  const fallback = useMemo(() => {
    return typeof defaultState === 'function'
      ? (defaultState as () => T | null)()
      : defaultState ?? null;
  }, [defaultState]);

  return (props ?? fallback) as T;
}
