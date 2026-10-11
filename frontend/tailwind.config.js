/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3e8',
          100: '#fde5d1',
          200: '#fbcba3',
          300: '#f9b175',
          400: '#f79747',
          500: '#f57d19',
          600: '#c46414',
          700: '#934b0f',
          800: '#62320a',
          900: '#311905',
        },
        secondary: {
          50: '#e8f5e9',
          100: '#d1e6d2',
          200: '#a3cda5',
          300: '#75b478',
          400: '#479b4b',
          500: '#19821e',
          600: '#146818',
          700: '#0f4e12',
          800: '#0a340c',
          900: '#051a06',
        },
        accent: {
          50: '#eef2ff',
          100: '#dce5ff',
          200: '#b9caff',
          300: '#96b0ff',
          400: '#7395ff',
          500: '#507bff',
          600: '#4062cc',
          700: '#304a99',
          800: '#203166',
          900: '#101933',
        }
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
        'heading': ['Montserrat', 'Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0,0,0,0.05)',
        'medium': '0 4px 20px rgba(0,0,0,0.1)',
        'hard': '0 8px 30px rgba(0,0,0,0.15)',
        'glow': '0 0 20px rgba(245,125,25,0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}