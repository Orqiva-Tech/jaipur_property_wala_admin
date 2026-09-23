/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#07160F',
          900: '#0C2318',
          800: '#123625',
          700: '#194A33',
          600: '#236546',
          500: '#2F855D',
          400: '#48A578',
          300: '#76C39C',
          200: '#B0E0C7',
          100: '#DDF3E7',
          50: '#F0F9F4'
        },
        gold: {
          950: '#3D2A0A',
          900: '#5C4010',
          800: '#7E5718',
          700: '#A37222',
          600: '#C2892C',
          500: '#D99F3B',
          400: '#E7B761',
          300: '#F1CF8F',
          200: '#F7E4BF',
          100: '#FBF3E3',
          50: '#FDFBF5'
        },
        charcoal: {
          950: '#0B0D0C',
          900: '#111815',
          800: '#1F2924',
          700: '#33403A',
          600: '#4A5B53',
          500: '#677970',
          400: '#8A9B92',
          300: '#B3C0BA',
          200: '#D8E0DC',
          100: '#EEF2F0',
          50: '#F7F9F8'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
