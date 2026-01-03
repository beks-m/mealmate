import { useCallback, useEffect, useRef } from 'react';
import { useOpenAiGlobal } from './use-openai-global';
import type { DisplayMode } from '../types/openai';

/**
 * Hook for managing display modes and intrinsic height in ChatGPT widgets.
 *
 * Features:
 * - Read current display mode
 * - Request display mode changes (inline, fullscreen, pip)
 * - Notify ChatGPT of widget height for proper sizing
 */
export function useDisplayMode() {
  const { displayMode, maxHeight } = useOpenAiGlobal();

  const requestDisplayMode = useCallback(async (mode: DisplayMode) => {
    if (typeof window === 'undefined' || !window.openai?.requestDisplayMode) {
      console.warn('requestDisplayMode not available');
      return null;
    }

    try {
      const result = await window.openai.requestDisplayMode({ mode });
      return result.mode;
    } catch (error) {
      console.error('Failed to change display mode:', error);
      return null;
    }
  }, []);

  const goFullscreen = useCallback(() => requestDisplayMode('fullscreen'), [requestDisplayMode]);
  const goInline = useCallback(() => requestDisplayMode('inline'), [requestDisplayMode]);
  const goPip = useCallback(() => requestDisplayMode('pip'), [requestDisplayMode]);

  return {
    displayMode: displayMode ?? 'inline',
    maxHeight: maxHeight ?? null,
    isFullscreen: displayMode === 'fullscreen',
    isInline: displayMode === 'inline',
    isPip: displayMode === 'pip',
    requestDisplayMode,
    goFullscreen,
    goInline,
    goPip,
  };
}

/**
 * Hook to notify ChatGPT of the widget's intrinsic height.
 * Prevents scroll clipping in inline mode.
 *
 * @param containerRef - Ref to the container element to measure
 */
export function useIntrinsicHeight<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>
) {
  const lastHeight = useRef<number>(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const notifyHeight = () => {
      if (!window.openai?.notifyIntrinsicHeight) {
        return;
      }
      const height = containerRef.current?.scrollHeight;
      if (height && height !== lastHeight.current) {
        lastHeight.current = height;
        window.openai.notifyIntrinsicHeight(height);
      }
    };

    // Set up ResizeObserver once
    if (!observerRef.current) {
      observerRef.current = new ResizeObserver(notifyHeight);
    }

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
      // Initial notification after a small delay to let content settle
      setTimeout(notifyHeight, 100);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [containerRef]);
}

/**
 * Hook to close the widget.
 */
export function useCloseWidget() {
  return useCallback(() => {
    if (typeof window !== 'undefined' && window.openai?.requestClose) {
      window.openai.requestClose();
    }
  }, []);
}

/**
 * Hook to open external links (with CSP check).
 */
export function useOpenExternal() {
  return useCallback((url: string) => {
    if (typeof window !== 'undefined' && window.openai?.openExternal) {
      window.openai.openExternal({ href: url });
    } else {
      // Fallback to window.open
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);
}
