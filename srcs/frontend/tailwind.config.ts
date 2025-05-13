import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx,html}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;