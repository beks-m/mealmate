import { type ReactNode, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { useOpenAiGlobal } from '../../hooks/use-openai-global';
import { useDisplayMode, useIntrinsicHeight } from '../../hooks/use-display-mode';
import { VersionBanner } from './VersionBanner';

interface LayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: '/', labelId: 'nav.dashboard', icon: HomeIcon },
  { path: '/recipes', labelId: 'nav.recipes', icon: BookIcon },
  { path: '/meal-plan', labelId: 'nav.mealPlan', icon: CalendarIcon },
  { path: '/shopping', labelId: 'nav.shopping', icon: CartIcon },
  { path: '/settings', labelId: 'nav.settings', icon: SettingsIcon },
] as const;

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const intl = useIntl();
  const { safeArea } = useOpenAiGlobal();
  const { displayMode, isFullscreen, goFullscreen, goInline } = useDisplayMode();

  const containerRef = useRef<HTMLDivElement>(null);
  useIntrinsicHeight(containerRef);

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
      className="min-h-full flex flex-col bg-surface"
      style={safeAreaStyle}
    >
      {/* Clean header with pill-style navigation */}
      <header className="sticky top-0 z-10 border-b border-subtle bg-surface/95 backdrop-blur-sm">
        <nav className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <Icon className={`relative size-4 ${isActive ? 'text-primary' : 'text-tertiary'}`} />
                <span className={`relative ${isActive ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                  {intl.formatMessage({ id: item.labelId })}
                </span>
              </Link>
            );
          })}

          {/* Fullscreen toggle */}
          {displayMode !== 'pip' && (
            <button
              onClick={isFullscreen ? goInline : goFullscreen}
              className="ml-auto p-1.5 text-tertiary hover:text-secondary rounded-lg hover:bg-surface-hover transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <MinimizeIcon className="size-4" /> : <MaximizeIcon className="size-4" />}
            </button>
          )}
        </nav>
      </header>

      {/* Version mismatch banner */}
      <VersionBanner />

      {/* Main content with fade animation */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex-1 p-4"
      >
        {children}
      </motion.main>
    </div>
  );
}

// Icon components using OpenAI's icon style
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function MaximizeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
    </svg>
  );
}

function MinimizeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14h6m0 0v6m0-6L3 21m17-11h-6m0 0V4m0 6l7-7" />
    </svg>
  );
}
