/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        storage: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        packing: {
          50: '#fefce8',
          500: '#eab308',
          600: '#ca8a04',
        },
        finish: {
          50: '#faf5ff',
          500: '#a855f7',
          600: '#9333ea',
        },
        dispatch: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        missing: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        returned: {
          50: '#f0fdfa',
          500: '#14b8a6',
          600: '#0d9488',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
