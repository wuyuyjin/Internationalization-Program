import i18n from 'i18next'
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    backend: {
      loadPath: '/locales/{{lng}}.json', // Use template string to dynamically load language files, path is under public folder
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true, // Enable missing key logging
    missingKeyHandler: function(lng, ns, key) {
      console.warn(`Missing translation: ${key} in ${lng}`);
    },
  }, (err, t) => {
    if (err) console.error('i18n initialization failed:', err);
    else console.log('i18n initialization successful');
  });

export default i18n;
