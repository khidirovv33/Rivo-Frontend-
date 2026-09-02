export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'rivo.theme';

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage недоступен (приватный режим и т.п.) — тема просто не переживёт перезагрузку.
  }
}

// Применяется синхронно при загрузке модуля (импортируется в main.tsx до рендера React),
// чтобы избежать вспышки светлой темы перед гидратацией.
applyTheme(getStoredTheme());

export function toggleTheme(): Theme {
  const next: Theme = getStoredTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
