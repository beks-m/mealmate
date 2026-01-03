import { useCallback, useState, type SetStateAction } from 'react';
import type { UnknownObject } from '../types/openai';

export function useWidgetState<T extends UnknownObject>(
  defaultState: T | (() => T)
): readonly [T, (state: SetStateAction<T>) => void];

export function useWidgetState<T extends UnknownObject>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void];

export function useWidgetState<T extends UnknownObject>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void] {
  // Initialize state from window.openai.widgetState (set once by ChatGPT) or default
  const [widgetState, _setWidgetState] = useState<T | null>(() => {
    if (typeof window !== 'undefined' && window.openai?.widgetState != null) {
      return window.openai.widgetState as T;
    }
    return typeof defaultState === 'function'
      ? defaultState()
      : defaultState ?? null;
  });

  const setWidgetState = useCallback(
    (state: SetStateAction<T | null>) => {
      _setWidgetState((prevState) => {
        const newState = typeof state === 'function' ? state(prevState) : state;

        if (newState != null && typeof window !== 'undefined' && window.openai?.setWidgetState) {
          window.openai.setWidgetState(newState);
        }

        return newState;
      });
    },
    []
  );

  return [widgetState, setWidgetState] as const;
}
