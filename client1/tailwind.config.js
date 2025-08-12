/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          foreground: '#fff',
        },
        secondary: {
          DEFAULT: '#fbbf24', // amber-400
          foreground: '#1e293b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        heading: [
          'Montserrat',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  safelist: [
    'bg-primary',
    'text-primary',
    'bg-secondary',
    'text-secondary',
    'bg-primary-foreground',
    'text-primary-foreground',
    'bg-secondary-foreground',
    'text-secondary-foreground',
  ],
  plugins: [],
}