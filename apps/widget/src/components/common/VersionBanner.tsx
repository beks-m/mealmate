import { useEffect, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface VersionInfo {
  htmlVersion: string | null;
  serverVersion: string | null;
  isMismatch: boolean;
}

export function VersionBanner() {
  const intl = useIntl();
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    htmlVersion: null,
    serverVersion: null,
    isMismatch: false,
  });
  const [dismissed, setDismissed] = useState(false);

  // Version check v2 - Get the version embedded in the HTML (what ChatGPT cached)
  const getHtmlVersion = useCallback((): string | null => {
    // Try meta tag first
    const metaVersion = document.querySelector('meta[name="widget-version"]');
    if (metaVersion) {
      return metaVersion.getAttribute('content');
    }
    // Try data attribute on root
    const root = document.getElementById('root');
    return root?.getAttribute('data-html-version') || null;
  }, []);

  // Get the version from server (via toolOutput)
  const getServerVersion = useCallback((): string | null => {
    const toolOutput = window.openai?.toolOutput as { _widgetVersion?: string } | undefined;
    return toolOutput?._widgetVersion || null;
  }, []);

  // Check for version mismatch
  const checkVersions = useCallback(() => {
    const htmlVersion = getHtmlVersion();
    const serverVersion = getServerVersion();

    console.log('[MealMate] Version check v2 - HTML:', htmlVersion, 'Server:', serverVersion);

    if (htmlVersion && serverVersion && htmlVersion !== serverVersion) {
      console.warn('[MealMate] Version mismatch detected!');
      setVersionInfo({
        htmlVersion,
        serverVersion,
        isMismatch: true,
      });
    } else {
      setVersionInfo({
        htmlVersion,
        serverVersion,
        isMismatch: false,
      });
    }
  }, [getHtmlVersion, getServerVersion]);

  useEffect(() => {
    // Initial check
    checkVersions();

    // Poll for toolOutput since it may load after React mounts
    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = setInterval(() => {
      attempts++;
      const serverVersion = getServerVersion();
      if (serverVersion || attempts >= maxAttempts) {
        checkVersions();
        if (serverVersion || attempts >= maxAttempts) {
          clearInterval(pollInterval);
        }
      }
    }, 100);

    return () => clearInterval(pollInterval);
  }, [checkVersions, getServerVersion]);

  // Don't show if no mismatch or dismissed
  if (!versionInfo.isMismatch || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mx-3 my-2 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg"
      >
        <div className="flex items-start gap-2">
          <AlertIcon className="flex-shrink-0 size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {intl.formatMessage({ id: 'version.updateAvailable', defaultMessage: 'Update available' })}
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              {intl.formatMessage({
                id: 'version.refreshHint',
                defaultMessage: 'A newer version is available. Please refresh your connection to MealMate in ChatGPT settings.'
              })}
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 rounded transition-colors"
            aria-label="Dismiss"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
