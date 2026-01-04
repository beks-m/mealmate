import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, MemoryRouter } from 'react-router-dom';
import { AppsSDKUIProvider } from '@openai/apps-sdk-ui/components/AppsSDKUIProvider';
import { App } from './App';
import { WidgetApp } from './WidgetApp';
import { I18nProvider } from './i18n/provider';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Check if we're in widget mode (embedded in ChatGPT)
const dataView = rootElement.getAttribute('data-view');
const isWidgetMode = !!dataView;

// Map view names to initial routes
const viewToInitialRoute: Record<string, string> = {
  'dashboard': '/',
  'recipes': '/recipes',
  'recipe-detail': '/recipes/detail',
  'meal-plan': '/meal-plan',
  'shopping-list': '/shopping',
  'settings': '/settings',
  // Result widgets
  'recipe-result': '/recipe-result',
  'meal-plan-result': '/meal-plan-result',
  'shopping-list-result': '/shopping-list-result',
  'goals-result': '/goals-result',
};

if (isWidgetMode) {
  const initialRoute = viewToInitialRoute[dataView] || '/';

  // Widget mode: render specific component based on data-view
  createRoot(rootElement).render(
    <StrictMode>
      <AppsSDKUIProvider linkComponent="a">
        <MemoryRouter initialEntries={[initialRoute]}>
          <I18nProvider>
            <WidgetApp view={dataView} />
          </I18nProvider>
        </MemoryRouter>
      </AppsSDKUIProvider>
    </StrictMode>
  );
} else {
  // Development mode: full app with routing
  createRoot(rootElement).render(
    <StrictMode>
      <AppsSDKUIProvider linkComponent={Link}>
        <BrowserRouter>
          <I18nProvider>
            <App />
          </I18nProvider>
        </BrowserRouter>
      </AppsSDKUIProvider>
    </StrictMode>
  );
}
