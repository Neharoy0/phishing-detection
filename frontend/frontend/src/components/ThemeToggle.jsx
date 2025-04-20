import React from 'react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      className="p-2 bg-gray-200 dark:bg-gray-700 text-sm rounded hover:ring"
      onClick={toggleTheme}
    >
      Toggle {dark ? 'Light' : 'Dark'} Mode
    </button>
  );
}
