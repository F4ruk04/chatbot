'use client';

import { ReactNode } from 'react';
import { useClientTheme } from '@/hooks/useClientTheme';

// This file is kept for backward compatibility but all theme functionality
// has been moved to the useClientTheme hook
export const ThemeContext = null;
export const ThemeProvider = ({ children }: { children: ReactNode }) => children;
export const useTheme = useClientTheme;
