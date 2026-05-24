import { createStitches } from '@stitches/react';

export const { styled, css, globalCss, keyframes, getCssText, theme, createTheme, config } = createStitches({
  theme: {
    colors: {
      oceanPrimary: '#003366',
      reefTeal: '#008080',
      sandyBeige: '#F5DEB3',
      whiteFoam: '#F8FAFC',
      accentCoral: '#FF6B6B',
      surfaceDark: '#0F172A',
      textLight: '#F8FAFC',
      textDark: '#003366',
      alertViolation: '#EF4444',
      healthyGreen: '#10B981',
      warningAmber: '#F59E0B',
    },
    space: {
      1: '4px',
      2: '8px',
      3: '16px',
      4: '24px',
      5: '32px',
      6: '48px',
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '16px',
      xl: '24px',
      full: '9999px',
    },
    shadows: {
      1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
      4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
      5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
    },
    fonts: {
      arabic: 'Cairo, sans-serif',
      english: 'Inter, sans-serif',
    },
  },
  media: {
    xs: '(min-width: 320px)',
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    xxl: '(min-width: 1920px)',
  },
});

export const darkTheme = createTheme({
  colors: {
    oceanPrimary: '#0F172A', // Dark mode override
    whiteFoam: '#1E293B',
    textDark: '#F8FAFC',
    sandyBeige: '#334155', // darker element for background
  },
});
