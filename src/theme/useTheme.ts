import { useState } from 'react';
import { getStoredTheme, toggleTheme, type Theme } from './index';

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  function toggle() {
    setTheme(toggleTheme());
  }

  return { theme, toggle };
}
