import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import ru from './locales/ru.json';
import tg from './locales/tg.json';

export const SUPPORTED_LANGUAGES = ['ru', 'en', 'tg'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ru остаётся языком по умолчанию — это исходный язык большей части текстов в системе.
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ru: { translation: ru }, tg: { translation: tg } },
    fallbackLng: 'ru',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'rivo.language',
      caches: ['localStorage'],
    },
  });

export default i18n;
