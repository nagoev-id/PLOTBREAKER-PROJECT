/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/(frontend)/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/(frontend)/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-euclid)', 'system-ui', 'sans-serif'],
      },
      colors: {
        slate: require('tailwindcss/colors').neutral,
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
