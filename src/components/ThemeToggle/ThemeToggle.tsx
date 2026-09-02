import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/useTheme';
import { MoonIcon, SunIcon } from '../icons';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggle}
      aria-label={isDark ? t('topbar.themeToLight') : t('topbar.themeToDark')}
      title={isDark ? t('topbar.themeToLight') : t('topbar.themeToDark')}
    >
      {isDark ? <MoonIcon width={17} height={17} /> : <SunIcon width={17} height={17} />}
    </button>
  );
}
