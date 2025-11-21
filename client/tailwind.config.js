/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': '#0a0a0a',
        'dark-lighter': '#1a1a1a',
        'dark-border': '#333333',
        'purple': '#7c3aed',
        'purple-dark': '#6d28d9',
        'green': '#10b981',
        'green-dark': '#059669'
      }
    },
  },
  plugins: [],
}