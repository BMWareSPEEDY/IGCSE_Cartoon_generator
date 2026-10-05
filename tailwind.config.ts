import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        archive: {
          950: '#030c08',
          900: '#081712',
          850: '#0c201a',
          800: '#122a22',
          700: '#1c3e34',
          600: '#255547',
          500: '#326f5e',
        },
        verdigris: {
          600: '#236052',
          500: '#2d7a68',
          400: '#3aa890',
          300: '#61c5af',
          200: '#9fe1d1',
        },
        brass: {
          800: '#5e450f',
          700: '#7c5d18',
          600: '#9a7420',
          500: '#c29b38',
          400: '#d4af37',
          300: '#e5c768',
          200: '#f1dda0',
          100: '#faf2d6',
        },
        parchment: {
          50: '#fbf8f1',
          100: '#f5efe1',
          200: '#eee3cb',
          300: '#dfd0b0',
          400: '#cbb892',
          800: '#382f22',
          900: '#221c14',
        },
        walnut: {
          950: '#0f0a05',
          900: '#1a120a',
          800: '#2e2013',
          700: '#46321f',
        },
        ink: {
          pure: '#08080a',
          deep: '#101216',
          charcoal: '#1d2026',
        }
      },
      fontFamily: {
        display: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        ink: ['"Pirata One"', 'Cinzel', 'Georgia', 'serif'],
        editorial: ['"EB Garamond"', 'Cormorant Garamond', 'serif'],
        sans: ['Syne', 'Inter', 'sans-serif'],
        typewriter: ['"Courier Prime"', 'Courier', 'monospace'],
      },
      boxShadow: {
        'brass-glow': '0 0 25px rgba(212, 175, 55, 0.25)',
        'brass-glow-lg': '0 0 45px rgba(212, 175, 55, 0.4)',
        'verdigris-glow': '0 0 30px rgba(58, 168, 144, 0.2)',
        'deep-bevel': 'inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 10px 30px rgba(0, 0, 0, 0.8)',
        'archival-matte': '0 20px 50px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(194, 155, 56, 0.2)',
      },
      backgroundImage: {
        'paper-grain': "radial-gradient(circle at 50% 50%, rgba(245, 239, 225, 0.03) 0%, rgba(0, 0, 0, 0.4) 100%)",
        'brass-gradient': "linear-gradient(135deg, #e5c768 0%, #c29b38 50%, #7c5d18 100%)",
        'brass-metal': "linear-gradient(180deg, #f1dda0 0%, #c29b38 35%, #7c5d18 80%, #9a7420 100%)",
        'emerald-vignette': "radial-gradient(ellipse at center, rgba(12, 32, 26, 0.5) 0%, rgba(3, 12, 8, 0.95) 100%)",
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
