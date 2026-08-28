import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import styles from './LanguageSwitcher.module.css';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  ru: 'RU',
  en: 'EN',
  tg: 'TJ',
};

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const current = (i18n.language?.split('-')[0] ?? 'ru') as SupportedLanguage;

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className={styles.switcher} ref={menuRef}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen((v) => !v)}
        aria-label={t('topbar.language')}
      >
        {LANGUAGE_LABELS[current] ?? current.toUpperCase()}
      </button>
      {open && (
        <div className={styles.menu}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              className={[styles.menuItem, lang === current ? styles.menuItemActive : ''].join(' ')}
              onClick={() => {
                void i18n.changeLanguage(lang);
                setOpen(false);
              }}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
