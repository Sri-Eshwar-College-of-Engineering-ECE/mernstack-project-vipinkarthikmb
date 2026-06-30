module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
theme: {
extend: {
  colors: {
        dark: '#121212',
        light: '#ffffff',
      },
    keyframes: {
      slideIn: {
  '0%': { transform: 'translateX(100%)', opacity: 0 },
  '100%': { transform: 'translateX(0)', opacity: 1 },
},
    fadeInUp: {
      '0%': { opacity: 0, transform: 'translateY(30px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    
    'gradient-x': {
      '0%, 100%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
    },
    fadeIn: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    },
    fadeInUp: {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' }
    },
    slideIn: {
      '0%': { opacity: 0, transform: 'translateX(-20px)' },
      '100%': { opacity: 1, transform: 'translateX(0)' }
    }
  },
  animation: {
    'fade-in-up': 'fadeInUp 0.7s ease-out',
    'gradient-x': 'gradient-x 8s ease infinite',
    slideIn: 'slideIn 0.5s ease-out',
    'fade-in-up': 'fadeInUp 0.5s ease-out',
    'bounce-slow': 'bounce 2s infinite',
    'fade-in': 'fadeIn 0.5s ease-in-out',
    'fade-in-up': 'fadeInUp 0.6s ease-out',
    'slide-in': 'slideIn 0.6s ease-in-out',
    'bounce-slow': 'bounce 3s infinite',
    'spin-slow': 'spin 3s linear infinite',
  },
},
},
plugins: [],
}

