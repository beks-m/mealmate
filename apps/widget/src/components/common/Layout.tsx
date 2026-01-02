import { type ReactNode, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useOpenAiGlobal } from '../../hooks/use-openai-global';
import { useDisplayMode, useIntrinsicHeight } from '../../hooks/use-display-mode';

interface LayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: '/', labelId: 'nav.dashboard' },
  { path: '/recipes', labelId: 'nav.recipes' },
  { path: '/meal-plan', labelId: 'nav.mealPlan' },
  { path: '/shopping', labelId: 'nav.shopping' },
  { path: '/settings', labelId: 'nav.settings' },
] as const;

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const intl = useIntl();
  const { theme, safeArea } = useOpenAiGlobal();
  const { displayMode, isFullscreen, goFullscreen, goInline } = useDisplayMode();

  const containerRef = useRef<HTMLDivElement>(null);
  useIntrinsicHeight(containerRef, [children, location.pathname]);

  const isDark = theme === 'dark';

  // Apply safe area insets for mobile
  const safeAreaStyle = safeArea?.insets ? {
    paddingTop: safeArea.insets.top,
    paddingBottom: safeArea.insets.bottom,
    paddingLeft: safeArea.insets.left,
    paddingRight: safeArea.insets.right,
  } : undefined;

  return (
    <div
      ref={containerRef}
      className={`min-h-full flex flex-col ${isDark ? 'dark' : ''}`}
      style={safeAreaStyle}
    >
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <nav className="flex gap-1 p-2 overflow-x-auto items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors
                  ${isActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                {intl.formatMessage({ id: item.labelId })}
              </Link>
            );
          })}

          {/* Fullscreen toggle - only show in inline or fullscreen mode */}
          {displayMode !== 'pip' && (
            <button
              onClick={isFullscreen ? goInline : goFullscreen}
              className="ml-auto p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v5m0-5h5m6 6l5 5m0 0v-5m0 5h-5" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              )}
            </button>
          )}
        </nav>
      </header>

      <main className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}
