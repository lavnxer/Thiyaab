/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-burgundy': '#800020',
        'brand-cream': '#F0DFCD',
        'brand-dark': '#2c0510',
      },
      fontFamily: {
        'arabic': ['Tajawal', 'Cairo', 'Almarai', 'sans-serif'],
      },
      fontSize: {
        'hero': '25vw',
      }
    },
  },
  plugins: [],
}
