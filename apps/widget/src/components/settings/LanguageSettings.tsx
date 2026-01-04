import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

export function LanguageSettings() {
  const intl = useIntl();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSave = () => {
    // In a real app, this would save to storage and trigger a locale change
    // For now, just navigate back
    localStorage.setItem('mealmate-language', selectedLanguage);
    navigate('/settings');
    // Would trigger page reload to apply new locale
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 text-sm text-tertiary hover:text-secondary transition-colors"
        >
          <ChevronLeftIcon className="size-4" />
          <span>{intl.formatMessage({ id: 'settings.back', defaultMessage: 'Back' })}</span>
        </Link>
        <button
          onClick={handleSave}
          className="px-4 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          {intl.formatMessage({ id: 'common.save', defaultMessage: 'Save' })}
        </button>
      </motion.div>

      <motion.div {...fadeIn}>
        <h1 className="text-xl font-semibold text-primary">
          {intl.formatMessage({ id: 'settings.language', defaultMessage: 'Language' })}
        </h1>
        <p className="mt-1 text-sm text-tertiary">
          {intl.formatMessage({ id: 'settings.languageHint', defaultMessage: 'Choose your preferred language' })}
        </p>
      </motion.div>

      {/* Language options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        {LANGUAGES.map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedLanguage(lang.code)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              selectedLanguage === lang.code
                ? 'border-primary bg-primary/5'
                : 'border-subtle bg-surface hover:bg-surface-hover'
            }`}
          >
            <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
              selectedLanguage === lang.code ? 'border-primary' : 'border-subtle'
            }`}>
              {selectedLanguage === lang.code && (
                <div className="size-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-primary">{lang.nativeName}</p>
              <p className="text-xs text-tertiary">{lang.name}</p>
            </div>
            {selectedLanguage === lang.code && (
              <CheckIcon className="size-5 text-primary" />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs text-tertiary text-center"
      >
        {intl.formatMessage({ id: 'settings.languageNote', defaultMessage: 'The app will reload to apply the new language' })}
      </motion.p>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}
