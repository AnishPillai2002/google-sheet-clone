/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sheets': {
          'blue': '#1a73e8',
          'hover': '#f8f9fa',
          'border': '#e0e0e0'
        }
      },
    },
  },
  plugins: [],
} 