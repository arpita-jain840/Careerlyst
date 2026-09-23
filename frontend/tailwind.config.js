/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17212b',
        forest: '#16705a',
        'forest-dark': '#0f5746',
        mist: '#f5f7f6',
        line: '#dce5e1',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 48px rgba(23, 33, 43, 0.08)',
      },
    },
  },
  plugins: [],
}
