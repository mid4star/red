import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy brand tokens
        oceanPrimary: '#003366',
        reefTeal: '#008080',
        sandyBeige: '#F5DEB3',
        whiteFoam: '#F8FAFC',
        accentCoral: '#FF6B6B',
        surfaceDark: '#0F172A',

        // Theme-aware tokens (uses CSS vars)
        'th-bg':      'var(--bg-base)',
        'th-surface': 'var(--bg-surface)',
        'th-surface2':'var(--bg-surface-2)',
        'th-border':  'var(--border-color)',
        'th-text':    'var(--text-primary)',
        'th-muted':   'var(--text-secondary)',
        'th-dim':     'var(--text-muted)',
        'th-input':   'var(--input-bg)',
        'th-sidebar': 'var(--sidebar-bg)',
      },
      fontFamily: {
        arabic: ['var(--font-cairo)', 'sans-serif'],
        alyamama: ['Alyamama', 'Cairo', 'sans-serif'],
        english: ['var(--font-inter)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
