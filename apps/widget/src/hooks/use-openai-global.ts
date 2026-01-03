import { useState, useEffect } from 'react';
import {
  SET_GLOBALS_EVENT_TYPE,
  type OpenAiGlobals,
} from '../types/openai';

type GlobalsSnapshot = {
  theme: OpenAiGlobals['theme'] | null;
  locale: string | null;
  displayMode: OpenAiGlobals['displayMode'] | null;
  maxHeight: number | null;
  userAgent: OpenAiGlobals['userAgent'] | null;
  safeArea: OpenAiGlobals['safeArea'] | null;
};

function getSnapshot(): GlobalsSnapshot {
  if (typeof window === 'undefined') {
    return {
      theme: null,
      locale: null,
      displayMode: null,
      maxHeight: null,
      userAgent: null,
      safeArea: null,
    };
  }
  return {
    theme: window.openai?.theme ?? null,
    locale: window.openai?.locale ?? null,
    displayMode: window.openai?.displayMode ?? null,
    maxHeight: window.openai?.maxHeight ?? null,
    userAgent: window.openai?.userAgent ?? null,
    safeArea: window.openai?.safeArea ?? null,
  };
}

export function useOpenAiGlobal(): GlobalsSnapshot {
  const [snapshot, setSnapshot] = useState<GlobalsSnapshot>(getSnapshot);

  useEffect(() => {
    // Update on mount in case window.openai was set after initial render
    setSnapshot(getSnapshot());

    const handleSetGlobal = () => {
      setSnapshot(getSnapshot());
    };

    window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
    return () => {
      window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
    };
  }, []);

  return snapshot;
}
