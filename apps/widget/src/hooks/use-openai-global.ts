import { useSyncExternalStore } from 'react';
import {
  SET_GLOBALS_EVENT_TYPE,
  type SetGlobalsEvent,
  type OpenAiGlobals,
} from '../types/openai';

type OpenAiGlobalKey = keyof OpenAiGlobals;

type GlobalsSnapshot = {
  theme: OpenAiGlobals['theme'] | null;
  locale: string | null;
  displayMode: OpenAiGlobals['displayMode'] | null;
  maxHeight: number | null;
  userAgent: OpenAiGlobals['userAgent'] | null;
  safeArea: OpenAiGlobals['safeArea'] | null;
};

export function useOpenAiGlobal(): GlobalsSnapshot;

export function useOpenAiGlobal<K extends OpenAiGlobalKey>(
  key: K
): OpenAiGlobals[K] | null;

export function useOpenAiGlobal<K extends OpenAiGlobalKey>(
  key?: K
): GlobalsSnapshot | OpenAiGlobals[K] | null {
  const subscribe = (onChange: () => void) => {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const handleSetGlobal = (event: Event) => {
      const customEvent = event as SetGlobalsEvent;
      if (key) {
        const value = customEvent.detail.globals[key];
        if (value === undefined) {
          return;
        }
      }
      onChange();
    };

    window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
      passive: true,
    });

    return () => {
      window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
    };
  };

  const getSnapshot = (): GlobalsSnapshot | OpenAiGlobals[K] | null => {
    if (key) {
      return window.openai?.[key] ?? null;
    }
    return {
      theme: window.openai?.theme ?? null,
      locale: window.openai?.locale ?? null,
      displayMode: window.openai?.displayMode ?? null,
      maxHeight: window.openai?.maxHeight ?? null,
      userAgent: window.openai?.userAgent ?? null,
      safeArea: window.openai?.safeArea ?? null,
    };
  };

  const getServerSnapshot = (): GlobalsSnapshot | null => {
    if (key) {
      return null;
    }
    return {
      theme: null,
      locale: null,
      displayMode: null,
      maxHeight: null,
      userAgent: null,
      safeArea: null,
    };
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
