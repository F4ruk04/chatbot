'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeHook {
  theme: Theme;
  toggleTheme: () => void;
}

export function useClientTheme(): ThemeHook {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev: Theme) => (prev === 'light' ? 'dark' : 'light'));
  };

  if (!mounted) {
    return { theme: 'light', toggleTheme };
  }

  return { theme, toggleTheme };
}
