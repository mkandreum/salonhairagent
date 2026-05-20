import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Salón Luxe Concierge — Paleta Noir & Or
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E2C060',
          pale:    '#F0D98A',
          dim:     '#8A6A20',
        },
        noir: {
          950: '#0B0A09',
          900: '#111009',
          850: '#15140D',
          800: '#1A1913',
          700: '#211F17',
          600: '#2A271D',
          500: '#353120',
        },
        slate: {
          text:  'rgba(205,202,190,1)',
          muted: 'rgba(150,146,128,1)',
          faint: 'rgba(90,87,75,1)',
        },
        status: {
          confirmed: '#4ADE80',
          pending:   '#FACC15',
          cancelled: '#F87171',
        },
      },
      fontFamily: {
        sans:    ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono:    ['Geist Mono', 'monospace'],
      },
      borderRadius: {
        'card':    '16px',
        'card-lg': '20px',
        'pill':    '9999px',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(201,168,76,0.15)',
        'gold-md': '0 0 24px rgba(201,168,76,0.2)',
        'card':    '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,168,76,0.2)',
      },
      backgroundImage: {
        'gold-shine': 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.02) 100%)',
        'card-surface': 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)',
        'sidebar': 'linear-gradient(180deg, #0F0E08 0%, #0B0A07 100%)',
        'topbar': 'linear-gradient(90deg, rgba(15,14,8,0.97) 0%, rgba(11,10,7,0.97) 100%)',
        'gold-gradient': 'linear-gradient(90deg, #C9A84C 0%, #E2C060 50%, #C9A84C 100%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':    'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
