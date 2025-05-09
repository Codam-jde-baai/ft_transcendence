import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        customPink: {
          DEFAULT: '#902063', // Base color
          hover: '#b86a8a',   // Hover color
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
