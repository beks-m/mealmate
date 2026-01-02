import { IntlProvider } from 'react-intl';
import type { ReactNode } from 'react';
import { useOpenAiGlobal } from '../hooks/use-openai-global';
import en from './en.json';
import ru from './ru.json';

const messages: Record<string, Record<string, string>> = { en, ru };

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { locale } = useOpenAiGlobal();

  // Resolve locale: check if it starts with 'ru', otherwise default to 'en'
  const resolvedLocale = locale?.startsWith('ru') ? 'ru' : 'en';

  return (
    <IntlProvider
      messages={messages[resolvedLocale]}
      locale={resolvedLocale}
      defaultLocale="en"
      onError={(err) => {
        // Suppress missing translation errors in development
        if (err.code !== 'MISSING_TRANSLATION') {
          console.error(err);
        }
      }}
    >
      {children}
    </IntlProvider>
  );
}
